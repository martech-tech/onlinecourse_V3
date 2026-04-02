const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getPool } = require('../db');

const OTP_COOKIE_NAME = process.env.OTP_COOKIE_NAME || 'oc_otp';
const OTP_DEVICE_SESSION_COOKIE = process.env.OTP_DEVICE_SESSION_COOKIE || 'oc_otp_device';
const OTP_DEVICE_SESSION_MAX_SENDS = Number(process.env.OTP_DEVICE_SESSION_MAX_SENDS || 10);

const loginOtpRequestStore = new Map();
// token -> { phoneNumber, codeHash, expiresAtMs }

// In-memory device-session quota store (cookie session id -> count)
const otpDeviceSessionQuotaStore = new Map();
// sessionId -> { sendCount, createdAtMs, lastSeenAtMs }

function cleanupOtpDeviceSessionQuotaStore() {
	// Opportunistic cleanup to avoid unbounded growth.
	// Keep entries for up to 14 days since last seen.
	const now = Date.now();
	const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
	for (const [sessionId, entry] of otpDeviceSessionQuotaStore.entries()) {
		const last = entry && typeof entry.lastSeenAtMs === 'number' ? entry.lastSeenAtMs : 0;
		if (!last || now - last > maxAgeMs) otpDeviceSessionQuotaStore.delete(sessionId);
	}
}

function getOrCreateOtpDeviceSessionId(req, res) {
	cleanupOtpDeviceSessionQuotaStore();
	const existing = req && req.cookies ? String(req.cookies[OTP_DEVICE_SESSION_COOKIE] || '').trim() : '';
	if (existing) {
		return existing;
	}
	const sessionId = `ocds_${crypto.randomUUID()}`;
	// Session cookie (no maxAge) to match the requested "session per device" behavior.
	res.cookie(OTP_DEVICE_SESSION_COOKIE, sessionId, cookieOptions());
	return sessionId;
}

function getDeviceOtpSendCount(sessionId) {
	const entry = otpDeviceSessionQuotaStore.get(sessionId);
	return entry && Number.isFinite(entry.sendCount) ? entry.sendCount : 0;
}

function recordDeviceOtpSend(sessionId) {
	const now = Date.now();
	const prev = otpDeviceSessionQuotaStore.get(sessionId);
	const sendCount = (prev && Number.isFinite(prev.sendCount) ? prev.sendCount : 0) + 1;
	otpDeviceSessionQuotaStore.set(sessionId, {
		sendCount,
		createdAtMs: prev && typeof prev.createdAtMs === 'number' ? prev.createdAtMs : now,
		lastSeenAtMs: now,
	});
	return sendCount;
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
	// Keep digits only; allow users to type with spaces/dashes.
	raw = raw.replace(/[^0-9+]/g, '');
	if (raw.startsWith('+')) raw = raw.slice(1);
	// Convert Thailand country code to local 0xxxxxxxxx form.
	if (raw.startsWith('66') && raw.length >= 11) {
		raw = `0${raw.slice(2)}`;
	}
	// Final: digits only.
	raw = raw.replace(/\D/g, '');
	return raw;
}

function isDevOtpMode() {
	return String(process.env.OTP_DEV_MODE || '').trim().toLowerCase() === 'true';
}

function otpPurpose() {
	return process.env.OTP_PURPOSE || 'course_register';
}

function signOtpToken({ phoneNumber }) {
	const expiresIn = process.env.OTP_JWT_EXPIRES_IN || '15m';
	return jwt.sign(
		{
			purpose: otpPurpose(),
			phoneNumber,
		},
		jwtSecret(),
		{ expiresIn }
	);
}

function setOtpCookie(res, token) {
	const maxAgeSeconds = Number(process.env.OTP_COOKIE_MAX_AGE_SECONDS || 60 * 15);
	res.cookie(OTP_COOKIE_NAME, token, { ...cookieOptions(), maxAge: maxAgeSeconds * 1000 });
}

