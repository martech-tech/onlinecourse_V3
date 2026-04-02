const express = require('express');
const { getPool } = require('../db');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/requireAuth');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

function buildBaseUrl(req) {
	// Prefer an explicit public base URL when available (useful in dev/proxy setups)
	const configured = process.env.PUBLIC_BASE_URL || process.env.API_PUBLIC_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
	if (configured) return String(configured).replace(/\/$/, '');

	const host = req.get('host');
	const proto = req.protocol;
	return `${proto}://${host}`;
}

function resolveImageUrl(req, imageUrl) {
	if (typeof imageUrl !== 'string') return '';
	if (imageUrl.startsWith('/uploads/')) {
		return `${buildBaseUrl(req)}${imageUrl}`;
	}
	return imageUrl;
}

function formatSoldCount(value) {
	const sold = Number(value) || 0;
	if (sold >= 1000) {
		const short = (sold / 1000).toFixed(1).replace(/\.0$/, '');
		return `Sold ${short}k`;
	}
	return `Sold ${sold}`;
}

function parseJsonArray(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String);
	try {
		const arr = JSON.parse(String(value));
		return Array.isArray(arr) ? arr.map(String) : [];
	} catch {
		return [];
	}
}

function randomPublicId(prefix) {
	// Format: SO-YYYYMMDD-HHMMSS-XXXX (e.g. SO-20260331-143052-A7F3)
	const now = new Date();
	const date = now.toISOString().slice(0, 10).replace(/-/g, '');
	const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
	const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
	return `${prefix.toUpperCase()}-${date}-${time}-${suffix}`;
}

