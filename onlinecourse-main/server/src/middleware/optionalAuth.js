const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'oc_auth';

function jwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('Missing JWT_SECRET');
	return secret;
}

function optionalAuth(req, _res, next) {
	try {
		const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
		if (!token) return next();

		const payload = jwt.verify(String(token), jwtSecret());
		const id = String(payload.sub || '');
		if (!id) return next();
		req.user = {
			id,
			email: payload.email ? String(payload.email) : undefined,
			role: payload.role ? String(payload.role) : undefined,
		};
		return next();
	} catch {
		return next();
	}
}

module.exports = { optionalAuth };
