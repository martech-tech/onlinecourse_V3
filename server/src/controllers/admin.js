const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getPool } = require('../db');

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'oc_admin';

function isValidEmail(email) {
	if (!email) return false;
	const str = String(email).trim().toLowerCase();
	return str.length >= 3 && str.includes('@');
}

function jwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('Missing JWT_SECRET');
	return secret;
}

function cookieOptions() {
	const isProd = process.env.NODE_ENV === 'production';
	const domain = String(process.env.COOKIE_DOMAIN || '').trim();
	return {
		httpOnly: true,
		sameSite: 'lax',
		secure: isProd,
		path: '/',
		...(domain ? { domain } : null),
	};
}

function signAdminToken(adminRow) {
	const expiresIn = process.env.ADMIN_JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '7d';
	return jwt.sign(
		{
			sub: String(adminRow.id),
			email: adminRow.email,
			role: 'admin',
		},
		jwtSecret(),
		{ expiresIn }
	);
}

function setAdminCookie(res, token) {
	const maxAgeSeconds = Number(process.env.ADMIN_JWT_COOKIE_MAX_AGE_SECONDS || process.env.JWT_COOKIE_MAX_AGE_SECONDS || 60 * 60 * 24 * 7);
	res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions(), maxAge: maxAgeSeconds * 1000 });
}

function clearAdminCookie(res) {
	res.clearCookie(ADMIN_COOKIE_NAME, cookieOptions());
}

function toAdminDto(row) {
	return {
		id: String(row.id),
		email: row.email,
		role: 'admin',
	};
}

async function adminLogin(req, res) {
	try {
		const { email, password } = req.body || {};
		const normalizedEmail = String(email || '').trim().toLowerCase();
		if (!isValidEmail(normalizedEmail) || typeof password !== 'string') {
			return res.status(400).json({ error: 'email and password are required' });
		}

		const db = getPool();
		const [rows] = await db.query(
			'SELECT id, email, password_hash, is_active FROM admin_users WHERE email = ? LIMIT 1',
			[normalizedEmail]
		);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row || !row.is_active) {
			return res.status(401).json({ error: 'invalid credentials' });
		}

		const ok = await bcrypt.compare(String(password), String(row.password_hash));
		if (!ok) {
			return res.status(401).json({ error: 'invalid credentials' });
		}

		await db.query('UPDATE admin_users SET last_login_at = NOW(3) WHERE id = ?', [row.id]);

		const token = signAdminToken(row);
		setAdminCookie(res, token);
		return res.json({ admin: toAdminDto(row) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('adminLogin failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function adminLogout(_req, res) {
	clearAdminCookie(res);
	return res.json({ ok: true });
}

async function adminMe(req, res) {
	// requireAdmin already verified token.
	return res.json({ admin: { id: String(req.admin?.id || ''), email: req.admin?.email, role: 'admin' } });
}

module.exports = {
	adminLogin,
	adminLogout,
	adminMe,
};
