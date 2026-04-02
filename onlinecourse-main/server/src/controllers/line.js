/**
 * LINE Login controller
 *
 * Implements the LINE Login v2.1 OAuth 2.0 + OpenID Connect flow with PKCE.
 * Reference: https://developers.line.biz/en/reference/line-login/
 *
 * ENV required (server/.env):
 *   LINE_CHANNEL_ID
 *   LINE_CHANNEL_SECRET
 *   LINE_CALLBACK_URL   – e.g. http://localhost:4000/auth/line/callback
 *   WEB_APP_URL          – already present
 *   JWT_SECRET           – already present
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { getPool } = require('../db');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// ---------------------------------------------------------------------------
// Config helpers (reuse patterns from auth.js)
// ---------------------------------------------------------------------------

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'oc_auth';
const LINE_STATE_COOKIE = 'oc_line_state';
const LINE_PENDING_COOKIE = 'oc_line_pending';

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

function webAppUrl() {
	return (process.env.WEB_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function lineChannelId() {
	const id = process.env.LINE_CHANNEL_ID;
	if (!id) throw new Error('Missing LINE_CHANNEL_ID');
	return id;
}

function lineChannelSecret() {
	const s = process.env.LINE_CHANNEL_SECRET;
	if (!s) throw new Error('Missing LINE_CHANNEL_SECRET');
	return s;
}

function lineCallbackUrl() {
	const url = process.env.LINE_CALLBACK_URL;
	if (!url) throw new Error('Missing LINE_CALLBACK_URL');
	return url;
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function generateCodeVerifier() {
	// 43-128 chars, base64url (RFC 7636)
	return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
	return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// ---------------------------------------------------------------------------
// Validate returnPath – prevent open redirect
// ---------------------------------------------------------------------------

function sanitizeReturnPath(raw) {
	if (typeof raw !== 'string') return '/dashboard';
	const trimmed = raw.trim();
	// Must start with single slash and not be protocol-relative
	if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/dashboard';
	// No scheme injection
	if (/^\/[a-z]+:/i.test(trimmed)) return '/dashboard';
	return trimmed;
}

// ---------------------------------------------------------------------------
// Reused auth helpers (same logic as auth.js)
// ---------------------------------------------------------------------------

function signAccessToken(user) {
	const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
	return jwt.sign(
		{ sub: String(user.id), email: user.email, role: user.role },
		jwtSecret(),
		{ expiresIn }
	);
}

function setAuthCookie(res, token) {
	const maxAgeSeconds = Number(process.env.JWT_COOKIE_MAX_AGE_SECONDS || 60 * 60 * 24 * 30);
	res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions(), maxAge: maxAgeSeconds * 1000 });
}

function buildDisplayName(row) {
	const first = typeof row.first_name === 'string' ? row.first_name.trim() : '';
	const last = typeof row.last_name === 'string' ? row.last_name.trim() : '';
	const full = `${first} ${last}`.trim();
	return full.length > 0 ? full : null;
}

function toUserDto(row) {
	return {
		id: String(row.id),
		email: row.email,
		role: row.role,
		name: buildDisplayName(row),
		firstName: row.first_name || null,
		lastName: row.last_name || null,
		phoneNumber: row.phone_number || null,
		isVerified: Boolean(row.is_verified),
		bio: row.bio || null,
		profileImage: row.profile_image_url || null,
	};
}

// ---------------------------------------------------------------------------
// Download LINE profile image to local uploads/ directory
// ---------------------------------------------------------------------------

/**
 * Fetches the LINE profile picture and saves it to server/uploads/.
 * Returns the local relative path (e.g. "/uploads/u42-1709312345678.jpg") or null on failure.
 *
 * @param {string} pictureUrl – LINE CDN URL (e.g. https://profile.line-scdn.net/...)
 * @param {number|string} userId – DB user.id (used in filename)
 * @param {import('express').Request} req – Express request (for building base URL)
 * @returns {Promise<string|null>} full URL to the saved image, or null
 */
