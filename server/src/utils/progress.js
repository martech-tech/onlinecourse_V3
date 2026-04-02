function clampInt(value, min, max) {
	const n = Number(value);
	if (!Number.isFinite(n)) return min;
	const i = Math.trunc(n);
	return Math.min(max, Math.max(min, i));
}

/**
 * Calculates course completion percent as an integer (0-100).
 * Formula: (completed / total) * 100
 */
function calculatePercentCompleted(completedLessonsCount, totalLessonsCount) {
	const total = Number(totalLessonsCount);
	const completed = Number(completedLessonsCount);

	if (!Number.isFinite(total) || total <= 0) return 0;
	if (!Number.isFinite(completed) || completed <= 0) return 0;

	const raw = (completed / total) * 100;
	return clampInt(Math.round(raw), 0, 100);
}

/**
 * Returns total number of lessons in a course (modules -> lessons).
 */
async function getTotalLessonsForCourse(db, courseId) {
	let rows;
	try {
		[rows] = await db.query(
			`SELECT COUNT(*) AS total
			FROM lessons l
			INNER JOIN modules m ON m.id = l.module_id
			WHERE m.course_id = ?
				AND l.is_active = 1`,
			[courseId]
		);
	} catch (err) {
		// Backward-compat: older schemas may not have lessons.is_active
		if (err && typeof err === 'object' && err.code === 'ER_BAD_FIELD_ERROR') {
			[rows] = await db.query(
				`SELECT COUNT(*) AS total
				FROM lessons l
				INNER JOIN modules m ON m.id = l.module_id
				WHERE m.course_id = ?`,
				[courseId]
			);
		} else {
			throw err;
		}
	}

	const total = Array.isArray(rows) && rows.length > 0 ? Number(rows[0].total) : 0;
	return Number.isFinite(total) ? total : 0;
}

module.exports = {
	calculatePercentCompleted,
	getTotalLessonsForCourse,
};