function toNumber(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function clampInt(value, min, max) {
	const n = Math.floor(toNumber(value));
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

function normalizeCouponCode(code) {
	return String(code || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '');
}

function round2(value) {
	return Math.round((Number(value) || 0) * 100) / 100;
}

async function computeCouponDiscount({ db, couponCode, subtotal, userId }) {
	const code = normalizeCouponCode(couponCode);
	if (!code) return { code: null, couponId: null, discount: 0 };

	const [rows] = await db.query(
		`SELECT
			id, code, description, type, amount, min_subtotal, max_uses, uses_count, max_uses_per_user,
			starts_at, ends_at, is_active
		FROM shop_coupons
		WHERE code = ?
		LIMIT 1`,
		[code]
	);
	const coupon = Array.isArray(rows) && rows.length ? rows[0] : null;
	if (!coupon) return { error: 'Invalid coupon code' };
	if (!coupon.is_active) return { error: 'Coupon is not active' };

	const now = Date.now();
	const startsAt = coupon.starts_at ? new Date(coupon.starts_at).getTime() : null;
	const endsAt = coupon.ends_at ? new Date(coupon.ends_at).getTime() : null;
	if (startsAt != null && Number.isFinite(startsAt) && now < startsAt) return { error: 'Coupon not started' };
	if (endsAt != null && Number.isFinite(endsAt) && now > endsAt) return { error: 'Coupon expired' };

	const minSubtotal = coupon.min_subtotal != null ? Number(coupon.min_subtotal) : null;
	if (minSubtotal != null && subtotal < minSubtotal) {
		return { error: `Minimum subtotal is ${minSubtotal}` };
	}

	const maxUses = coupon.max_uses != null ? Number(coupon.max_uses) : null;
	const usesCount = Number(coupon.uses_count) || 0;
	if (maxUses != null && usesCount >= maxUses) return { error: 'Coupon usage limit reached' };

	const maxPerUser = coupon.max_uses_per_user != null ? Number(coupon.max_uses_per_user) : null;
	if (maxPerUser != null && userId) {
		const [urows] = await db.query(
			`SELECT COUNT(*) AS c
			FROM shop_coupon_redemptions
			WHERE coupon_id = ? AND user_id = ?`,
			[Number(coupon.id), Number(userId)]
		);
		const c = Array.isArray(urows) && urows.length ? Number(urows[0].c) || 0 : 0;
		if (c >= maxPerUser) return { error: 'Coupon usage limit reached for this user' };
	}

	let discount = 0;
	const amount = Number(coupon.amount) || 0;
	if (coupon.type === 'percent') {
		discount = (subtotal * amount) / 100;
	} else {
		discount = amount;
	}
	discount = round2(Math.min(Math.max(discount, 0), subtotal));

	return {
		code: coupon.code,
		couponId: Number(coupon.id),
		discount,
		description: coupon.description || null,
	};
}

router.get('/products', async (req, res) => {
	try {
		const db = getPool();
		const [productRows] = await db.query(
			`SELECT
				id, public_id, name, category, description, details, tags_json,
				price, compare_at_price, stock_left, sold_count,
				external_url, badge
			FROM shop_products
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		);

		const [imageRows] = await db.query(
			`SELECT product_id, image_url
			FROM shop_product_images
			ORDER BY sort_order ASC, id ASC`
		);

		const imagesByProduct = new Map();
		for (const row of imageRows) {
			if (!imagesByProduct.has(row.product_id)) imagesByProduct.set(row.product_id, []);
			imagesByProduct.get(row.product_id).push(resolveImageUrl(req, row.image_url));
		}

		const products = productRows.map((row) => ({
			id: row.public_id,
			name: row.name,
			category: row.category,
			description: row.description || '',
			details: row.details || undefined,
			tags: parseJsonArray(row.tags_json),
			price: Number(row.price) || 0,
			compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : Number(row.price) || 0,
			images: imagesByProduct.get(row.id) || [],
			stockLeft: Number(row.stock_left) || 0,
			soldCount: formatSoldCount(row.sold_count),
			externalUrl: row.external_url || undefined,
			badge: row.badge || undefined,
		}));

		return res.json({ products });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/banners', async (_req, res) => {
	try {
		const db = getPool();
		const [rows] = await db.query(
			`SELECT title, subtitle, image_url
			FROM shop_banners
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		);
		const banners = rows.map((row) => ({
			title: row.title,
			subtitle: row.subtitle || '',
			image: resolveImageUrl(_req, row.image_url),
		}));
		return res.json({ banners });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.post('/coupons/validate', optionalAuth, async (req, res) => {
	try {
		const db = getPool();
		const body = req.body && typeof req.body === 'object' ? req.body : {};
		const code = normalizeCouponCode(body.code);
		const subtotal = toNumber(body.subtotal);
		if (!code) return res.status(400).json({ error: 'Missing coupon code' });
		if (!(subtotal >= 0)) return res.status(400).json({ error: 'Invalid subtotal' });

		const userId = req.user?.id ? Number(req.user.id) : null;
		const result = await computeCouponDiscount({ db, couponCode: code, subtotal, userId });
		if (result.error) return res.status(400).json({ error: result.error });

		return res.json({
			ok: true,
			code: result.code,
			discount: result.discount,
			total: round2(Math.max(subtotal - result.discount, 0)),
			description: result.description,
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.post('/orders', optionalAuth, async (req, res) => {
	try {
		const db = getPool();
		const body = req.body && typeof req.body === 'object' ? req.body : {};

		const items = Array.isArray(body.items) ? body.items : [];
		if (!items.length) return res.status(400).json({ error: 'No items' });

		const shippingObj = body.shipping && typeof body.shipping === 'object' ? body.shipping : {};
		const shippingFirstName = String(shippingObj.firstName || '').trim();
		const shippingLastName = String(shippingObj.lastName || '').trim();
		const receiverName = shippingObj.receiverName
			? String(shippingObj.receiverName)
			: `${shippingFirstName} ${shippingLastName}`.trim();
		const customerEmail = body.shipping && typeof body.shipping === 'object' ? String(body.shipping.email || body.customerEmail || '') : String(body.customerEmail || '');
		const customerPhone = body.shipping && typeof body.shipping === 'object' ? String(body.shipping.phone || body.customerPhone || '') : String(body.customerPhone || '');
		const shippingAddress = body.shipping && typeof body.shipping === 'object' ? String(body.shipping.address || '') : '';
		const gatewayReference = body.gatewayReference ? String(body.gatewayReference) : null;

		const currency = typeof body.currency === 'string' && body.currency ? body.currency : 'THB';
		const couponCode = body.couponCode ? normalizeCouponCode(body.couponCode) : null;
		const normalizedItems = items
			.map((it) => ({
				productPublicId: String(it.id || it.productId || ''),
				name: String(it.name || ''),
				quantity: clampInt(it.quantity, 1, 9999),
				unitPrice: toNumber(it.price),
				compareAtPrice: it.compareAtPrice != null ? toNumber(it.compareAtPrice) : null,
			}))
			.filter((it) => it.productPublicId && it.name && it.unitPrice >= 0);

		if (!normalizedItems.length) return res.status(400).json({ error: 'Invalid items' });

		const computedSubtotal = round2(normalizedItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0));

		const actingUserId = body.userId ? Number(body.userId) : req.user?.id ? Number(req.user.id) : null;
		if (actingUserId) {
			const productIds = [...new Set(normalizedItems.map((it) => it.productPublicId))];
			if (productIds.length) {
				const [paidRows] = await db.query(
					`SELECT DISTINCT soi.product_public_id AS product_id
					FROM shop_order_items soi
					JOIN shop_orders so ON so.id = soi.order_id
					WHERE so.user_id = ? AND so.status = 'paid' AND soi.product_public_id IN (?)
					LIMIT 200`,
					[actingUserId, productIds]
				);

				if (Array.isArray(paidRows) && paidRows.length > 0) {
					const alreadyPaid = paidRows
						.map((row) => row.product_id)
						.filter((v) => typeof v === 'string' && v.length > 0);
					return res.status(409).json({
						error: 'Some products have already been paid',
						productIds: alreadyPaid,
					});
				}
			}
		}

		let appliedCoupon = { code: null, couponId: null, discount: 0 };
		if (couponCode) {
			const result = await computeCouponDiscount({
				db,
				couponCode,
				subtotal: computedSubtotal,
				userId: actingUserId,
			});
			if (result.error) return res.status(400).json({ error: result.error });
			appliedCoupon = { code: result.code, couponId: result.couponId, discount: result.discount };
		}

		const computedTotal = round2(Math.max(computedSubtotal - (appliedCoupon.discount || 0), 0));

		const publicId = randomPublicId('so');
		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();
			const [orderResult] = await conn.query(
				`INSERT INTO shop_orders (
					public_id, user_id, receiver_name, customer_email, customer_phone, shipping_address,
					currency, coupon_code, subtotal, discount_total, total, status, gateway, gateway_reference
				) VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending','paysolutions',?)`,
				[
					publicId,
					actingUserId,
					receiverName || null,
					customerEmail || null,
					customerPhone || null,
					shippingAddress || null,
					currency,
					appliedCoupon.code,
					computedSubtotal,
					appliedCoupon.discount || 0,
					computedTotal,
					gatewayReference,
				]
			);

			const orderId = orderResult.insertId;
			const values = normalizedItems.map((it) => [
				orderId,
				it.productPublicId,
				it.name,
				it.quantity,
				it.unitPrice,
				it.compareAtPrice,
				it.unitPrice * it.quantity,
			]);
			await conn.query(
				`INSERT INTO shop_order_items (
					order_id, product_public_id, product_name, quantity, unit_price, compare_at_price, line_total
				) VALUES ?`,
				[values]
			);

			await conn.commit();
			return res.json({
				orderPublicId: publicId,
				subtotal: computedSubtotal,
				discount: appliedCoupon.discount || 0,
				total: computedTotal,
				couponCode: appliedCoupon.code,
			});
		} catch (err) {
			try {
				await conn.rollback();
			} catch {
				// ignore
			}
			throw err;
		} finally {
			conn.release();
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/orders/my', requireAuth, async (req, res) => {
	try {
		const db = getPool();
		const userId = Number(req.user.id);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		// Try with shipping columns first; fall back if migration hasn't been run
		let orderRows;
		try {
			[orderRows] = await db.query(
				`SELECT
					id, public_id, coupon_code, discount_total, total, currency, status,
					shipping_status, tracking_number, bill_code,
					gateway, gateway_reference, gateway_status_code, created_at,
					receiver_name, customer_email, customer_phone, shipping_address
				FROM shop_orders
				WHERE user_id = ?
				ORDER BY created_at DESC, id DESC
				LIMIT 50`,
				[userId]
			);
		} catch (colErr) {
			if (colErr && typeof colErr === 'object' && colErr.code === 'ER_BAD_FIELD_ERROR') {
				[orderRows] = await db.query(
					`SELECT
						id, public_id, coupon_code, discount_total, total, currency, status,
						NULL AS shipping_status, NULL AS tracking_number, NULL AS bill_code,
						gateway, gateway_reference, gateway_status_code, created_at,
						receiver_name, customer_email, customer_phone, shipping_address
					FROM shop_orders
					WHERE user_id = ?
					ORDER BY created_at DESC, id DESC
					LIMIT 50`,
					[userId]
				);
			} else {
				throw colErr;
			}
		}

		const orderIds = orderRows.map((r) => r.id);
		let itemsByOrderId = new Map();
		if (orderIds.length) {
			const [itemRows] = await db.query(
				`SELECT
					order_id,
					product_public_id,
					product_name,
					quantity,
					unit_price,
					line_total
				FROM shop_order_items
				WHERE order_id IN (?)
				ORDER BY id ASC`,
				[orderIds]
			);
			itemsByOrderId = new Map();
			for (const row of itemRows) {
				if (!itemsByOrderId.has(row.order_id)) itemsByOrderId.set(row.order_id, []);
				itemsByOrderId.get(row.order_id).push({
					productId: row.product_public_id,
					name: row.product_name,
					quantity: Number(row.quantity) || 0,
					unitPrice: Number(row.unit_price) || 0,
					lineTotal: Number(row.line_total) || 0,
				});
			}
		}

		// Get shipping_orders data (J&T bill_code) if available
		let shippingByOrderId = new Map();
		if (orderIds.length) {
			try {
				const [shipRows] = await db.query(
					`SELECT order_id, bill_code, status AS jt_status
					FROM shipping_orders
					WHERE order_id IN (?)`,
					[orderIds]
				);
				for (const row of shipRows) {
					shippingByOrderId.set(row.order_id, row);
				}
			} catch {
				// shipping_orders table may not exist yet — ignore
			}
		}

		const orders = orderRows.map((row) => {
			const shipRow = shippingByOrderId.get(row.id);
			const billCode = row.bill_code || shipRow?.bill_code || null;
			const trackingNumber = row.tracking_number || null;

			return {
				id: row.public_id,
				couponCode: row.coupon_code || null,
				discountTotal: Number(row.discount_total) || 0,
				total: Number(row.total) || 0,
				currency: row.currency,
				status: row.status,
				shippingStatus: row.shipping_status || (shipRow?.jt_status) || null,
				trackingNumber: trackingNumber || billCode,
				billCode,
				gateway: row.gateway,
				gatewayReference: row.gateway_reference,
				gatewayStatusCode: row.gateway_status_code,
				createdAt: row.created_at,
				shipping: {
					receiverName: row.receiver_name,
					email: row.customer_email,
					phone: row.customer_phone,
					address: row.shipping_address,
				},
				items: itemsByOrderId.get(row.id) || [],
			};
		});

		return res.json({ orders });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.post('/orders/confirm', async (req, res) => {
	try {
		const db = getPool();
		const body = req.body && typeof req.body === 'object' ? req.body : {};
		const gatewayReference = body.gatewayReference ? String(body.gatewayReference) : '';
		const gatewayStatusCode = body.gatewayStatusCode ? String(body.gatewayStatusCode) : null;
		const paid = Boolean(body.paid);
		const cancelled = Boolean(body.cancelled);
		const nextStatus = paid ? 'paid' : cancelled ? 'cancelled' : 'pending';
		const raw = body.raw != null ? JSON.stringify(body.raw) : null;

		if (!gatewayReference) return res.status(400).json({ error: 'Missing gatewayReference' });


		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();
			const [rows] = await conn.query(
				`SELECT id, user_id, coupon_code, discount_total
				FROM shop_orders
				WHERE gateway = 'paysolutions' AND gateway_reference = ?
				LIMIT 1`,
				[gatewayReference]
			);
			const order = Array.isArray(rows) && rows.length ? rows[0] : null;
			if (!order) {
				await conn.rollback();
				return res.status(404).json({ error: 'Order not found' });
			}

			await conn.query(
				`UPDATE shop_orders
				SET status = ?, gateway_status_code = ?, gateway_raw_json = COALESCE(?, gateway_raw_json)
				WHERE id = ?`,
				[nextStatus, gatewayStatusCode, raw, order.id]
			);

			if (nextStatus === 'paid') {
				const code = normalizeCouponCode(order.coupon_code);
				const discountAmount = Number(order.discount_total) || 0;
				if (code && discountAmount > 0) {
					const [crows] = await conn.query(
						`SELECT id
						FROM shop_coupons
						WHERE code = ?
						LIMIT 1`,
						[code]
					);
					const coupon = Array.isArray(crows) && crows.length ? crows[0] : null;
					if (coupon) {
						const [ins] = await conn.query(
							`INSERT IGNORE INTO shop_coupon_redemptions (coupon_id, order_id, user_id, code, discount_amount)
							VALUES (?,?,?,?,?)`,
							[Number(coupon.id), Number(order.id), order.user_id != null ? Number(order.user_id) : null, code, discountAmount]
						);
						if (ins && typeof ins.affectedRows === 'number' && ins.affectedRows > 0) {
							await conn.query(
								`UPDATE shop_coupons SET uses_count = uses_count + 1 WHERE id = ?`,
								[Number(coupon.id)]
							);
						}
					}
				}

				// ── Auto-enroll: if purchased products are linked to courses, enroll user ──
				if (order.user_id) {
					try {
						const [linkedCourses] = await conn.query(
							`SELECT DISTINCT c.id AS course_id
							FROM shop_order_items soi
							JOIN shop_products sp ON sp.public_id COLLATE utf8mb4_general_ci = soi.product_public_id
							JOIN courses c ON c.book_product_id = sp.id
							WHERE soi.order_id = ?
							  AND c.status = 'published'`,
							[order.id]
						);
						for (const row of (Array.isArray(linkedCourses) ? linkedCourses : [])) {
							const courseId = Number(row.course_id);
							const userId = Number(order.user_id);

							// Skip if already enrolled
							const [existingEnroll] = await conn.query(
								'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
								[userId, courseId]
							);
							if (Array.isArray(existingEnroll) && existingEnroll.length > 0) continue;

							// Count total lessons
							let totalLessons = 0;
							try {
								const [countRows] = await conn.query(
									`SELECT COUNT(*) AS c FROM lessons l
									 JOIN modules m ON m.id = l.module_id
									 WHERE m.course_id = ? AND l.is_active = 1`,
									[courseId]
								);
								totalLessons = Array.isArray(countRows) && countRows.length ? Number(countRows[0].c) || 0 : 0;
							} catch { /* ignore */ }

							// Create enrollment
							let enrollmentId;
							try {
								const [insertRes] = await conn.query(
									`INSERT INTO enrollments (user_id, course_id, progress_percent, completed_lessons_count, total_lessons_count)
									 VALUES (?, ?, 0, 0, ?)`,
									[userId, courseId, totalLessons]
								);
								enrollmentId = insertRes.insertId;
							} catch (enrollErr) {
								if (enrollErr && typeof enrollErr === 'object' && enrollErr.code === 'ER_BAD_FIELD_ERROR') {
									const [insertRes] = await conn.query(
										'INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0)',
										[userId, courseId]
									);
									enrollmentId = insertRes.insertId;
								} else if (enrollErr && typeof enrollErr === 'object' && enrollErr.code === 'ER_DUP_ENTRY') {
									continue;
								} else {
									throw enrollErr;
								}
							}

							// Unlock first module
							if (enrollmentId) {
								const [moduleRows] = await conn.query(
									'SELECT id FROM modules WHERE course_id = ? ORDER BY module_order ASC, id ASC LIMIT 1',
									[courseId]
								);
								const firstModuleId = Array.isArray(moduleRows) && moduleRows.length ? Number(moduleRows[0].id) : null;
								if (firstModuleId) {
									await conn.query(
										'INSERT IGNORE INTO module_access (enrollment_id, module_id) VALUES (?, ?)',
										[enrollmentId, firstModuleId]
									);
								}

								// Create course_progress
								try {
									await conn.query(
										`INSERT INTO course_progress (user_id, course_id, completed_lesson_ids, percent_completed)
										 VALUES (?, ?, '[]', 0)
										 ON DUPLICATE KEY UPDATE user_id = user_id`,
										[userId, courseId]
									);
								} catch { /* ignore if table/columns don't exist */ }
							}

							// eslint-disable-next-line no-console
							console.log(`Auto-enrolled user ${userId} into course ${courseId} (order ${order.id})`);
						}
					} catch (autoEnrollErr) {
						// Auto-enroll is best-effort; don't fail the payment confirmation
						// eslint-disable-next-line no-console
						console.error('Auto-enroll error (non-fatal):', autoEnrollErr);
					}
				}
			}

			await conn.commit();
			return res.json({ ok: true });
		} catch (err) {
			try {
				await conn.rollback();
			} catch {
				// ignore
			}
			throw err;
		} finally {
			conn.release();
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

// Customer-facing tracking info for a paid order
router.get('/orders/:orderPublicId/tracking', requireAuth, async (req, res) => {
	try {
		const db = getPool();
		const userId = Number(req.user.id);
		const orderPublicId = req.params.orderPublicId;

		// Verify the order belongs to this user (graceful if shipping columns don't exist yet)
		let orderRows;
		try {
			[orderRows] = await db.query(
				`SELECT id, public_id, shipping_status, tracking_number, bill_code
				FROM shop_orders
				WHERE public_id = ? AND user_id = ? LIMIT 1`,
				[orderPublicId, userId]
			);
		} catch (colErr) {
			if (colErr && typeof colErr === 'object' && colErr.code === 'ER_BAD_FIELD_ERROR') {
				[orderRows] = await db.query(
					`SELECT id, public_id, NULL AS shipping_status, NULL AS tracking_number, NULL AS bill_code
					FROM shop_orders
					WHERE public_id = ? AND user_id = ? LIMIT 1`,
					[orderPublicId, userId]
				);
			} else {
				throw colErr;
			}
		}
		const order = Array.isArray(orderRows) && orderRows.length ? orderRows[0] : null;
		if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });

		const billCode = order.bill_code || order.tracking_number || null;
		let shippingOrder = null;
		let events = [];
		let liveTraces = [];

		// Try to get J&T shipping data if available
		try {
			const [shipRows] = await db.query(
				`SELECT id, bill_code, status, tx_logistic_id, created_at, updated_at
				FROM shipping_orders WHERE order_id = ? LIMIT 1`,
				[order.id]
			);
			shippingOrder = Array.isArray(shipRows) && shipRows.length ? shipRows[0] : null;

			if (shippingOrder) {
				const [eventRows] = await db.query(
					`SELECT scan_type, description, scan_time, scan_city, province, entry_site_name
					FROM shipping_tracking_events
					WHERE shipping_order_id = ?
					ORDER BY scan_time DESC, id DESC`,
					[shippingOrder.id]
				);
				events = eventRows.map((e) => ({
					scanType: e.scan_type,
					description: e.description,
					scanTime: e.scan_time,
					scanCity: e.scan_city,
					province: e.province,
					entrySiteName: e.entry_site_name,
				}));

				// Try live query from J&T if billCode exists
				const jBillCode = shippingOrder.bill_code || billCode;
				if (jBillCode) {
					try {
						const jtExpress = require('../services/jtExpress');
						const trackResult = await jtExpress.queryTracking(jBillCode);
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
						// J&T API may not be configured — ignore
					}
				}
			}
		} catch {
			// shipping_orders table may not exist — ignore
		}

		return res.json({
			shippingStatus: order.shipping_status || shippingOrder?.status || null,
			trackingNumber: order.tracking_number || null,
			billCode: shippingOrder?.bill_code || order.bill_code || null,
			events,
			liveTraces,
		});
	} catch (err) {
		console.error('getOrderTracking error:', err);
		return res.status(500).json({ error: 'internal error' });
	}
});

module.exports = router;