async function downloadLineProfileImage(pictureUrl, userId, req) {
	if (!pictureUrl) return null;

	try {
		const res = await fetch(pictureUrl, { redirect: 'follow' });
		if (!res.ok) {
			// eslint-disable-next-line no-console
			console.warn(`downloadLineProfileImage: fetch failed (${res.status}) for ${pictureUrl}`);
			return null;
		}

		const contentType = String(res.headers.get('content-type') || '');
		if (!contentType.startsWith('image/')) {
			// eslint-disable-next-line no-console
			console.warn(`downloadLineProfileImage: not an image (${contentType})`);
			return null;
		}

		// Determine file extension from content-type
		const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
		const ext = extMap[contentType.split(';')[0].trim()] || '.jpg';

		// Ensure uploads dir exists
		if (!fs.existsSync(UPLOADS_DIR)) {
			fs.mkdirSync(UPLOADS_DIR, { recursive: true });
		}

		const filename = `u${userId}-${Date.now()}${ext}`;
		const filePath = path.join(UPLOADS_DIR, filename);

		// Stream response body to disk
		const fileStream = fs.createWriteStream(filePath);
		await pipeline(res.body, fileStream);

		// Build full URL (same pattern as user.js updateProfile)
		const proto = req ? req.protocol : 'http';
		const host = req ? req.get('host') : 'localhost:4000';
		return `${proto}://${host}/uploads/${encodeURIComponent(filename)}`;
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('downloadLineProfileImage error:', err);
		return null;
	}
}

// ---------------------------------------------------------------------------
// LINE API calls
// ---------------------------------------------------------------------------

/**
 * Exchange authorization code for tokens.
 * POST https://api.line.me/oauth2/v2.1/token
 */
async function exchangeCode(code, codeVerifier) {
	const params = new URLSearchParams({
		grant_type: 'authorization_code',
		code,
		redirect_uri: lineCallbackUrl(),
		client_id: lineChannelId(),
		client_secret: lineChannelSecret(),
		code_verifier: codeVerifier,
	});

	const res = await fetch('https://api.line.me/oauth2/v2.1/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString(),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`LINE token exchange failed (${res.status}): ${text}`);
	}
	return res.json();
}

/**
 * Verify ID token via LINE endpoint.
 * POST https://api.line.me/oauth2/v2.1/verify
 * Returns: { iss, sub, aud, exp, iat, nonce, name, picture, email }
 */
async function verifyIdToken(idToken, nonce) {
	const params = new URLSearchParams({
		id_token: idToken,
		client_id: lineChannelId(),
	});
	if (nonce) params.set('nonce', nonce);

	const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString(),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`LINE id_token verification failed (${res.status}): ${text}`);
	}
	return res.json();
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET /auth/line/start?returnPath=/dashboard
 *
 * Generates PKCE + state + nonce, stores them in cookie, redirects to LINE.
 */
async function startLineLogin(req, res) {
	try {
		const returnPath = sanitizeReturnPath(req.query?.returnPath || req.query?.return_path);

		const state = crypto.randomBytes(32).toString('hex');
		const nonce = crypto.randomBytes(16).toString('hex');
		const codeVerifier = generateCodeVerifier();
		const codeChallenge = generateCodeChallenge(codeVerifier);

		// Store params in a short-lived signed cookie
		const stateCookie = jwt.sign(
			{ state, nonce, codeVerifier, returnPath },
			jwtSecret(),
			{ expiresIn: '10m' }
		);
		res.cookie(LINE_STATE_COOKIE, stateCookie, {
			...cookieOptions(),
			maxAge: 10 * 60 * 1000, // 10 minutes
		});

		const authorizeUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
		authorizeUrl.searchParams.set('response_type', 'code');
		authorizeUrl.searchParams.set('client_id', lineChannelId());
		authorizeUrl.searchParams.set('redirect_uri', lineCallbackUrl());
		authorizeUrl.searchParams.set('state', state);
		authorizeUrl.searchParams.set('scope', 'profile openid email');
		authorizeUrl.searchParams.set('nonce', nonce);
		authorizeUrl.searchParams.set('code_challenge', codeChallenge);
		authorizeUrl.searchParams.set('code_challenge_method', 'S256');

		return res.redirect(authorizeUrl.toString());
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('startLineLogin failed:', err);
		return res.redirect(`${webAppUrl()}/login?error=line_start_failed`);
	}
}

