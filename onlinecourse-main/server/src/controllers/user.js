const { getPool } = require('../db');

function buildBaseUrl(req) {
	const host = req.get('host');
	const proto = req.protocol;
	return `${proto}://${host}`;
}

function isValidEmail(email) {
	if (!email) return false;
	const str = String(email).trim().toLowerCase();
	return str.length >= 3 && str.includes('@');
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

function toUserDto(row) {
	const first = typeof row.first_name === 'string' ? row.first_name.trim() : '';
	const last = typeof row.last_name === 'string' ? row.last_name.trim() : '';
	const full = `${first} ${last}`.trim();
	const displayName = full.length > 0 ? full : null;
	return {
		id: String(row.id),
		email: row.email,
		role: row.role,
		name: displayName,
		firstName: row.first_name || null,
		lastName: row.last_name || null,
		phoneNumber: row.phone_number || null,
		isVerified: Boolean(row.is_verified),
		bio: row.bio || null,
		profileImage: row.profile_image_url || null,
	};
}

async function updateProfile(req, res) {
	try {
		const userId = Number(req.user?.id);
		if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'unauthorized' });

		const rawEmail =
			typeof req.body?.email === 'string'
				? req.body.email
				: typeof req.body?.gmail === 'string'
					? req.body.gmail
					: undefined;
		const email = typeof rawEmail === 'string' ? String(rawEmail).trim().toLowerCase() : undefined;
		const firstName = typeof req.body?.firstName === 'string' ? req.body.firstName.trim() : undefined;
		const lastName = typeof req.body?.lastName === 'string' ? req.body.lastName.trim() : undefined;
		const phone = typeof req.body?.phone === 'string' ? normalizePhone(req.body.phone) : undefined;
		const legacyName = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
		const bio = typeof req.body?.bio === 'string' ? req.body.bio : undefined;

		let profileImageUrl;
		if (req.file) {
			const baseUrl = buildBaseUrl(req);
			profileImageUrl = `${baseUrl}/uploads/${encodeURIComponent(req.file.filename)}`;
		}

		const db = getPool();
		const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
		const existing = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
		if (!existing) return res.status(404).json({ error: 'user not found' });

		if (email !== undefined) {
			if (!isValidEmail(email)) {
				return res.status(400).json({ error: 'valid email is required' });
			}
		}

		let emailChanged = false;
		if (email !== undefined) {
			const currentEmail = String(existing.email || '').trim().toLowerCase();
			emailChanged = email !== currentEmail;
			if (emailChanged) {
				const [takenRows] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [
					email,
					userId,
				]);
				if (Array.isArray(takenRows) && takenRows.length > 0) {
					return res.status(409).json({ error: 'Email already registered' });
				}
			}
		}

		const nextFirstName =
			firstName !== undefined
				? firstName
				: legacyName !== undefined
					? legacyName
					: existing.first_name;
		const nextLastName = lastName !== undefined ? lastName : existing.last_name;
		const nextPhone = phone !== undefined ? phone : existing.phone_number;
		const nextBio = bio !== undefined ? bio : existing.bio;
		const nextProfileImageUrl = profileImageUrl !== undefined ? profileImageUrl : existing.profile_image_url;
		const nextEmail = email !== undefined ? email : existing.email;

		// Requirement: profile edits via dashboard should verify email immediately.
		const nextIsVerified = emailChanged ? 1 : existing.is_verified;
		const nextVerificationTokenHash = emailChanged ? null : existing.verification_token_hash;
		const nextVerificationTokenExpiresAt = emailChanged ? null : existing.verification_token_expires_at;

		await db.query(
			'UPDATE users SET email = ?, first_name = ?, last_name = ?, phone_number = ?, bio = ?, profile_image_url = ?, is_verified = ?, verification_token_hash = ?, verification_token_expires_at = ? WHERE id = ?',
			[
				nextEmail || null,
				nextFirstName || null,
				nextLastName || null,
				nextPhone || null,
				nextBio || null,
				nextProfileImageUrl || null,
				nextIsVerified ? 1 : 0,
				nextVerificationTokenHash,
				nextVerificationTokenExpiresAt,
				userId,
			]
		);

		const [updatedRows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
		const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;

		return res.json({ user: updated ? toUserDto(updated) : null });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('updateProfile failed:', err);
		if (err instanceof Error && /ENOENT/.test(err.message)) {
			return res.status(500).json({ error: 'upload folder missing' });
		}
		return res.status(500).json({ error: 'internal error' });
	}
}

module.exports = {
	updateProfile,
};