function clearOtpCookie(res) {
	res.clearCookie(OTP_COOKIE_NAME, cookieOptions());
}

// In-memory store for dev OTP mode (NOT for production)
const devOtpStore = new Map();
// token -> { phoneNumber, codeHash, expiresAtMs, attemptsLeft }

function randomOtpCode() {
	const fixed = String(process.env.OTP_DEV_CODE || '').trim();
	if (/^\d{6}$/.test(fixed)) return fixed;
	return String(Math.floor(100000 + Math.random() * 900000));
}

function sha256(value) {
	return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function looksLikeInvalidOtpProviderError(err) {
	const status = err && typeof err === 'object' && err.response && typeof err.response === 'object' ? err.response.status : null;
	if (status !== 400 && status !== 401 && status !== 422) return false;

	const data = err.response && err.response.data;
	const msg =
		(typeof data?.error === 'string' && data.error) ||
		(typeof data?.message === 'string' && data.message) ||
		(typeof err.message === 'string' && err.message) ||
		'';
	const text = String(msg).toLowerCase();

	// Be conservative: only classify as invalid OTP when we see OTP/pin/code semantics.
	return (
		text.includes('otp') ||
		text.includes('pin') ||
		text.includes('code') ||
		text.includes('passcode') ||
		text.includes('verify') ||
		text.includes('invalid')
	);
}

function otpProviderErrorResponse(err) {
	if (!looksLikeInvalidOtpProviderError(err)) return null;
	const data = err && typeof err === 'object' && err.response && typeof err.response === 'object' ? err.response.data : null;
	const rawMessage =
		(typeof data?.error === 'string' && data.error) ||
		(typeof data?.message === 'string' && data.message) ||
		(typeof err.message === 'string' && err.message) ||
		'';

	const rawCode =
		(typeof data?.code === 'string' && data.code) ||
		(typeof data?.error_code === 'string' && data.error_code) ||
		(typeof data?.errorCode === 'string' && data.errorCode) ||
		(null);
	const normalized = `${rawCode || ''} ${rawMessage}`.toLowerCase();

	const looksExpired =
		normalized.includes('expire') ||
		normalized.includes('expired') ||
		normalized.includes('timeout') ||
		normalized.includes('time out') ||
		normalized.includes('หมดอายุ') ||
		normalized.includes('หมด เวลา') ||
		normalized.includes('หมดเวลา');

	const looksInvalid =
		normalized.includes('invalid') ||
		normalized.includes('incorrect') ||
		normalized.includes('wrong') ||
		normalized.includes('not match') ||
		normalized.includes('mismatch') ||
		normalized.includes('ไม่ถูกต้อง');

	if (looksExpired && !looksInvalid) {
		return {
			status: 400,
			code: 'otp_expired',
			error: 'รหัส OTP หมดอายุ กรุณาขอรหัสใหม่แล้วลองอีกครั้ง',
		};
	}
	if (looksInvalid && !looksExpired) {
		return {
			status: 400,
			code: 'otp_invalid',
			error: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
		};
	}

	// Fallback: provider indicates OTP issue but we can't confidently classify
	return {
		status: 400,
		code: 'otp_invalid_or_expired',
		error: 'รหัส OTP ไม่ถูกต้อง หรือหมดอายุ กรุณาขอรหัสใหม่แล้วลองอีกครั้ง',
	};
}

function makeDevToken() {
	return crypto.randomUUID();
}

function makeOpaqueLoginToken() {
	return `ocotp_${crypto.randomUUID()}`;
}

function nextOtpCooldownDelayMs(nextAttempt) {
	// Resend schedule (seconds): 1,1,1,1,1,3,5,15,60 then 60 minutes...
	const scheduleSeconds = [60, 60, 60, 60, 60, 180, 300, 900, 3600];
	const idx = Math.max(0, Number(nextAttempt || 1) - 1);
	const seconds = scheduleSeconds[idx] ?? 3600;
	return seconds * 1000;
}

async function createLoginOtpRequest({ token, phoneNumber, providerToken, isDummy, ttlSeconds }) {
	const db = getPool();
	const ttl = Number(ttlSeconds || 0);
	await db.query(
		`INSERT INTO login_otp_requests (token, phone_number, provider_token, is_dummy, expires_at)
		VALUES (?, ?, ?, ?, DATE_ADD(NOW(3), INTERVAL ? SECOND))`,
		[token, phoneNumber, providerToken || null, isDummy ? 1 : 0, Math.max(1, ttl)]
	);
}

async function getLoginOtpRequest(token) {
	const db = getPool();
	const [rows] = await db.query('SELECT * FROM login_otp_requests WHERE token = ? LIMIT 1', [token]);
	return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function getValidLoginOtpRequest(token) {
	const db = getPool();
	const [rows] = await db.query('SELECT * FROM login_otp_requests WHERE token = ? AND expires_at > NOW(3) LIMIT 1', [token]);
	return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function deleteLoginOtpRequest(token) {
	const db = getPool();
	await db.query('DELETE FROM login_otp_requests WHERE token = ?', [token]);
}

async function isMemberPhone(phoneNumber) {
	const db = getPool();
	const [rows] = await db.query('SELECT id FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
	return Array.isArray(rows) && rows.length > 0;
}

async function consumeOtpRequestAllowance(phoneNumber) {
	const db = getPool();
	const conn = await db.getConnection();
	try {
		await conn.beginTransaction();
		await conn.query(
			`INSERT INTO otp_request_rate_limits (phone_number, attempts, next_allowed_at_ms)
			VALUES (?, 0, 0)
			ON DUPLICATE KEY UPDATE phone_number = phone_number`,
			[phoneNumber]
		);

		const [rows] = await conn.query(
			'SELECT attempts, next_allowed_at_ms FROM otp_request_rate_limits WHERE phone_number = ? FOR UPDATE',
			[phoneNumber]
		);
		const row = Array.isArray(rows) && rows.length ? rows[0] : null;
		const attempts = row && typeof row.attempts === 'number' ? row.attempts : Number(row?.attempts || 0);
		const nextAllowedAtMs = row && typeof row.next_allowed_at_ms === 'number' ? row.next_allowed_at_ms : Number(row?.next_allowed_at_ms || 0);
		const nowMs = Date.now();

		if (nextAllowedAtMs && nowMs < nextAllowedAtMs) {
			await conn.rollback();
			const retryAfterMs = nextAllowedAtMs - nowMs;
			return {
				allowed: false,
				retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
			};
		}

		const nextAttempt = (Number.isFinite(attempts) ? attempts : 0) + 1;
		const delayMs = nextOtpCooldownDelayMs(nextAttempt);
		const newNextAllowedAtMs = nowMs + delayMs;

		await conn.query(
			'UPDATE otp_request_rate_limits SET attempts = ?, next_allowed_at_ms = ? WHERE phone_number = ?',
			[nextAttempt, newNextAllowedAtMs, phoneNumber]
		);
		await conn.commit();
		return { allowed: true, nextAttempt, nextAllowedAtMs: newNextAllowedAtMs };
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
}

async function resetOtpRequestCooldown(phoneNumber) {
	if (!phoneNumber) return;
	const db = getPool();
	await db.query('DELETE FROM otp_request_rate_limits WHERE phone_number = ?', [phoneNumber]);
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

async function requestOtp(req, res) {
	try {
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone);
		if (!phoneNumber) return res.status(400).json({ error: 'phone_number is required' });

		const deviceSessionId = getOrCreateOtpDeviceSessionId(req, res);
		if (Number.isFinite(OTP_DEVICE_SESSION_MAX_SENDS) && OTP_DEVICE_SESSION_MAX_SENDS > 0) {
			const sendCount = getDeviceOtpSendCount(deviceSessionId);
			if (sendCount >= OTP_DEVICE_SESSION_MAX_SENDS) {
				return res.status(429).json({
					error: 'คุณส่ง OTP ถึงจำนวนสูงสุดสำหรับอุปกรณ์นี้แล้ว กรุณาลองใหม่ภายหลัง',
					code: 'otp_device_session_limit',
				});
			}
		}

		// DEV MODE: generate code and store in-memory
		if (isDevOtpMode()) {
			if (process.env.NODE_ENV === 'production') {
				return res.status(500).json({ error: 'OTP_DEV_MODE is not allowed in production' });
			}
			const allowance = await consumeOtpRequestAllowance(phoneNumber);
			if (!allowance.allowed) {
				return res.status(429).json({
					error: `คุณส่ง OTP ไปแล้ว กรุณารอ ${allowance.retryAfterSeconds} วินาที แล้วลองใหม่อีกครั้ง`,
					code: 'otp_rate_limited',
					retryAfterSeconds: allowance.retryAfterSeconds,
				});
			}
			const code = randomOtpCode();
			const token = makeDevToken();
			const expiresAtMs = Date.now() + 5 * 60 * 1000;
			devOtpStore.set(token, { phoneNumber, codeHash: sha256(code), expiresAtMs, attemptsLeft: 5 });
			recordDeviceOtpSend(deviceSessionId);
			return res.json({ ok: true, token, devOtpCode: code });
		}

		const apiKey = process.env.OTP_KEY;
		const apiSecret = process.env.OTP_SECRET;
		const apiKeyTrimmed = typeof apiKey === 'string' ? apiKey.trim() : '';
		const apiSecretTrimmed = typeof apiSecret === 'string' ? apiSecret.trim() : '';
		if (!apiKeyTrimmed || !apiSecretTrimmed) {
			return res.status(500).json({ error: 'OTP is not configured (missing OTP_KEY/OTP_SECRET or enable OTP_DEV_MODE for local dev)' });
		}

		const allowance = await consumeOtpRequestAllowance(phoneNumber);
		if (!allowance.allowed) {
			return res.status(429).json({
				error: `คุณส่ง OTP ไปแล้ว กรุณารอ ${allowance.retryAfterSeconds} วินาที แล้วลองใหม่อีกครั้ง`,
				code: 'otp_rate_limited',
				retryAfterSeconds: allowance.retryAfterSeconds,
			});
		}

		// Lazy require so dev can run without the dependency installed elsewhere.
		// eslint-disable-next-line global-require
		const thaibulksmsApi = require('thaibulksms-api');
		const otp = thaibulksmsApi.otp({ apiKey: apiKeyTrimmed, apiSecret: apiSecretTrimmed });
		const response = await otp.request(phoneNumber);
		const token = response?.data?.token || response?.data?.refno || response?.data?.reference || response?.data?.request_id || null;
		// ThaiBulkSMS returns token in `data.token` (commonly). We still return the full data as-is.
		recordDeviceOtpSend(deviceSessionId);
		return res.json({ ok: true, phoneNumber, ...response.data, token: response?.data?.token || token });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('requestOtp failed:', err);
		const isProd = process.env.NODE_ENV === 'production';
		const message = err instanceof Error ? err.message : 'internal error';
		const maybeDetails =
			err && typeof err === 'object'
				? (err.response && typeof err.response === 'object' ? err.response.data : err.data)
				: null;
		return res.status(500).json({ error: isProd ? 'internal error' : message, details: isProd ? undefined : maybeDetails });
	}
}

// Login-only OTP: do NOT send real OTP unless phone already exists as a member.
// This prevents OTP cost/enumeration while keeping UX (step 2) consistent.
async function requestLoginOtp(req, res) {
	try {
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone);
		if (!phoneNumber) return res.status(400).json({ error: 'phone_number is required' });

		const deviceSessionId = getOrCreateOtpDeviceSessionId(req, res);
		if (Number.isFinite(OTP_DEVICE_SESSION_MAX_SENDS) && OTP_DEVICE_SESSION_MAX_SENDS > 0) {
			const sendCount = getDeviceOtpSendCount(deviceSessionId);
			if (sendCount >= OTP_DEVICE_SESSION_MAX_SENDS) {
				return res.status(429).json({
					error: 'คุณส่ง OTP ถึงจำนวนสูงสุดสำหรับอุปกรณ์นี้แล้ว กรุณาลองใหม่ภายหลัง',
					code: 'otp_device_session_limit',
				});
			}
		}

		// Opportunistic cleanup
		try {
			const db = getPool();
			await db.query('DELETE FROM login_otp_requests WHERE expires_at <= NOW(3)');
		} catch {
			// ignore cleanup errors
		}

		// Ensure OTP is configured (or dev mode enabled) BEFORE consuming cooldown.
		if (!isDevOtpMode()) {
			const apiKeyTrimmed = typeof process.env.OTP_KEY === 'string' ? process.env.OTP_KEY.trim() : '';
			const apiSecretTrimmed = typeof process.env.OTP_SECRET === 'string' ? process.env.OTP_SECRET.trim() : '';
			if (!apiKeyTrimmed || !apiSecretTrimmed) {
				return res
					.status(500)
					.json({ error: 'OTP is not configured (missing OTP_KEY/OTP_SECRET or enable OTP_DEV_MODE for local dev)' });
			}
		}

		const allowance = await consumeOtpRequestAllowance(phoneNumber);
		if (!allowance.allowed) {
			return res.status(429).json({
				error: `คุณส่ง OTP ไปแล้ว กรุณารอ ${allowance.retryAfterSeconds} วินาที แล้วลองใหม่อีกครั้ง`,
				code: 'otp_rate_limited',
				retryAfterSeconds: allowance.retryAfterSeconds,
			});
		}

		const cooldownSeconds = allowance?.nextAllowedAtMs
			? Math.max(0, Math.ceil((Number(allowance.nextAllowedAtMs) - Date.now()) / 1000))
			: 0;

		const member = await isMemberPhone(phoneNumber);
		const token = makeOpaqueLoginToken();
		const ttlSeconds = 10 * 60;
		const expiresAtMs = Date.now() + ttlSeconds * 1000;

		// DEV MODE: store code in-memory only when member
		if (isDevOtpMode()) {
			if (process.env.NODE_ENV === 'production') {
				return res.status(500).json({ error: 'OTP_DEV_MODE is not allowed in production' });
			}
			if (member) {
				const code = randomOtpCode();
				loginOtpRequestStore.set(token, { phoneNumber, codeHash: sha256(code), expiresAtMs });
				// Intentionally do not return devOtpCode to keep behavior non-enumerating.
			} else {
				loginOtpRequestStore.set(token, { phoneNumber, codeHash: '', expiresAtMs });
			}
			recordDeviceOtpSend(deviceSessionId);
			return res.json({ ok: true, token, cooldownSeconds });
		}

		let providerToken = null;
		if (member) {
			// eslint-disable-next-line global-require
			const thaibulksmsApi = require('thaibulksms-api');
			const apiKeyTrimmed = String(process.env.OTP_KEY || '').trim();
			const apiSecretTrimmed = String(process.env.OTP_SECRET || '').trim();
			const otp = thaibulksmsApi.otp({ apiKey: apiKeyTrimmed, apiSecret: apiSecretTrimmed });
			const response = await otp.request(phoneNumber);
			providerToken =
				response?.data?.token || response?.data?.refno || response?.data?.reference || response?.data?.request_id || null;
		}

		await createLoginOtpRequest({ token, phoneNumber, providerToken, isDummy: !member, ttlSeconds });
		recordDeviceOtpSend(deviceSessionId);
		return res.json({ ok: true, token, cooldownSeconds });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('requestLoginOtp failed:', err);
		const isProd = process.env.NODE_ENV === 'production';
		const message = err instanceof Error ? err.message : 'internal error';
		const maybeDetails =
			err && typeof err === 'object'
				? (err.response && typeof err.response === 'object' ? err.response.data : err.data)
				: null;
		return res.status(500).json({ error: isProd ? 'internal error' : message, details: isProd ? undefined : maybeDetails });
	}
}

async function verifyLoginOtp(req, res) {
	try {
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone);
		const token = String(req.body?.token || '').trim();
		const otpCode = String(req.body?.otp_code || req.body?.otpCode || '').trim();
		if (!phoneNumber) return res.status(400).json({ error: 'phone_number is required' });
		if (!token) return res.status(400).json({ error: 'token is required' });
		if (!otpCode) return res.status(400).json({ error: 'otp_code is required' });

		// DEV MODE
		if (isDevOtpMode()) {
			if (process.env.NODE_ENV === 'production') {
				return res.status(500).json({ error: 'OTP_DEV_MODE is not allowed in production' });
			}
			const entry = loginOtpRequestStore.get(token);
			if (!entry) return res.status(400).json({ error: 'OTP token ไม่ถูกต้อง หรือหมดอายุ' });
			if (entry.phoneNumber !== phoneNumber) return res.status(400).json({ error: 'phone mismatch' });
			if (Date.now() > entry.expiresAtMs) {
				loginOtpRequestStore.delete(token);
				return res.status(400).json({ error: 'OTP token ไม่ถูกต้อง หรือหมดอายุ' });
			}
			// If not a member request, do not validate OTP; reveal only now.
			const member = await isMemberPhone(phoneNumber);
			if (!member || !entry.codeHash) {
				return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน', code: 'user_not_found' });
			}
			if (sha256(otpCode) !== entry.codeHash) {
				return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้อง', code: 'otp_invalid' });
			}
			loginOtpRequestStore.delete(token);
			const otpJwt = signOtpToken({ phoneNumber });
			setOtpCookie(res, otpJwt);
			await resetOtpRequestCooldown(phoneNumber);
			return res.json({ ok: true, verified: true, phoneNumber });
		}

		const row = await getValidLoginOtpRequest(token);
		if (!row) {
			await deleteLoginOtpRequest(token);
			return res.status(400).json({ error: 'OTP token ไม่ถูกต้อง หรือหมดอายุ' });
		}
		if (String(row.phone_number || '') !== phoneNumber) return res.status(400).json({ error: 'phone mismatch' });

		if (Number(row.is_dummy || 0) === 1 || !row.provider_token) {
			return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน', code: 'user_not_found' });
		}

		const apiKeyTrimmed = typeof process.env.OTP_KEY === 'string' ? process.env.OTP_KEY.trim() : '';
		const apiSecretTrimmed = typeof process.env.OTP_SECRET === 'string' ? process.env.OTP_SECRET.trim() : '';
		if (!apiKeyTrimmed || !apiSecretTrimmed) {
			return res.status(500).json({ error: 'OTP is not configured (missing OTP_KEY/OTP_SECRET)' });
		}

		// eslint-disable-next-line global-require
		const thaibulksmsApi = require('thaibulksms-api');
		const otp = thaibulksmsApi.otp({ apiKey: apiKeyTrimmed, apiSecret: apiSecretTrimmed });
		try {
			await otp.verify(String(row.provider_token), otpCode);
		} catch (providerErr) {
			const mapped = otpProviderErrorResponse(providerErr);
			if (mapped) {
				return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
			}
			throw providerErr;
		}

		await deleteLoginOtpRequest(token);
		const otpJwt = signOtpToken({ phoneNumber });
		setOtpCookie(res, otpJwt);
		await resetOtpRequestCooldown(phoneNumber);
		return res.json({ ok: true, verified: true, phoneNumber });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('verifyLoginOtp failed:', err);
		const mapped = otpProviderErrorResponse(err);
		if (mapped) {
			return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
		}
		const isProd = process.env.NODE_ENV === 'production';
		const message = err instanceof Error ? err.message : 'internal error';
		const maybeDetails =
			err && typeof err === 'object'
				? (err.response && typeof err.response === 'object' ? err.response.data : err.data)
				: null;
		return res.status(500).json({ error: isProd ? 'internal error' : message, details: isProd ? undefined : maybeDetails });
	}
}

async function verifyOtp(req, res) {
	try {
		const phoneNumber = normalizePhone(req.body?.phone_number || req.body?.phoneNumber || req.body?.phone);
		const token = String(req.body?.token || '').trim();
		const otpCode = String(req.body?.otp_code || req.body?.otpCode || '').trim();
		if (!phoneNumber) return res.status(400).json({ error: 'phone_number is required' });
		if (!token) return res.status(400).json({ error: 'token is required' });
		if (!otpCode) return res.status(400).json({ error: 'otp_code is required' });

		if (isDevOtpMode()) {
			if (process.env.NODE_ENV === 'production') {
				return res.status(500).json({ error: 'OTP_DEV_MODE is not allowed in production' });
			}
			const entry = devOtpStore.get(token);
			if (!entry) return res.status(400).json({ error: 'OTP token ไม่ถูกต้อง หรือหมดอายุ', code: 'otp_token_invalid' });
			if (entry.phoneNumber !== phoneNumber) return res.status(400).json({ error: 'phone mismatch' });
			if (Date.now() > entry.expiresAtMs) return res.status(400).json({ error: 'OTP หมดอายุ กรุณาขอรหัสใหม่', code: 'otp_expired' });
			if (entry.attemptsLeft <= 0) return res.status(400).json({ error: 'too many attempts' });
			entry.attemptsLeft -= 1;
			if (sha256(otpCode) !== entry.codeHash) return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้อง', code: 'otp_invalid' });
			devOtpStore.delete(token);

			const otpJwt = signOtpToken({ phoneNumber });
			setOtpCookie(res, otpJwt);
			const { existingUser, prefill } = await loadPrefillForPhone(phoneNumber);
			await resetOtpRequestCooldown(phoneNumber);
			return res.json({ ok: true, verified: true, phoneNumber, existingUser, prefill });
		}

		const apiKey = process.env.OTP_KEY;
		const apiSecret = process.env.OTP_SECRET;
		const apiKeyTrimmed = typeof apiKey === 'string' ? apiKey.trim() : '';
		const apiSecretTrimmed = typeof apiSecret === 'string' ? apiSecret.trim() : '';
		if (!apiKeyTrimmed || !apiSecretTrimmed) {
			return res.status(500).json({ error: 'OTP is not configured (missing OTP_KEY/OTP_SECRET)' });
		}

		// eslint-disable-next-line global-require
		const thaibulksmsApi = require('thaibulksms-api');
		const otp = thaibulksmsApi.otp({ apiKey: apiKeyTrimmed, apiSecret: apiSecretTrimmed });
		let response;
		try {
			response = await otp.verify(token, otpCode);
		} catch (providerErr) {
			const mapped = otpProviderErrorResponse(providerErr);
			if (mapped) {
				return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
			}
			throw providerErr;
		}

		const otpJwt = signOtpToken({ phoneNumber });
		setOtpCookie(res, otpJwt);

		const { existingUser, prefill } = await loadPrefillForPhone(phoneNumber);
		await resetOtpRequestCooldown(phoneNumber);
		return res.json({ ok: true, verified: true, phoneNumber, existingUser, prefill, provider: response?.data || null });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('verifyOtp failed:', err);
		const mapped = otpProviderErrorResponse(err);
		if (mapped) {
			return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
		}
		const isProd = process.env.NODE_ENV === 'production';
		const message = err instanceof Error ? err.message : 'internal error';
		const maybeDetails =
			err && typeof err === 'object'
				? (err.response && typeof err.response === 'object' ? err.response.data : err.data)
				: null;
		return res.status(500).json({ error: isProd ? 'internal error' : message, details: isProd ? undefined : maybeDetails });
	}
}

module.exports = {
	requestOtp,
	verifyOtp,
	requestLoginOtp,
	verifyLoginOtp,
	clearOtpCookie,
	OTP_COOKIE_NAME,
	otpPurpose,
};
