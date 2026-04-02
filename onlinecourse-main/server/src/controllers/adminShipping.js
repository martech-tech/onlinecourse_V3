/**
 * Admin Shipping Controller
 *
 * Manages book shipping workflow:
 *   pending → processing (printed slip) → shipped (tracking imported)
 *
 * Features:
 *   - List paid orders with items
 *   - Update shipping status
 *   - Save tracking number & notes
 *   - Bulk print → mark as processing
 *   - Bulk import tracking numbers → mark as shipped
 */

const { getPool } = require('../db');

// ---------------------------------------------------------------------------
// 1. List paid orders with shipping info & items
// ---------------------------------------------------------------------------

async function listShippingOrders(_req, res) {
	try {
		const db = getPool();

		let orders;
		try {
			[orders] = await db.query(
				`SELECT
					id, public_id, receiver_name, customer_email, customer_phone, shipping_address,
					total, status, shipping_status, tracking_number, shipping_notes, printed_at, shipped_at,
					created_at
				FROM shop_orders
				WHERE status = 'paid'
				ORDER BY id DESC`
			);
		} catch (colErr) {
			if (colErr && typeof colErr === 'object' && colErr.code === 'ER_BAD_FIELD_ERROR') {
				[orders] = await db.query(
					`SELECT
						id, public_id, receiver_name, customer_email, customer_phone, shipping_address,
						total, status,
						'pending' AS shipping_status, NULL AS tracking_number, NULL AS shipping_notes,
						NULL AS printed_at, NULL AS shipped_at,
						created_at
					FROM shop_orders
					WHERE status = 'paid'
					ORDER BY id DESC`
				);
			} else {
				throw colErr;
			}
		}

		if (!orders.length) return res.json({ orders: [], itemsMap: {} });

		const orderIds = orders.map((o) => o.id);

		const [items] = await db.query(
			`SELECT order_id, product_name, quantity, unit_price, line_total
			FROM shop_order_items
			WHERE order_id IN (?)
			ORDER BY id ASC`,
			[orderIds]
		);

		const itemsMap = {};
		for (const it of items) {
			if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
			itemsMap[it.order_id].push({
				productName: it.product_name,
				quantity: Number(it.quantity),
				unitPrice: Number(it.unit_price),
				lineTotal: Number(it.line_total),
			});
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
			trackingNumber: o.tracking_number,
			notes: o.shipping_notes,
			printedAt: o.printed_at,
			shippedAt: o.shipped_at,
			createdAt: o.created_at,
			items: itemsMap[o.id] || [],
		}));

		return res.json({ orders: result });
	} catch (err) {
		console.error('listShippingOrders error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 2. Update shipping status of a single order
// ---------------------------------------------------------------------------

async function updateShippingStatus(req, res) {
	try {
		const db = getPool();
		const orderId = Number(req.params.id);
		const { status } = req.body || {};

		if (!['pending', 'processing', 'shipped'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		const extra = {};
		if (status === 'processing') extra.printed_at = new Date();
		if (status === 'shipped') extra.shipped_at = new Date();

		const sets = ['shipping_status = ?'];
		const vals = [status];
		for (const [k, v] of Object.entries(extra)) {
			sets.push(`${k} = ?`);
			vals.push(v);
		}
		vals.push(orderId);

		await db.query(
			`UPDATE shop_orders SET ${sets.join(', ')} WHERE id = ? AND status = 'paid'`,
			vals
		);

		return res.json({ ok: true });
	} catch (err) {
		console.error('updateShippingStatus error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 3. Save tracking number & notes for a single order
// ---------------------------------------------------------------------------

async function saveTrackingNotes(req, res) {
	try {
		const db = getPool();
		const orderId = Number(req.params.id);
		const { trackingNumber, notes } = req.body || {};

		await db.query(
			`UPDATE shop_orders
			SET tracking_number = ?, shipping_notes = ?
			WHERE id = ? AND status = 'paid'`,
			[trackingNumber || null, notes || null, orderId]
		);

		return res.json({ ok: true });
	} catch (err) {
		console.error('saveTrackingNotes error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 4. Bulk print → mark selected orders as "processing"
// ---------------------------------------------------------------------------

async function bulkPrint(req, res) {
	try {
		const db = getPool();
		const { orderIds } = req.body || {};

		if (!Array.isArray(orderIds) || !orderIds.length) {
			return res.status(400).json({ error: 'Missing orderIds' });
		}

		const ids = orderIds.map(Number).filter(Boolean);
		const now = new Date();

		await db.query(
			`UPDATE shop_orders
			SET shipping_status = 'processing', printed_at = ?
			WHERE id IN (?) AND status = 'paid' AND shipping_status = 'pending'`,
			[now, ids]
		);

		return res.json({ ok: true, count: ids.length });
	} catch (err) {
		console.error('bulkPrint error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 5. Bulk import tracking numbers → mark as "shipped"
//    Body: { entries: [{ orderId, trackingNumber }] }
// ---------------------------------------------------------------------------

async function bulkImportTracking(req, res) {
	try {
		const db = getPool();
		const { entries } = req.body || {};

		if (!Array.isArray(entries) || !entries.length) {
			return res.status(400).json({ error: 'Missing entries' });
		}

		const now = new Date();
		let updated = 0;

		for (const entry of entries) {
			const orderId = Number(entry.orderId);
			const tracking = String(entry.trackingNumber || '').trim();
			if (!orderId || !tracking) continue;

			const [result] = await db.query(
				`UPDATE shop_orders
				SET tracking_number = ?, shipping_status = 'shipped', shipped_at = ?
				WHERE id = ? AND status = 'paid'`,
				[tracking, now, orderId]
			);
			if (result.affectedRows > 0) updated++;
		}

		return res.json({ ok: true, updated });
	} catch (err) {
		console.error('bulkImportTracking error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

module.exports = {
	listShippingOrders,
	updateShippingStatus,
	saveTrackingNotes,
	bulkPrint,
	bulkImportTracking,
};
