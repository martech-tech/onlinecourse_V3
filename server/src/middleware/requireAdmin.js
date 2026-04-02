const jwt = require('jsonwebtoken');

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'oc_admin';

function jwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('Missing JWT_SECRET');
	return secret;
}

function requireAdmin(req, res, next) {
	try {
		const token = req.cookies ? req.cookies[ADMIN_COOKIE_NAME] : null;
		if (!token) return res.status(401).json({ error: 'unauthorized' });

		const payload = jwt.verify(String(token), jwtSecret());
		const id = payload && typeof payload === 'object' ? String(payload.sub || '') : '';
		const role = payload && typeof payload === 'object' ? String(payload.role || '') : '';
		if (!id || role !== 'admin') return res.status(401).json({ error: 'unauthorized' });

		req.admin = {
			id,
			email: payload.email ? String(payload.email) : undefined,
			role: 'admin',
		};

		return next();
	} catch {
		return res.status(401).json({ error: 'unauthorized' });
	}
}

module.exports = { requireAdmin };
