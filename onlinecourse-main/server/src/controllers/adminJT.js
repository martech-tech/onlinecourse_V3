/**
 * Admin J&T Express Controller
 *
 * Provides admin endpoints for:
 *   - Listing paid orders with J&T shipping status
 *   - Creating J&T shipments (get billCode)
 *   - Cancelling shipments
 *   - Querying live tracking
 */

const crypto = require('crypto');
const { getPool } = require('../db');

function randomShippingId() {
	return `SH${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function loadJT() {
	try {
		return require('../services/jtExpress');
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// 1. List paid orders with J&T shipping info
// ---------------------------------------------------------------------------

async function listJTOrders(_req, res) {
	try {
		const db = getPool();

		const [orders] = await db.query(
			`SELECT
				so.id, so.public_id, so.receiver_name, so.customer_email, so.customer_phone,
				so.shipping_address, so.total, so.status, so.shipping_status, so.bill_code,
				so.tracking_number, so.created_at,
				sh.id AS ship_id, sh.tx_logistic_id, sh.bill_code AS jt_bill_code,
				sh.sort_code, sh.status AS jt_status, sh.created_at AS jt_created_at
			FROM shop_orders so
			LEFT JOIN shipping_orders sh ON sh.order_id = so.id
			WHERE so.status = 'paid'
			ORDER BY so.id DESC`
		);

		const orderIds = orders.map((o) => o.id);
		let itemsMap = {};
		if (orderIds.length) {
			const [items] = await db.query(
				`SELECT order_id, product_name, quantity, unit_price, line_total
				FROM shop_order_items
				WHERE order_id IN (?)
				ORDER BY id ASC`,
				[orderIds]
			);
			for (const it of items) {
				if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
				itemsMap[it.order_id].push({
					productName: it.product_name,
					quantity: Number(it.quantity),
					unitPrice: Number(it.unit_price),
					lineTotal: Number(it.line_total),
				});
			}
		}

		const result = orders.map((o) => ({
			id: o.id,
			publicId: o.public_id,
			receiverName: o.receiver_name,
			email: o.customer_email,
			phone: o.customer_phone,
			shippingAddress: o.shipping_address,
			total: Number(o.total),
			shippingStatus: o.shipping_status || 'pending',
			billCode: o.jt_bill_code || o.bill_code || null,
			trackingNumber: o.tracking_number || null,
			sortCode: o.sort_code || null,
			txLogisticId: o.tx_logistic_id || null,
			jtStatus: o.jt_status || null,
			hasShippingOrder: Boolean(o.ship_id),
			createdAt: o.created_at,
			items: itemsMap[o.id] || [],
		}));

		return res.json({ orders: result });
	} catch (err) {
		console.error('listJTOrders error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 2. Create J&T shipment for an order
// ---------------------------------------------------------------------------

async function createShipment(req, res) {
	try {
		const jt = loadJT();
		if (!jt) return res.status(503).json({ error: 'J&T Express service ไม่พร้อมใช้งาน (ตรวจสอบ env vars)' });

		const db = getPool();
		const orderId = Number(req.body?.orderId);
		if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

		// Get order
		const [orderRows] = await db.query(
			`SELECT id, public_id, status, total, receiver_name, customer_phone, shipping_address
			FROM shop_orders WHERE id = ? LIMIT 1`,
			[orderId]
		);
		const order = Array.isArray(orderRows) && orderRows.length ? orderRows[0] : null;
		if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
		if (order.status !== 'paid') return res.status(400).json({ error: 'คำสั่งซื้อยังไม่ได้ชำระเงิน' });

		// Check if already has J&T shipment
		const [existingShip] = await db.query(
			'SELECT id, bill_code FROM shipping_orders WHERE order_id = ? LIMIT 1',
			[orderId]
		);
		const existing = Array.isArray(existingShip) && existingShip.length ? existingShip[0] : null;
		if (existing?.bill_code) {
			return res.status(409).json({ error: 'สร้างเลขพัสดุแล้ว', billCode: existing.bill_code });
		}

		// Parse shipping address
		let addrObj = {};
		try { addrObj = JSON.parse(order.shipping_address || '{}'); } catch { /* ignore */ }

		// Get order items
		const [itemRows] = await db.query(
			'SELECT product_name, quantity, unit_price FROM shop_order_items WHERE order_id = ?',
			[orderId]
		);

		const config = jt.getConfig();
		const txLogisticId = existing?.tx_logistic_id || randomShippingId();

		// Call J&T API
		const result = await jt.createOrder({
			txlogisticId: txLogisticId,
			receiver: {
				name: order.receiver_name || '',
				phone: order.customer_phone || '',
				address: addrObj.address || '',
				province: addrObj.province || '',
				city: addrObj.city || '',
				district: addrObj.district || '',
				postCode: addrObj.postCode || '',
			},
			items: itemRows.map((it) => ({
				name: it.product_name,
				quantity: Number(it.quantity) || 1,
				value: Number(it.unit_price) || 0,
			})),
			weight: 1,
			itemsValue: Number(order.total) || 0,
		});

		if (!result.success) {
			return res.status(502).json({
				error: 'สร้างเลขพัสดุกับ J&T ไม่สำเร็จ',
				jtMessage: result.message,
			});
		}

		// Upsert shipping_orders
		if (existing) {
			await db.query(
				`UPDATE shipping_orders SET bill_code = ?, sort_code = ?, status = 'submitted',
				 jt_create_response = ?, updated_at = NOW(3) WHERE id = ?`,
				[result.billCode, result.sortCode, JSON.stringify(result.raw), existing.id]
			);
		} else {
			await db.query(
				`INSERT INTO shipping_orders (
					order_id, tx_logistic_id, bill_code, sort_code, status,
					sender_name, sender_phone, sender_address, sender_province, sender_city, sender_district, sender_post_code,
					receiver_name, receiver_phone, receiver_address, receiver_province, receiver_city, receiver_district, receiver_post_code,
					jt_create_response
				) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
				[
					orderId, txLogisticId, result.billCode, result.sortCode, 'submitted',
					config.sender.name, config.sender.phone, config.sender.address,
					config.sender.prov, config.sender.city, config.sender.area, config.sender.postCode,
					order.receiver_name || '', order.customer_phone || '',
					addrObj.address || '', addrObj.province || '', addrObj.city || '',
					addrObj.district || '', addrObj.postCode || '',
					JSON.stringify(result.raw),
				]
			);
		}

		// Update shop_orders
		await db.query(
			`UPDATE shop_orders SET bill_code = ?, shipping_status = 'processing' WHERE id = ?`,
			[result.billCode, orderId]
		);

		return res.json({
			ok: true,
			billCode: result.billCode,
			sortCode: result.sortCode,
			txlogisticId: result.txlogisticId,
		});
	} catch (err) {
		console.error('adminJT createShipment error:', err);
		return res.status(500).json({ error: err.message || 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 3. Cancel J&T shipment
// ---------------------------------------------------------------------------

async function cancelShipment(req, res) {
	try {
		const jt = loadJT();
		if (!jt) return res.status(503).json({ error: 'J&T Express service ไม่พร้อมใช้งาน' });

		const db = getPool();
		const orderId = Number(req.body?.orderId);
		const reason = req.body?.reason || 'ยกเลิกคำสั่งซื้อ';

		if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

		const [rows] = await db.query(
			'SELECT id, tx_logistic_id, bill_code, status FROM shipping_orders WHERE order_id = ? LIMIT 1',
			[orderId]
		);
		const ship = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!ship) return res.status(404).json({ error: 'ไม่พบข้อมูลการจัดส่ง' });
		if (['delivered', 'cancelled'].includes(ship.status)) {
			return res.status(400).json({ error: `ไม่สามารถยกเลิกได้ สถานะ: ${ship.status}` });
		}

		const result = await jt.cancelOrder({ txlogisticId: ship.tx_logistic_id, reason });
		if (!result.success) {
			return res.status(502).json({ error: 'ยกเลิกกับ J&T ไม่สำเร็จ', jtMessage: result.message });
		}

		await db.query("UPDATE shipping_orders SET status = 'cancelled' WHERE id = ?", [ship.id]);
		await db.query("UPDATE shop_orders SET shipping_status = 'pending', bill_code = NULL WHERE id = ?", [orderId]);

		return res.json({ ok: true });
	} catch (err) {
		console.error('adminJT cancelShipment error:', err);
		return res.status(500).json({ error: err.message || 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 4. Query J&T tracking by billCode
// ---------------------------------------------------------------------------

async function queryTracking(req, res) {
	try {
		const jt = loadJT();
		if (!jt) return res.status(503).json({ error: 'J&T Express service ไม่พร้อมใช้งาน' });

		const billCode = req.params.billCode;
		if (!billCode) return res.status(400).json({ error: 'Missing billCode' });

		const result = await jt.queryTracking(billCode);
		if (!result.success) {
			return res.status(502).json({ error: 'J&T query ไม่สำเร็จ', jtMessage: result.message });
		}

		const traces = result.traces.map((trace) => ({
			billCode: trace.billCode,
			details: (trace.details || []).map((d) => ({
				scanType: d.scanType || '',
				description: jt.scanTypeLabel(d.scanType),
				scanTime: d.scanTime || '',
				scanCity: d.city || '',
				province: d.province || '',
				entrySiteName: d.entrySiteName || '',
			})),
		}));

		return res.json({ ok: true, traces });
	} catch (err) {
		console.error('adminJT queryTracking error:', err);
		return res.status(500).json({ error: err.message || 'internal error' });
	}
}

module.exports = {
	listJTOrders,
	createShipment,
	cancelShipment,
	queryTracking,
};
