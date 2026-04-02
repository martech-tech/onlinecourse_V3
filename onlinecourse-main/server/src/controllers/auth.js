const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getPool } = require('../db');
const { sendMail } = require('../utils/mailer');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'oc_auth';
const OTP_COOKIE_NAME = process.env.OTP_COOKIE_NAME || 'oc_otp';

function isValidEmail(email) {
	if (!email) return false;
	const str = String(email).trim().toLowerCase();
	return str.length >= 3 && str.includes('@');
}

function isThaiPhone10Digits(phone) {
	return /^0\d{9}$/.test(String(phone || ''));
}

function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8;
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

function normalizePhone(phone) {
	let raw = String(phone || '').trim();
	if (!raw) return '';
	raw = raw.replace(/[^0-9+]/g, '');
	if (raw.startsWith('+')) raw = raw.slice(1);
	if (raw.startsWith('66') && raw.length >= 11) {
		raw = `0${raw.slice(2)}`;
	}
	raw = raw.replace(/\D/g, '');
	return raw;
}

async function loadPrefillForPhone(phoneNumber) {
	const db = getPool();
	const [userRows] = await db.query('SELECT * FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
	const userRow = Array.isArray(userRows) && userRows.length ? userRows[0] : null;

	const [regRows] = await db.query(
		`SELECT *
		FROM course_registrations
		WHERE phone_number = ?
		ORDER BY created_at DESC, id DESC
		LIMIT 1`,
		[phoneNumber]
	);
	const regRow = Array.isArray(regRows) && regRows.length ? regRows[0] : null;

	const existingUser = Boolean(userRow);
	if (!regRow && !userRow) {
		return { existingUser: false, prefill: null };
	}

	const prefill = {
		gender: regRow?.prefix || '',
		name: regRow?.full_name || (userRow ? `${userRow.first_name || ''} ${userRow.last_name || ''}`.trim() : '') || '',
		tel: phoneNumber,
		usermail: regRow?.email || userRow?.email || '',
		grade: regRow?.grade || '',
		schoolprovince: regRow?.school_province || '',
		other_faculty: regRow?.faculty_other_text || '',
		other_university: regRow?.university_other_text || '',
		checks: {
			medicine: Boolean(regRow?.faculty_medicine),
			dentistry: Boolean(regRow?.faculty_dentistry),
			veterinarians: Boolean(regRow?.faculty_veterinarians),
			pharmacy: Boolean(regRow?.faculty_pharmacy),
			medical_technology: Boolean(regRow?.faculty_medical_technology),
			nursing: Boolean(regRow?.faculty_nursing),
			engineering: Boolean(regRow?.faculty_engineering),
			architecture: Boolean(regRow?.faculty_architecture),
			science: Boolean(regRow?.faculty_science),
			business_administration: Boolean(regRow?.faculty_business_administration),
			humanities: Boolean(regRow?.faculty_humanities),
			literature: Boolean(regRow?.faculty_literature),
			social_sciences: Boolean(regRow?.faculty_social_sciences),
			law: Boolean(regRow?.faculty_law),
			education: Boolean(regRow?.faculty_education),
			chula: Boolean(regRow?.university_chula),
			thammasat: Boolean(regRow?.university_thammasat),
			mahidol: Boolean(regRow?.university_mahidol),
			chiangmai: Boolean(regRow?.university_chiangmai),
			knonkaen: Boolean(regRow?.university_knonkaen),
			songkhla: Boolean(regRow?.university_songkhla),
			ubon: Boolean(regRow?.university_ubon),
			kingmongkut_north: Boolean(regRow?.university_kingmongkut_north),
			sarakham: Boolean(regRow?.university_sarakham),
			walailak: Boolean(regRow?.university_walailak),
			maejo: Boolean(regRow?.university_maejo),
			kingmongkut_ladkrabang: Boolean(regRow?.university_kingmongkut_ladkrabang),
		},
	};

	return { existingUser, prefill };
}

async function resolveCourseRegisterIdentifier(req, res) {
	try {
		const email = String(req.body?.email || '').trim().toLowerCase();
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone || '');

		if (!isValidEmail(email)) {
			return res.status(400).json({ ok: false, error: 'valid email is required' });
		}
		if (!phoneNumber || !isThaiPhone10Digits(phoneNumber)) {
			return res.status(400).json({ ok: false, error: 'valid phone number is required' });
		}

		const db = getPool();
		const [emailRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
		const emailUser = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;
		if (emailUser) {
			const existingPhone = normalizePhone(emailUser.phone_number || '');
			if (!existingPhone) {
				return res.status(403).json({ ok: false, error: 'phone_not_set' });
			}
			if (existingPhone !== phoneNumber) {
				return res.status(401).json({ ok: false, error: 'invalid credentials' });
			}
		}

		const [phoneRows] = await db.query('SELECT id, email FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
		const phoneUser = Array.isArray(phoneRows) && phoneRows.length ? phoneRows[0] : null;
		if (phoneUser && String(phoneUser.email || '').trim().toLowerCase() !== email) {
			return res.status(409).json({ ok: false, error: 'phone_already_used' });
		}

		const { existingUser, prefill } = await loadPrefillForPhone(phoneNumber);
		const nextPrefill = prefill ? { ...prefill, usermail: email, tel: phoneNumber } : null;
		return res.json({ ok: true, mode: 'email_phone', existingUser, prefill: nextPrefill });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('resolveCourseRegisterIdentifier failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

async function loginEmailPhone(req, res) {
	try {
		const email = String(req.body?.email || req.body?.identifier || '').trim().toLowerCase();
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone || req.body?.password || '');

		if (!isValidEmail(email)) {
			return res.status(400).json({ ok: false, error: 'valid email is required' });
		}
		if (!phoneNumber || !isThaiPhone10Digits(phoneNumber)) {
			return res.status(400).json({ ok: false, error: 'valid phone number is required' });
		}

		const db = getPool();
		const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(401).json({ ok: false, error: 'invalid credentials' });

		const existingPhone = normalizePhone(row.phone_number || '');
		if (!existingPhone) {
			return res.status(403).json({ ok: false, error: 'phone_not_set' });
		}
		if (existingPhone !== phoneNumber) {
			return res.status(401).json({ ok: false, error: 'invalid credentials' });
		}

		const token = signAccessToken({ id: row.id, email: row.email, role: row.role });
		setAuthCookie(res, token);
		return res.json({ ok: true, user: toUserDto(row) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('loginEmailPhone failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

function sha256(value) {
	return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function signAccessToken(user) {
	const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
	return jwt.sign(
		{
			sub: String(user.id),
			email: user.email,
			role: user.role,
		},
		jwtSecret(),
		{ expiresIn }
	);
}

function setAuthCookie(res, token) {
	const maxAgeSeconds = Number(process.env.JWT_COOKIE_MAX_AGE_SECONDS || 60 * 60 * 24 * 30);
	res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions(), maxAge: maxAgeSeconds * 1000 });
}

function clearAuthCookie(res) {
	res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}

function clearOtpCookie(res) {
	res.clearCookie(OTP_COOKIE_NAME, cookieOptions());
}

function otpPurpose() {
	return process.env.OTP_PURPOSE || 'course_register';
}

function tryGetOtpPhoneFromRequest(req) {
	try {
		const token = req.cookies ? req.cookies[OTP_COOKIE_NAME] : null;
		if (!token) return null;
		const payload = jwt.verify(String(token), jwtSecret());
		if (!payload || typeof payload !== 'object') return null;
		if (payload.purpose !== otpPurpose()) return null;
		const phone = typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : '';
		return phone || null;
	} catch {
		return null;
	}
}

function tryGetUserIdFromRequest(req) {
	try {
		const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
		if (!token) return null;
		const payload = jwt.verify(String(token), jwtSecret());
		const raw = payload && typeof payload === 'object' ? payload.sub : null;
		const n = Number(raw);
		if (!Number.isFinite(n) || n <= 0) return null;
		return Math.trunc(n);
	} catch {
		return null;
	}
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

async function register(req, res) {
	try {
		const { email, password, role, profileImage, firstName, lastName, phone } = req.body || {};
		const normalizedEmail = String(email || '').trim().toLowerCase();
		const nextFirstName = typeof firstName === 'string' ? firstName.trim() : '';
		const nextLastName = typeof lastName === 'string' ? lastName.trim() : '';
		const nextPhone = normalizePhone(phone);

		if (!isValidEmail(normalizedEmail)) {
			return res.status(400).json({ error: 'valid email is required' });
		}
		if (!isValidPassword(password)) {
			return res.status(400).json({ error: 'password must be at least 8 characters' });
		}

		let nextRole = 'student';
		if (role === 'admin' || role === 'student') nextRole = role;

		const db = getPool();
		const [existingRows] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
		if (Array.isArray(existingRows) && existingRows.length > 0) {
			return res.status(409).json({ message: 'Email already registered' });
		}

		const passwordHash = await bcrypt.hash(String(password), 12);
		const profileImageUrl = profileImage ? String(profileImage) : null;

		const verificationToken = crypto.randomBytes(32).toString('hex');
		const verificationTokenHash = sha256(verificationToken);
		const expiresMinutes = Number(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES || 60 * 24);
		const webAppUrl = (process.env.WEB_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
		const verificationUrl = `${webAppUrl}/auth/verify?token=${encodeURIComponent(verificationToken)}`;

		const subject = 'Verify your email';
		const text = `Welcome!\n\nPlease verify your email by opening this link:\n${verificationUrl}\n\nIf you did not create an account, you can ignore this email.`;
		const html = `
			<p>Welcome!</p>
			<p><a href="${verificationUrl}">Click here to verify your email</a></p>
			<p>If you did not create an account, you can ignore this email.</p>
		`;

		await db.query(
			'INSERT INTO users (email, password_hash, role, profile_image_url, first_name, last_name, phone_number, is_verified, verification_token_hash, verification_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
			[
				normalizedEmail,
				passwordHash,
				nextRole,
				profileImageUrl,
				nextFirstName || null,
				nextLastName || null,
				nextPhone || null,
				verificationTokenHash,
				expiresMinutes,
			]
		);

		try {
			const info = await sendMail({ to: normalizedEmail, subject, text, html });
			// eslint-disable-next-line no-console
			console.log('verifyEmail sent:', {
				to: normalizedEmail,
				messageId: info && info.messageId,
				response: info && info.response,
			});
		} catch (mailErr) {
			// eslint-disable-next-line no-console
			console.error('verifyEmail failed to send:', mailErr);
			if (process.env.NODE_ENV !== 'production') {
				// eslint-disable-next-line no-console
				console.log('Verification Link:', verificationUrl);
			} else {
				return res.status(500).json({ error: 'failed to send verification email' });
			}
		}

		return res.status(200).json({ ok: true, message: 'Please check your email to verify your account.' });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('register failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function registerOtp(req, res) {
	try {
		const otpPhone = tryGetOtpPhoneFromRequest(req);
		if (!otpPhone) return res.status(401).json({ error: 'otp_required' });

		const { email, firstName, lastName } = req.body || {};
		const normalizedEmail = String(email || '').trim().toLowerCase();
		const nextFirstName = typeof firstName === 'string' ? firstName.trim() : '';
		const nextLastName = typeof lastName === 'string' ? lastName.trim() : '';
		const nextPhone = normalizePhone(otpPhone);

		if (!nextPhone) return res.status(400).json({ error: 'phone is required' });
		if (!isValidEmail(normalizedEmail)) return res.status(400).json({ error: 'valid email is required' });

		const db = getPool();

		const [phoneRows] = await db.query('SELECT * FROM users WHERE phone_number = ? LIMIT 1', [nextPhone]);
		const phoneUser = Array.isArray(phoneRows) && phoneRows.length ? phoneRows[0] : null;
		if (phoneUser) {
			if (String(phoneUser.email).toLowerCase() !== normalizedEmail) {
				const [emailTaken] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [
					normalizedEmail,
					phoneUser.id,
				]);
				if (Array.isArray(emailTaken) && emailTaken.length) {
					return res.status(409).json({ error: 'Email already registered' });
				}
			}

			await db.query(
				`UPDATE users
				SET email = ?, first_name = ?, last_name = ?, phone_number = ?,
					is_verified = 1,
					verification_token_hash = NULL,
					verification_token_expires_at = NULL
				WHERE id = ?`,
				[normalizedEmail, nextFirstName || null, nextLastName || null, nextPhone, phoneUser.id]
			);

			const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [phoneUser.id]);
			const row = Array.isArray(rows) && rows.length ? rows[0] : phoneUser;

			const token = signAccessToken({ id: row.id, email: row.email, role: row.role });
			setAuthCookie(res, token);
			clearOtpCookie(res);
			return res.json({ ok: true, user: toUserDto(row), existingUser: true });
		}

		const [existingRows] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
		if (Array.isArray(existingRows) && existingRows.length > 0) {
			return res.status(409).json({ error: 'Email already registered' });
		}

		const randomPassword = crypto.randomBytes(32).toString('hex');
		const passwordHash = await bcrypt.hash(randomPassword, 12);
		await db.query(
			'INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
			[normalizedEmail, passwordHash, 'student', nextFirstName || null, nextLastName || null, nextPhone]
		);

		const [rows] = await db.query('SELECT * FROM users WHERE phone_number = ? LIMIT 1', [nextPhone]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(500).json({ error: 'internal error' });

		const token = signAccessToken({ id: row.id, email: row.email, role: row.role });
		setAuthCookie(res, token);
		clearOtpCookie(res);
		return res.json({ ok: true, user: toUserDto(row), existingUser: false });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('registerOtp failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function login(req, res) {
	try {
		const { email, password } = req.body || {};
		const normalizedEmail = String(email || '').trim().toLowerCase();

		if (!isValidEmail(normalizedEmail) || typeof password !== 'string') {
			return res.status(400).json({ error: 'email and password are required' });
		}

		const db = getPool();
		const [rows] = await db.query(
			'SELECT id, first_name, last_name, phone_number, is_verified, bio, email, password_hash, role, profile_image_url FROM users WHERE email = ? LIMIT 1',
			[normalizedEmail]
		);

		const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
		if (!row) {
			return res.status(401).json({ error: 'invalid credentials' });
		}

		const ok = await bcrypt.compare(String(password), String(row.password_hash));
		if (!ok) {
			return res.status(401).json({ error: 'invalid credentials' });
		}

		if (!row.is_verified) {
			return res.status(403).json({ error: 'email not verified' });
		}

		const hasPhone = typeof row.phone_number === 'string' ? row.phone_number.trim().length > 0 : Boolean(row.phone_number);
		if (!hasPhone) {
			// Allow email-only accounts to login at most 3 times via email/password,
			// then force them to provide a phone number and use OTP flow.
			const [result] = await db.query(
				`UPDATE users
				SET email_login_count = COALESCE(email_login_count, 0) + 1
				WHERE id = ? AND COALESCE(email_login_count, 0) < 3`,
				[row.id]
			);

			if (!result || result.affectedRows !== 1) {
				return res.status(403).json({
					ok: false,
					code: 'email_login_limit_reached',
					error:
						'อีเมลนี้เข้าสู่ระบบด้วยรหัสผ่านได้ครบ 3 ครั้งแล้ว กรุณาเพิ่มเบอร์โทรศัพท์และเข้าสู่ระบบด้วย OTP',
				});
			}
		}

		const token = signAccessToken({ id: row.id, email: row.email, role: row.role });
		setAuthCookie(res, token);

		return res.json({ ok: true, user: toUserDto(row) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('login failed:', err);
		if (err instanceof Error && err.message === 'Missing JWT_SECRET') {
			return res.status(500).json({ error: 'Missing JWT_SECRET' });
		}
		return res.status(500).json({ error: 'internal error' });
	}
}

async function loginOtp(req, res) {
	try {
		const otpPhone = tryGetOtpPhoneFromRequest(req);
		if (!otpPhone) return res.status(401).json({ error: 'otp_required' });

		const db = getPool();
		const [rows] = await db.query('SELECT * FROM users WHERE phone_number = ? LIMIT 1', [otpPhone]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(404).json({ error: 'user_not_found' });

		const token = signAccessToken({ id: row.id, email: row.email, role: row.role });
		setAuthCookie(res, token);
		clearOtpCookie(res);
		return res.json({ ok: true, user: toUserDto(row) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('loginOtp failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function me(req, res) {
	try {
		const userId = tryGetUserIdFromRequest(req);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const db = getPool();
		const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) {
			clearAuthCookie(res);
			return res.status(401).json({ error: 'unauthorized' });
		}

		return res.json({ ok: true, user: toUserDto(row) });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('me failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function verifyEmail(req, res) {
	try {
		const token = typeof req.query?.token === 'string' ? req.query.token : '';
		if (!token || token.length < 10) {
			return res.status(400).json({ error: 'valid token is required' });
		}

		const tokenHash = sha256(token);
		const db = getPool();
		const [rows] = await db.query(
			'SELECT id FROM users WHERE verification_token_hash = ? AND verification_token_expires_at > NOW() LIMIT 1',
			[tokenHash]
		);
		const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
		if (!row) {
			return res.status(400).json({ error: 'invalid or expired token' });
		}

		await db.query(
			'UPDATE users SET is_verified = 1, verification_token_hash = NULL, verification_token_expires_at = NULL WHERE id = ?',
			[row.id]
		);

		return res.json({ ok: true, message: 'Account verified' });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('verifyEmail failed:', err);
		return res.status(500).json({ error: 'internal error' });
	}
}

async function logout(_req, res) {
	clearAuthCookie(res);
	return res.json({ ok: true });
}

async function requestPhoneChange(req, res) {
	try {
		const { email } = req.body || {};
		const normalizedEmail = String(email || '').trim().toLowerCase();
		if (!isValidEmail(normalizedEmail)) {
			return res.status(400).json({ ok: false, error: 'valid email is required' });
		}

		const db = getPool();
		const [rows] = await db.query('SELECT id, email FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(404).json({ ok: false, error: 'email_not_found' });

		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = sha256(token);
		const expiresMinutes = Number(process.env.PHONE_CHANGE_TOKEN_EXPIRES_MINUTES || 60);

		await db.query(
			'UPDATE users SET phone_change_token_hash = ?, phone_change_token_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
			[tokenHash, expiresMinutes, row.id]
		);

		const webAppUrl = (process.env.WEB_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
		const url = `${webAppUrl}/auth/phone-change?token=${encodeURIComponent(token)}`;

		const subject = 'Change phone number';
		const text = `You requested to change your phone number.\n\nOpen this link to continue:\n${url}\n\nIf you did not request this, you can ignore this email.`;
		const html = `
			<p>You requested to change your phone number.</p>
			<p><a href="${url}">Click here to change your phone number</a></p>
			<p>If you did not request this, you can ignore this email.</p>
		`;

		try {
			await sendMail({ to: normalizedEmail, subject, text, html });
			return res.json({ ok: true });
		} catch (mailErr) {
			// eslint-disable-next-line no-console
			console.error('requestPhoneChange email failed:', mailErr);
			if (process.env.NODE_ENV !== 'production') {
				return res.json({ ok: true, token });
			}
			return res.json({ ok: true });
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('requestPhoneChange failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

async function verifyPhoneChange(req, res) {
	try {
		const token = typeof req.query?.token === 'string' ? req.query.token : '';
		if (!token || token.length < 10) return res.status(400).json({ ok: false, error: 'valid token is required' });

		const tokenHash = sha256(token);
		const db = getPool();
		const [rows] = await db.query(
			'SELECT id FROM users WHERE phone_change_token_hash = ? AND phone_change_token_expires_at > NOW() LIMIT 1',
			[tokenHash]
		);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(400).json({ ok: false, error: 'invalid_or_expired_token' });

		return res.json({ ok: true });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('verifyPhoneChange failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

async function confirmPhoneChange(req, res) {
	try {
		const { token, new_phone } = req.body || {};
		const tokenValue = typeof token === 'string' ? token.trim() : '';
		const nextPhone = normalizePhone(new_phone);
		if (!tokenValue || tokenValue.length < 10) {
			return res.status(400).json({ ok: false, error: 'valid token is required' });
		}
		if (!nextPhone) {
			return res.status(400).json({ ok: false, error: 'new_phone is required' });
		}

		const tokenHash = sha256(tokenValue);
		const db = getPool();
		const [rows] = await db.query(
			'SELECT id FROM users WHERE phone_change_token_hash = ? AND phone_change_token_expires_at > NOW() LIMIT 1',
			[tokenHash]
		);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!row) return res.status(400).json({ ok: false, error: 'invalid_or_expired_token' });

		const [taken] = await db.query('SELECT id FROM users WHERE phone_number = ? AND id <> ? LIMIT 1', [
			nextPhone,
			row.id,
		]);
		if (Array.isArray(taken) && taken.length) {
			return res.status(409).json({ ok: false, error: 'phone_already_used' });
		}

		await db.query(
			'UPDATE users SET phone_number = ?, phone_change_token_hash = NULL, phone_change_token_expires_at = NULL WHERE id = ?',
			[nextPhone, row.id]
		);

		return res.json({ ok: true });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('confirmPhoneChange failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

/**
 * Checkout guest flow:
 *
 * 1. "lookup" mode (email + phone only, no firstName/lastName):
 *    - If email+phone match an existing user → auto-login, return user + set cookie.
 *    - If no match or mismatch → return { ok: false, found: false } so the frontend
 *      knows to proceed; user will be created at submit time.
 *
 * 2. "register" mode (email + phone + firstName + lastName):
 *    - If email+phone match an existing user → auto-login (update name if blank).
 *    - If email exists but phone doesn't match → return error.
 *    - If phone exists under a different email → return error.
 *    - Otherwise → create new user (no password, verified), auto-login.
 */
async function checkoutGuest(req, res) {
	try {
		const email = String(req.body?.email || '').trim().toLowerCase();
		const phoneNumber = normalizePhone(req.body?.phone || req.body?.phoneNumber || '');
		const firstName = typeof req.body?.firstName === 'string' ? req.body.firstName.trim() : '';
		const lastName = typeof req.body?.lastName === 'string' ? req.body.lastName.trim() : '';
		const isRegisterMode = Boolean(req.body?.register);

		if (!isValidEmail(email)) {
			return res.status(400).json({ ok: false, error: 'valid email is required' });
		}
		if (!phoneNumber || !isThaiPhone10Digits(phoneNumber)) {
			return res.status(400).json({ ok: false, error: 'valid 10-digit phone number is required' });
		}

		const db = getPool();

		// Check if email exists
		const [emailRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
		const emailUser = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;

		// Check if phone exists
		const [phoneRows] = await db.query('SELECT id, email FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
		const phoneUser = Array.isArray(phoneRows) && phoneRows.length ? phoneRows[0] : null;

		// Case: email user exists
		if (emailUser) {
			const existingPhone = normalizePhone(emailUser.phone_number || '');
			if (existingPhone && existingPhone !== phoneNumber) {
				// Email exists but phone doesn't match → not this user
				return res.status(401).json({ ok: false, error: 'email_phone_mismatch', message: 'อีเมลนี้ลงทะเบียนกับเบอร์โทรอื่น' });
			}
			if (!existingPhone) {
				// Email user has no phone → update phone
				await db.query('UPDATE users SET phone_number = ? WHERE id = ?', [phoneNumber, emailUser.id]);
				emailUser.phone_number = phoneNumber;
			}
			// Update name if blank and provided
			if (isRegisterMode && firstName) {
				const hasFirst = typeof emailUser.first_name === 'string' && emailUser.first_name.trim().length > 0;
				if (!hasFirst) {
					await db.query('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [firstName || null, lastName || null, emailUser.id]);
					emailUser.first_name = firstName;
					emailUser.last_name = lastName;
				}
			}
			const token = signAccessToken({ id: emailUser.id, email: emailUser.email, role: emailUser.role });
			setAuthCookie(res, token);
			return res.json({ ok: true, found: true, user: toUserDto(emailUser) });
		}

		// Case: phone exists under a different email
		if (phoneUser && String(phoneUser.email || '').trim().toLowerCase() !== email) {
			return res.status(409).json({ ok: false, error: 'phone_already_used', message: 'เบอร์นี้ลงทะเบียนกับอีเมลอื่นแล้ว' });
		}

		// Case: phone user exists with same email (shouldn't happen if emailUser was null, but guard)
		if (phoneUser) {
			const [fullRows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [phoneUser.id]);
			const fullUser = Array.isArray(fullRows) && fullRows.length ? fullRows[0] : null;
			if (fullUser) {
				if (isRegisterMode && firstName) {
					const hasFirst = typeof fullUser.first_name === 'string' && fullUser.first_name.trim().length > 0;
					if (!hasFirst) {
						await db.query('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [firstName || null, lastName || null, fullUser.id]);
						fullUser.first_name = firstName;
						fullUser.last_name = lastName;
					}
				}
				const token = signAccessToken({ id: fullUser.id, email: fullUser.email, role: fullUser.role });
				setAuthCookie(res, token);
				return res.json({ ok: true, found: true, user: toUserDto(fullUser) });
			}
		}

		// No user found
		if (!isRegisterMode) {
			// Lookup mode: tell frontend no user found
			return res.json({ ok: true, found: false });
		}

		// Register mode: create new user
		if (!firstName) {
			return res.status(400).json({ ok: false, error: 'firstName is required for registration' });
		}

		const randomPassword = crypto.randomBytes(32).toString('hex');
		const passwordHash = await bcrypt.hash(randomPassword, 12);

		await db.query(
			'INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
			[email, passwordHash, 'student', firstName || null, lastName || null, phoneNumber]
		);

		const [newRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
		const newUser = Array.isArray(newRows) && newRows.length ? newRows[0] : null;
		if (!newUser) return res.status(500).json({ ok: false, error: 'internal error' });

		const token = signAccessToken({ id: newUser.id, email: newUser.email, role: newUser.role });
		setAuthCookie(res, token);
		return res.json({ ok: true, found: false, created: true, user: toUserDto(newUser) });
	} catch (err) {
		console.error('checkoutGuest failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

async function checkPhoneExists(req, res) {
	try {
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone || '');
		if (!phoneNumber || !isThaiPhone10Digits(phoneNumber)) {
			return res.status(400).json({ ok: false, error: 'valid phone number is required' });
		}

		const db = getPool();
		const [rows] = await db.query('SELECT id, email FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
		const user = Array.isArray(rows) && rows.length ? rows[0] : null;
		if (!user) {
			return res.json({ ok: true, found: false });
		}

		const { existingUser, prefill } = await loadPrefillForPhone(phoneNumber);
		return res.json({ ok: true, found: true, existingUser, prefill });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('checkPhoneExists failed:', err);
		return res.status(500).json({ ok: false, error: 'internal error' });
	}
}

module.exports = {
	register,
	registerOtp,
	login,
	loginOtp,
	loginEmailPhone,
	resolveCourseRegisterIdentifier,
	checkPhoneExists,
	checkoutGuest,
	me,
	logout,
	verifyEmail,
	requestPhoneChange,
	verifyPhoneChange,
	confirmPhoneChange,
};
