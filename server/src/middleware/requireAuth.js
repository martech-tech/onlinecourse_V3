const jwt = require('jsonwebtoken');

const { getPool } = require('../db');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'oc_auth';

function jwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('Missing JWT_SECRET');
	return secret;
}

async function requireAuth(req, res, next) {
	try {
		const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
		if (!token) return res.status(401).json({ error: 'unauthorized' });

		const payload = jwt.verify(String(token), jwtSecret());
		const userId = String(payload.sub || '');
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const db = getPool();
		const [rows] = await db.query('SELECT id, email, role, phone_number FROM users WHERE id = ? LIMIT 1', [userId]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(401).json({ error: 'unauthorized' });

		req.user = {
			id: String(row.id),
			email: row.email ? String(row.email) : undefined,
			role: row.role ? String(row.role) : undefined,
			phoneNumber: row.phone_number ? String(row.phone_number) : null,
		};

		const hasPhone = typeof row.phone_number === 'string' ? row.phone_number.trim().length > 0 : Boolean(row.phone_number);
		const isUpdatingProfilePhone = req.baseUrl === '/user' && req.path === '/profile' && req.method === 'PUT';
		if (!hasPhone && !isUpdatingProfilePhone) {
			return res.status(403).json({ ok: false, code: 'phone_required', error: 'กรุณาเพิ่มเบอร์โทรศัพท์ก่อนใช้งาน' });
		}

		return next();
	} catch {
		return res.status(401).json({ error: 'unauthorized' });
	}
}

module.exports = { requireAuth };
