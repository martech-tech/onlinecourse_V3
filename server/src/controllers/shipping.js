/**
 * Shipping Controller - J&T Express Integration
 *
 * Handles:
 * 1. Saving shipping address during checkout (pre-payment)
 * 2. Creating J&T shipment after payment success
 * 3. Querying tracking status
 * 4. Receiving J&T callback webhooks (push tracking)
 * 5. Cancelling shipments
 *
 * Import paths assume files are placed into server/src/controllers/
 */

const crypto = require('crypto');
const { getPool } = require('../db');
const jtExpress = require('../services/jtExpress');

function randomShippingId() {
	return `SH${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// 1. Save / update shipping address on an order (pre-payment)
// ---------------------------------------------------------------------------

async function saveShippingAddress(req, res) {
	try {
		const db = getPool();
		const body = req.body || {};
		const orderPublicId = body.orderPublicId || req.params.orderPublicId;

		if (!orderPublicId) return res.status(400).json({ error: 'Missing orderPublicId' });

		const receiverName = String(body.receiverName || '').trim();
		const receiverPhone = String(body.receiverPhone || '').trim();
		const receiverAddress = String(body.receiverAddress || '').trim();
		const receiverProvince = String(body.receiverProvince || '').trim();
		const receiverCity = String(body.receiverCity || '').trim();
		const receiverDistrict = String(body.receiverDistrict || '').trim();
		const receiverPostCode = String(body.receiverPostCode || '').trim();

		if (!receiverName) return res.status(400).json({ error: 'กรุณากรอกชื่อผู้รับ' });
		if (!receiverPhone) return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์' });
		if (!receiverAddress) return res.status(400).json({ error: 'กรุณากรอกที่อยู่' });
		if (!receiverProvince) return res.status(400).json({ error: 'กรุณาเลือกจังหวัด' });
		if (!receiverDistrict) return res.status(400).json({ error: 'กรุณาเลือกอำเภอ/เขต' });
		if (!receiverPostCode) return res.status(400).json({ error: 'กรุณากรอกรหัสไปรษณีย์' });

		// Find the shop order
		const [orderRows] = await db.query(
			'SELECT id, status FROM shop_orders WHERE public_id = ? LIMIT 1',
			[orderPublicId]
		);
		const order = Array.isArray(orderRows) && orderRows.length ? orderRows[0] : null;
		if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });

		// Update shipping info on shop_orders
		await db.query(
			`UPDATE shop_orders
			SET receiver_name = ?, customer_phone = ?, shipping_address = ?
			WHERE id = ?`,
			[
				receiverName,
				receiverPhone,
				JSON.stringify({ address: receiverAddress, province: receiverProvince, city: receiverCity, district: receiverDistrict, postCode: receiverPostCode }),
				order.id,
			]
		);

		// Upsert shipping_orders record (pre-create, status=pending)
		const config = jtExpress.getConfig();
		const txLogisticId = randomShippingId();

		const [existing] = await db.query(
			'SELECT id, tx_logistic_id FROM shipping_orders WHERE order_id = ? LIMIT 1',
			[order.id]
		);
		const existingRow = Array.isArray(existing) && existing.length ? existing[0] : null;

		if (existingRow) {
			await db.query(
				`UPDATE shipping_orders SET
					receiver_name = ?, receiver_phone = ?, receiver_address = ?,
					receiver_province = ?, receiver_city = ?, receiver_district = ?,
					receiver_post_code = ?, updated_at = NOW(3)
				WHERE id = ?`,
				[receiverName, receiverPhone, receiverAddress, receiverProvince, receiverCity, receiverDistrict, receiverPostCode, existingRow.id]
			);
		} else {
			await db.query(
				`INSERT INTO shipping_orders (
					order_id, tx_logistic_id, status,
					sender_name, sender_phone, sender_address,
					sender_province, sender_city, sender_district, sender_post_code,
					receiver_name, receiver_phone, receiver_address,
					receiver_province, receiver_city, receiver_district, receiver_post_code
				) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
				[
					order.id,
					txLogisticId,
					'pending',
					config.sender.name,
					config.sender.phone,
					config.sender.address,
					config.sender.prov,
					config.sender.city,
					config.sender.area,
					config.sender.postCode,
					receiverName,
					receiverPhone,
					receiverAddress,
					receiverProvince,
					receiverCity,
					receiverDistrict,
					receiverPostCode,
				]
			);
		}

		return res.json({ ok: true, message: 'บันทึกที่อยู่จัดส่งสำเร็จ' });
	} catch (err) {
		console.error('saveShippingAddress error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 2. Create J&T shipment (called after payment confirmed)
// ---------------------------------------------------------------------------

async function createShipment(req, res) {
	try {
		const db = getPool();
		const orderPublicId = req.body?.orderPublicId || req.params.orderPublicId;
		if (!orderPublicId) return res.status(400).json({ error: 'Missing orderPublicId' });

		// Get order + shipping info
		const [orderRows] = await db.query(
			`SELECT so.id, so.public_id, so.status, so.total,
				sh.id AS shipping_id, sh.tx_logistic_id, sh.bill_code, sh.status AS shipping_status,
				sh.receiver_name, sh.receiver_phone, sh.receiver_address,
				sh.receiver_province, sh.receiver_city, sh.receiver_district, sh.receiver_post_code,
				sh.weight, sh.length, sh.width, sh.height, sh.items_value
			FROM shop_orders so
			LEFT JOIN shipping_orders sh ON sh.order_id = so.id
			WHERE so.public_id = ?
			LIMIT 1`,
			[orderPublicId]
		);
		const row = Array.isArray(orderRows) && orderRows.length ? orderRows[0] : null;
		if (!row) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
		if (row.status !== 'paid') return res.status(400).json({ error: 'คำสั่งซื้อยังไม่ได้ชำระเงิน' });
		if (!row.shipping_id) return res.status(400).json({ error: 'ยังไม่มีข้อมูลที่อยู่จัดส่ง' });
		if (row.bill_code) return res.status(409).json({ error: 'สร้างเลขพัสดุแล้ว', billCode: row.bill_code });

		// Get order items
		const [itemRows] = await db.query(
			'SELECT product_name, quantity, unit_price FROM shop_order_items WHERE order_id = ?',
			[row.id]
		);

		// Call J&T API
		const result = await jtExpress.createOrder({
			txlogisticId: row.tx_logistic_id,
			receiver: {
				name: row.receiver_name,
				phone: row.receiver_phone,
				address: row.receiver_address,
				province: row.receiver_province,
				city: row.receiver_city,
				district: row.receiver_district,
				postCode: row.receiver_post_code,
			},
			items: itemRows.map((it) => ({
				name: it.product_name,
				quantity: Number(it.quantity) || 1,
				value: Number(it.unit_price) || 0,
			})),
			weight: Number(row.weight) || 1,
			length: Number(row.length) || null,
			width: Number(row.width) || null,
			height: Number(row.height) || null,
			itemsValue: Number(row.items_value) || Number(row.total) || 0,
		});

		if (!result.success) {
			await db.query(
				'UPDATE shipping_orders SET status = ?, jt_create_response = ? WHERE id = ?',
				['failed', JSON.stringify(result.raw), row.shipping_id]
			);
			return res.status(502).json({
				error: 'สร้างเลขพัสดุกับ J&T ไม่สำเร็จ',
				jtMessage: result.message,
				jtRaw: result.raw,
			});
		}

		// Update shipping_orders with billCode
		await db.query(
			`UPDATE shipping_orders
			SET bill_code = ?, sort_code = ?, status = 'submitted', jt_create_response = ?
			WHERE id = ?`,
			[result.billCode, result.sortCode, JSON.stringify(result.raw), row.shipping_id]
		);

		// Update shop_orders with shipping info
		await db.query(
			`UPDATE shop_orders SET shipping_status = 'submitted', bill_code = ? WHERE id = ?`,
			[result.billCode, row.id]
		);

		return res.json({
			ok: true,
			billCode: result.billCode,
			sortCode: result.sortCode,
			txlogisticId: result.txlogisticId,
			message: 'สร้างเลขพัสดุสำเร็จ',
		});
	} catch (err) {
		console.error('createShipment error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 3. Get tracking info
// ---------------------------------------------------------------------------

async function getTracking(req, res) {
	try {
		const db = getPool();
		const orderPublicId = req.params.orderPublicId || req.query.orderPublicId;
		const billCode = req.params.billCode || req.query.billCode;

		let shippingOrder;

		if (orderPublicId) {
			const [rows] = await db.query(
				`SELECT sh.*, so.public_id AS order_public_id
				FROM shipping_orders sh
				JOIN shop_orders so ON so.id = sh.order_id
				WHERE so.public_id = ?
				LIMIT 1`,
				[orderPublicId]
			);
			shippingOrder = Array.isArray(rows) && rows.length ? rows[0] : null;
		} else if (billCode) {
			const [rows] = await db.query(
				`SELECT sh.*, so.public_id AS order_public_id
				FROM shipping_orders sh
				JOIN shop_orders so ON so.id = sh.order_id
				WHERE sh.bill_code = ?
				LIMIT 1`,
				[billCode]
			);
			shippingOrder = Array.isArray(rows) && rows.length ? rows[0] : null;
		} else {
			return res.status(400).json({ error: 'Missing orderPublicId or billCode' });
		}

		if (!shippingOrder) return res.status(404).json({ error: 'ไม่พบข้อมูลการจัดส่ง' });

		// Get stored tracking events from DB
		const [events] = await db.query(
			`SELECT scan_type, description, scan_time, scan_city, province, entry_site_name, sig_pic_url, remark
			FROM shipping_tracking_events
			WHERE shipping_order_id = ?
			ORDER BY scan_time DESC, id DESC`,
			[shippingOrder.id]
		);

		// If billCode exists, also try to get live tracking from J&T query API
		let liveTraces = [];
		if (shippingOrder.bill_code) {
			try {
				const trackResult = await jtExpress.queryTracking(shippingOrder.bill_code);
				if (trackResult.success && trackResult.traces.length > 0) {
					const trace = trackResult.traces[0];
					liveTraces = (trace.details || []).map((d) => ({
						scanType: d.scanType || '',
						description: jtExpress.scanTypeLabel(d.scanType),
						scanTime: d.scanTime || '',
						scanCity: d.city || '',
						province: d.province || '',
						entrySiteName: d.entrySiteName || '',
					}));
				}
			} catch {
				// Live tracking failed, fall back to stored events only
			}
		}

		return res.json({
			shipping: {
				orderPublicId: shippingOrder.order_public_id,
				billCode: shippingOrder.bill_code,
				txlogisticId: shippingOrder.tx_logistic_id,
				status: shippingOrder.status,
				receiver: {
					name: shippingOrder.receiver_name,
					phone: shippingOrder.receiver_phone,
					address: shippingOrder.receiver_address,
					province: shippingOrder.receiver_province,
					city: shippingOrder.receiver_city,
					district: shippingOrder.receiver_district,
					postCode: shippingOrder.receiver_post_code,
				},
				createdAt: shippingOrder.created_at,
				updatedAt: shippingOrder.updated_at,
			},
			events: events.map((e) => ({
				scanType: e.scan_type,
				description: e.description || jtExpress.scanTypeLabel(e.scan_type),
				scanTime: e.scan_time,
				scanCity: e.scan_city,
				province: e.province,
				entrySiteName: e.entry_site_name,
				sigPicUrl: e.sig_pic_url || null,
				remark: e.remark || null,
			})),
			liveTraces,
		});
	} catch (err) {
		console.error('getTracking error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

// ---------------------------------------------------------------------------
// 4. J&T Callback webhook (status updates pushed by J&T)
//
// J&T sends POST with JSON body in this format:
// {
//   "billCode": "160015405384",
//   "details": [{
//     "city": "สวี",
//     "contactNumber": "0675911798",
//     "entrySite": "111503",
//     "entrySiteName": "CV03",
//     "province": "ชุมพร",
//     "scanTime": "2025-03-05T10:44:26",
//     "scanType": "Picked Up",
//     "scanners": "CV_新一",
//     "txlogisticid": "TESTID000707",
//     "weight": 0.0,
//     // Optional fields depending on scanType:
//     "sentTo": "807002",          // Departure
//     "sentToName": "07 Lop Buri", // Departure
//     "sigPicUrl": "https://...",  // Signature
//     "remark": "พัสดุเสียหาย"      // Problematic
//   }],
//   "logisticproviderid": "JNT"
// }
// ---------------------------------------------------------------------------

async function handleCallback(req, res) {
	try {
		const db = getPool();
		const data = req.body || {};

		const billCode = data.billCode || '';
		const details = Array.isArray(data.details) ? data.details : [];

		if (!billCode || details.length === 0) {
			// Acknowledge immediately to avoid re-delivery
			return res.json({ code: '1', message: 'ok (no data)' });
		}

		// Find the shipping order by billCode
		const [rows] = await db.query(
			'SELECT id, order_id, status FROM shipping_orders WHERE bill_code = ? LIMIT 1',
			[billCode]
		);
		const shippingOrder = Array.isArray(rows) && rows.length ? rows[0] : null;

		if (!shippingOrder) {
			// Try finding by txlogisticid from the first detail
			const txId = details[0]?.txlogisticid || '';
			if (txId) {
				const [txRows] = await db.query(
					'SELECT id, order_id, status FROM shipping_orders WHERE tx_logistic_id = ? LIMIT 1',
					[txId]
				);
				const txMatch = Array.isArray(txRows) && txRows.length ? txRows[0] : null;
				if (txMatch) {
					// Update bill_code now that we have it
					await db.query('UPDATE shipping_orders SET bill_code = ? WHERE id = ?', [billCode, txMatch.id]);
					await db.query('UPDATE shop_orders SET bill_code = ? WHERE id = ?', [billCode, txMatch.order_id]);
					// Process with this match
					await processCallbackDetails(db, txMatch, billCode, details, data);
					return res.json({ code: '1', message: 'success' });
				}
			}
			// Unknown billCode - acknowledge but ignore
			return res.json({ code: '1', message: 'ok (unknown billCode)' });
		}

		await processCallbackDetails(db, shippingOrder, billCode, details, data);
		return res.json({ code: '1', message: 'success' });
	} catch (err) {
		console.error('J&T callback error:', err);
		// Still return success to J&T to avoid re-delivery loops
		return res.json({ code: '1', message: 'ok (internal error logged)' });
	}
}

/**
 * Process callback detail items and insert tracking events + update status
 */
async function processCallbackDetails(db, shippingOrder, billCode, details, rawData) {
	let latestStatus = null;

	for (const detail of details) {
		const scanType = detail.scanType || '';
		const scanTime = detail.scanTime || null;
		const city = detail.city || '';
		const province = detail.province || '';
		const entrySite = detail.entrySite || '';
		const entrySiteName = detail.entrySiteName || '';
		const contactNumber = detail.contactNumber || '';
		const scanners = detail.scanners || '';
		const txlogisticid = detail.txlogisticid || '';
		const sigPicUrl = detail.sigPicUrl || null;
		const remark = detail.remark || null;
		const sentTo = detail.sentTo || null;
		const sentToName = detail.sentToName || null;

		const description = jtExpress.scanTypeLabel(scanType);

		// Insert tracking event
		await db.query(
			`INSERT INTO shipping_tracking_events
				(shipping_order_id, bill_code, scan_type, description, scan_time,
				 scan_city, province, entry_site, entry_site_name, contact_number,
				 scanners, sig_pic_url, remark, sent_to, sent_to_name, raw_json)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			[
				shippingOrder.id,
				billCode,
				scanType,
				description,
				scanTime ? new Date(scanTime) : null,
				city,
				province,
				entrySite,
				entrySiteName,
				contactNumber,
				scanners,
				sigPicUrl,
				remark,
				sentTo,
				sentToName,
				JSON.stringify(detail),
			]
		);

		// Track the latest status from this callback
		const mappedStatus = jtExpress.mapScanTypeToStatus(scanType);
		if (mappedStatus) {
			latestStatus = mappedStatus;
		}
	}

	// Update shipping order status with the latest scan event
	if (latestStatus && latestStatus !== shippingOrder.status) {
		await db.query(
			`UPDATE shipping_orders SET status = ?, jt_last_callback = ?, updated_at = NOW(3) WHERE id = ?`,
			[latestStatus, JSON.stringify(rawData), shippingOrder.id]
		);
		await db.query(
			`UPDATE shop_orders SET shipping_status = ? WHERE id = ?`,
			[latestStatus, shippingOrder.order_id]
		);
	}
}

// ---------------------------------------------------------------------------
// 5. Cancel shipment
// ---------------------------------------------------------------------------

async function cancelShipment(req, res) {
	try {
		const db = getPool();
		const orderPublicId = req.body?.orderPublicId || req.params.orderPublicId;
		const reason = req.body?.reason || 'ยกเลิกคำสั่งซื้อ';

		if (!orderPublicId) return res.status(400).json({ error: 'Missing orderPublicId' });

		const [rows] = await db.query(
			`SELECT sh.id, sh.tx_logistic_id, sh.bill_code, sh.status
			FROM shipping_orders sh
			JOIN shop_orders so ON so.id = sh.order_id
			WHERE so.public_id = ?
			LIMIT 1`,
			[orderPublicId]
		);
		const shippingOrder = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!shippingOrder) return res.status(404).json({ error: 'ไม่พบข้อมูลการจัดส่ง' });

		if (['delivered', 'cancelled'].includes(shippingOrder.status)) {
			return res.status(400).json({ error: 'ไม่สามารถยกเลิกได้ สถานะ: ' + shippingOrder.status });
		}

		// Call J&T cancel API
		const result = await jtExpress.cancelOrder({
			txlogisticId: shippingOrder.tx_logistic_id,
			reason,
		});

		if (!result.success) {
			return res.status(502).json({
				error: 'ยกเลิกกับ J&T ไม่สำเร็จ',
				jtMessage: result.message,
			});
		}

		await db.query(
			`UPDATE shipping_orders SET status = 'cancelled' WHERE id = ?`,
			[shippingOrder.id]
		);

		return res.json({ ok: true, message: 'ยกเลิกการจัดส่งสำเร็จ' });
	} catch (err) {
		console.error('cancelShipment error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

module.exports = {
	saveShippingAddress,
	createShipment,
	getTracking,
	handleCallback,
	cancelShipment,
};
