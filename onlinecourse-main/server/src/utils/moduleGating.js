const { getPool } = require('../db');

function toInt(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const i = Math.trunc(n);
	if (i <= 0) return null;
	return i;
}

async function resolveModuleId(moduleIdOrPublicId) {
	const asInt = toInt(moduleIdOrPublicId);
	if (asInt) return asInt;
	const publicId = String(moduleIdOrPublicId || '').trim();
	if (!publicId) return null;

	const [rows] = await getPool().query('SELECT id FROM modules WHERE public_id = ? LIMIT 1', [publicId]);
	const row = Array.isArray(rows) && rows.length ? rows[0] : null;
	return row?.id ? Number(row.id) : null;
}

/**
 * Returns true if the module is unlocked for this enrollment.
 * Accepts a numeric module id or a module public_id.
 */
async function isModuleUnlocked({ enrollmentId, moduleId }) {
	const eId = toInt(enrollmentId);
	if (!eId) return false;
	const mId = await resolveModuleId(moduleId);
	if (!mId) return false;

	const [rows] = await getPool().query(
		'SELECT 1 FROM module_access WHERE enrollment_id = ? AND module_id = ? LIMIT 1',
		[eId, mId]
	);
	return Array.isArray(rows) && rows.length > 0;
}

/**
 * Express middleware for module gating.
 * Expects :enrollmentId and :moduleId (numeric or public id).
 */
function requireModuleUnlocked() {
	return async (req, res, next) => {
		try {
			const ok = await isModuleUnlocked({
				enrollmentId: req.params.enrollmentId,
				moduleId: req.params.moduleId,
			});
			if (!ok) return res.status(403).json({ error: 'Please start the module first' });
			return next();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('requireModuleUnlocked failed:', err);
			return res.status(500).json({ error: 'internal error' });
		}
	};
}

module.exports = {
	isModuleUnlocked,
	requireModuleUnlocked,
};