/**
 * GET /auth/line/callback?code=...&state=...
 *
 * Called by LINE after user consent. Exchanges code, verifies id_token,
 * finds or creates user, sets auth cookie, redirects to frontend.
 */
async function lineCallback(req, res) {
	// Helper to redirect with error
	const fail = (msg, returnPath) => {
		// eslint-disable-next-line no-console
		console.error('lineCallback failed:', msg);
		res.clearCookie(LINE_STATE_COOKIE, cookieOptions());
		const rp = sanitizeReturnPath(returnPath);
		return res.redirect(`${webAppUrl()}/login?error=${encodeURIComponent(msg)}&returnPath=${encodeURIComponent(rp)}`);
	};

	try {
		// 1. LINE returned an error (user denied consent, etc.)
		if (req.query?.error) {
			return fail(req.query.error_description || req.query.error, '/login');
		}

		// 2. Read & verify state cookie
		const stateCookieValue = req.cookies ? req.cookies[LINE_STATE_COOKIE] : null;
		if (!stateCookieValue) return fail('missing_state_cookie', '/login');

		let stored;
		try {
			stored = jwt.verify(String(stateCookieValue), jwtSecret());
		} catch {
			return fail('invalid_state_cookie', '/login');
		}

		const { state, nonce, codeVerifier, returnPath } = stored;

		// 3. Validate state param
		if (!req.query?.state || req.query.state !== state) {
			return fail('state_mismatch', returnPath);
		}

		const code = req.query?.code;
		if (!code) return fail('missing_code', returnPath);

		// 4. Exchange code for tokens
		const tokenData = await exchangeCode(code, codeVerifier);
		const idToken = tokenData.id_token;
		if (!idToken) return fail('no_id_token', returnPath);

		// 5. Verify id_token
		const profile = await verifyIdToken(idToken, nonce);
		const lineUserId = profile.sub; // LINE user ID (always present)
		const lineEmail = typeof profile.email === 'string' ? profile.email.trim().toLowerCase() : '';
		const lineName = typeof profile.name === 'string' ? profile.name.trim() : '';
		const linePicture = typeof profile.picture === 'string' ? profile.picture.trim() : '';

		// Clear state cookie – it's single-use
		res.clearCookie(LINE_STATE_COOKIE, cookieOptions());

		const db = getPool();

		// 6. Try to find user by line_user_id first (most reliable)
		const [lineRows] = await db.query('SELECT * FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
		let user = Array.isArray(lineRows) && lineRows.length ? lineRows[0] : null;

		if (user) {
			// Download & save LINE profile picture locally if user doesn't have one
			if (!user.profile_image_url && linePicture) {
				const localImage = await downloadLineProfileImage(linePicture, user.id, req);
				if (localImage) {
					await db.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [localImage, user.id]);
					user.profile_image_url = localImage;
				}
			}
			const token = signAccessToken(user);
			setAuthCookie(res, token);
			return res.redirect(`${webAppUrl()}/auth/line/callback?returnPath=${encodeURIComponent(sanitizeReturnPath(returnPath))}`);
		}

		// 7. If we have email, try to find/link by email
		if (lineEmail) {
			const [emailRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [lineEmail]);
			user = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;

			if (user) {
				// Link LINE user ID to existing account
				try {
					await db.query('UPDATE users SET line_user_id = ? WHERE id = ?', [lineUserId, user.id]);
				} catch (linkErr) {
					if (linkErr.code === 'ER_DUP_ENTRY') {
						// Another account already claimed this line_user_id – use that one
						const [dupRows] = await db.query('SELECT * FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
						if (Array.isArray(dupRows) && dupRows.length) user = dupRows[0];
					} else {
						throw linkErr;
					}
				}
				if (!user.profile_image_url && linePicture) {
					const localImg = await downloadLineProfileImage(linePicture, user.id, req);
					if (localImg) {
						await db.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [localImg, user.id]);
					}
				}
				const token = signAccessToken(user);
				setAuthCookie(res, token);
				return res.redirect(
					`${webAppUrl()}/auth/line/callback?returnPath=${encodeURIComponent(sanitizeReturnPath(returnPath))}`
				);
			}

			// 8. No existing user – auto-register with LINE email
			const randomPassword = crypto.randomBytes(32).toString('hex');
			const passwordHash = await bcrypt.hash(randomPassword, 12);

			// Split display name into first/last (best-effort)
			const nameParts = lineName.split(/\s+/);
			const firstName = nameParts[0] || '';
			const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

			try {
				await db.query(
					`INSERT INTO users
						(email, password_hash, role, first_name, last_name, is_verified, line_user_id)
					VALUES (?, ?, 'student', ?, ?, 1, ?)`,
					[lineEmail, passwordHash, firstName || null, lastName || null, lineUserId]
				);
			} catch (insertErr) {
				if (insertErr.code === 'ER_DUP_ENTRY') {
					// Race: another request just created this user – look up and proceed
					const [raceRows] = await db.query(
						'SELECT * FROM users WHERE email = ? OR line_user_id = ? LIMIT 1',
						[lineEmail, lineUserId]
					);
					user = Array.isArray(raceRows) && raceRows.length ? raceRows[0] : null;
					if (user) {
						const tk = signAccessToken(user);
						setAuthCookie(res, tk);
						return res.redirect(
							`${webAppUrl()}/auth/line/callback?returnPath=${encodeURIComponent(sanitizeReturnPath(returnPath))}`
						);
					}
				}
				throw insertErr;
			}

			const [newRows] = await db.query('SELECT * FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
			user = Array.isArray(newRows) && newRows.length ? newRows[0] : null;
			if (!user) return fail('user_creation_failed', returnPath);

			// Download LINE profile image after user is created (need user.id for filename)
			if (linePicture) {
				const localImg = await downloadLineProfileImage(linePicture, user.id, req);
				if (localImg) {
					await db.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [localImg, user.id]);
				}
			}

			const token = signAccessToken(user);
			setAuthCookie(res, token);
			return res.redirect(
				`${webAppUrl()}/auth/line/callback?returnPath=${encodeURIComponent(sanitizeReturnPath(returnPath))}`
			);
		}

		// 9. No email from LINE – redirect to complete-registration page
		//    Store LINE profile in a short-lived signed cookie
		const pendingToken = jwt.sign(
			{ lineUserId, name: lineName, picture: linePicture },
			jwtSecret(),
			{ expiresIn: '15m' }
		);
		res.cookie(LINE_PENDING_COOKIE, pendingToken, {
			...cookieOptions(),
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		return res.redirect(
			`${webAppUrl()}/auth/line/complete?returnPath=${encodeURIComponent(sanitizeReturnPath(returnPath))}`
		);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('lineCallback error:', err);
		res.clearCookie(LINE_STATE_COOKIE, cookieOptions());
		return res.redirect(`${webAppUrl()}/login?error=line_callback_failed`);
	}
}

/**
 * POST /auth/line/complete-registration
 * Body: { email, phone }
 *
 * For users where LINE did not provide an email.
 * Reads oc_line_pending cookie, creates or links account, returns auth cookie.
 */
async function completeLineRegistration(req, res) {
	try {
		// 1. Read pending cookie
		const pendingCookieValue = req.cookies ? req.cookies[LINE_PENDING_COOKIE] : null;
		if (!pendingCookieValue) {
			return res.status(401).json({ ok: false, error: 'line_pending_expired', message: 'เซสชัน LINE หมดอายุ กรุณาลองใหม่' });
		}

		let pending;
		try {
			pending = jwt.verify(String(pendingCookieValue), jwtSecret());
		} catch {
			return res.status(401).json({ ok: false, error: 'line_pending_invalid', message: 'เซสชัน LINE ไม่ถูกต้อง กรุณาลองใหม่' });
		}

		const { lineUserId, name: lineName, picture: linePicture } = pending;
		if (!lineUserId) {
			return res.status(400).json({ ok: false, error: 'missing_line_user_id' });
		}

		// 2. Validate body
		const email = String(req.body?.email || '').trim().toLowerCase();
		const phone = String(req.body?.phone || '').trim();

		if (!email || !email.includes('@')) {
			return res.status(400).json({ ok: false, error: 'valid email is required' });
		}

		const db = getPool();

		// 3. Check if someone already used this LINE user ID
		const [existingLine] = await db.query('SELECT id FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
		if (Array.isArray(existingLine) && existingLine.length) {
			// Already linked – just login
			const [rows] = await db.query('SELECT * FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
			const user = rows[0];
			const token = signAccessToken(user);
			setAuthCookie(res, token);
			res.clearCookie(LINE_PENDING_COOKIE, cookieOptions());
			return res.json({ ok: true, user: toUserDto(user) });
		}

		// 4. Check if email already exists – link line_user_id
		const [emailRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
		const emailUser = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;

		if (emailUser) {
			// Check if this email user already has a different LINE ID
			if (emailUser.line_user_id && emailUser.line_user_id !== lineUserId) {
				return res.status(409).json({
					ok: false,
					error: 'email_linked_to_other_line',
					message: 'อีเมลนี้ถูกผูกกับบัญชี LINE อื่นแล้ว',
				});
			}
			await db.query('UPDATE users SET line_user_id = ? WHERE id = ?', [lineUserId, emailUser.id]);
			if (!emailUser.profile_image_url && linePicture) {
				const localImg = await downloadLineProfileImage(linePicture, emailUser.id, req);
				if (localImg) {
					await db.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [localImg, emailUser.id]);
				}
			}
			const token = signAccessToken(emailUser);
			setAuthCookie(res, token);
			res.clearCookie(LINE_PENDING_COOKIE, cookieOptions());
			return res.json({ ok: true, user: toUserDto(emailUser) });
		}

		// 5. New user – create account
		const randomPassword = crypto.randomBytes(32).toString('hex');
		const passwordHash = await bcrypt.hash(randomPassword, 12);

		const nameParts = (lineName || '').split(/\s+/);
		const firstName = nameParts[0] || '';
		const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

		const normalizedPhone = phone.replace(/[^0-9]/g, '') || null;

		await db.query(
			`INSERT INTO users
				(email, password_hash, role, first_name, last_name, phone_number, is_verified, line_user_id)
			VALUES (?, ?, 'student', ?, ?, ?, 1, ?)`,
			[email, passwordHash, firstName || null, lastName || null, normalizedPhone, lineUserId]
		);

		const [newRows] = await db.query('SELECT * FROM users WHERE line_user_id = ? LIMIT 1', [lineUserId]);
		const user = Array.isArray(newRows) && newRows.length ? newRows[0] : null;
		if (!user) {
			return res.status(500).json({ ok: false, error: 'user_creation_failed' });
		}

		// Download LINE profile image after user is created
		if (linePicture) {
			const localImg = await downloadLineProfileImage(linePicture, user.id, req);
			if (localImg) {
				await db.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [localImg, user.id]);
			}
		}

		const token = signAccessToken(user);
		setAuthCookie(res, token);
		res.clearCookie(LINE_PENDING_COOKIE, cookieOptions());
		return res.json({ ok: true, user: toUserDto(user) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('completeLineRegistration failed:', err);
		if (err.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ ok: false, error: 'duplicate_entry', message: 'อีเมลหรือเบอร์นี้ถูกใช้งานแล้ว' });
		}
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

module.exports = {
	startLineLogin,
	lineCallback,
	completeLineRegistration,
};
