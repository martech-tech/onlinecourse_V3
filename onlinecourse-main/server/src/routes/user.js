const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { requireAuth } = require('../middleware/requireAuth');
const { updateProfile } = require('../controllers/user');
const { getPool } = require('../db');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const userId = req.user?.id ? String(req.user.id) : 'anon';
		const ext = path.extname(file.originalname || '').slice(0, 10);
		cb(null, `u${userId}-${Date.now()}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
});

router.put('/profile', requireAuth, upload.single('profileImage'), updateProfile);

function parseJsonArray(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String);
	try {
		const arr = JSON.parse(String(value));
		return Array.isArray(arr) ? arr.map(String) : [];
	} catch {
		return [];
	}
}

// List current user's enrolled courses with progress
router.get('/enrollments', requireAuth, async (req, res) => {
	try {
		const userId = Number(req.user?.id);
		if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'unauthorized' });

		const db = getPool();
		let rows;
		try {
			const [r] = await db.query(
				`SELECT
					e.id AS enrollment_id,
					e.course_id,
					e.enrolled_at,
					e.progress_percent,
					cp.percent_completed AS cp_percent_completed,
					c.title,
					c.slug,
					c.thumbnail_url,
					c.categories_json,
					c.level,
					c.visibility_type
				FROM enrollments e
				INNER JOIN courses c ON c.id = e.course_id
				LEFT JOIN course_progress cp ON cp.user_id = e.user_id AND cp.course_id = e.course_id
				WHERE e.user_id = ?
				ORDER BY e.enrolled_at DESC, e.id DESC`,
				[userId]
			);
			rows = r;
		} catch (qErr) {
			// Backward-compat: course_progress is optional / legacy.
			if (qErr && typeof qErr === 'object' && qErr.code === 'ER_NO_SUCH_TABLE') {
				const [r] = await db.query(
					`SELECT
						e.id AS enrollment_id,
						e.course_id,
						e.enrolled_at,
						e.progress_percent,
						NULL AS cp_percent_completed,
						c.title,
						c.slug,
						c.thumbnail_url,
						c.categories_json,
						c.level,
						c.visibility_type
					FROM enrollments e
					INNER JOIN courses c ON c.id = e.course_id
					WHERE e.user_id = ?
					ORDER BY e.enrolled_at DESC, e.id DESC`,
					[userId]
				);
				rows = r;
			} else {
				throw qErr;
			}
		}

		const enrollmentIds = (Array.isArray(rows) ? rows : [])
			.map((r) => Number(r.enrollment_id))
			.filter((id) => Number.isFinite(id) && id > 0);

		const continueLessonSlugByEnrollmentId = new Map();
		if (enrollmentIds.length) {
			try {
				const placeholders = enrollmentIds.map(() => '?').join(',');
				const [continueRows] = await db.query(
					`SELECT
						t.enrollment_id,
						l.slug AS continue_lesson_slug
					FROM (
						SELECT
							enrollment_id,
							lesson_id,
							ROW_NUMBER() OVER (PARTITION BY enrollment_id ORDER BY completed_at DESC, lesson_id DESC) AS rn
						FROM lesson_completions
						WHERE enrollment_id IN (${placeholders})
					) t
					INNER JOIN lessons l ON l.id = t.lesson_id
					WHERE t.rn = 1`,
					enrollmentIds
				);

				(Array.isArray(continueRows) ? continueRows : []).forEach((row) => {
					const enrollmentId = String(row.enrollment_id);
					const slug = row.continue_lesson_slug ? String(row.continue_lesson_slug) : '';
					if (enrollmentId && slug) continueLessonSlugByEnrollmentId.set(enrollmentId, slug);
				});
			} catch (contErr) {
				// Backward-compat: lesson_completions/lessons might not exist in older DBs.
				if (!(contErr && typeof contErr === 'object' && contErr.code === 'ER_NO_SUCH_TABLE')) {
					throw contErr;
				}
			}
		}

		const items = (Array.isArray(rows) ? rows : []).map((r) => {
			const categories = parseJsonArray(r.categories_json);
			const rawPercent = r.cp_percent_completed != null ? Number(r.cp_percent_completed) : Number(r.progress_percent);
			const percent = Number.isFinite(rawPercent) ? Math.max(0, Math.min(100, Math.trunc(rawPercent))) : 0;
			const enrollmentId = String(r.enrollment_id);
			return {
				enrollmentId,
				course: {
					id: String(r.course_id),
					title: r.title,
					slug: r.slug,
					thumbnailUrl: r.thumbnail_url || '',
					categories,
					level: r.level || 'All Levels',
					visibility: { type: r.visibility_type === 'password' ? 'password' : 'public' },
				},
				continueLessonSlug: continueLessonSlugByEnrollmentId.get(enrollmentId) || null,
				progress: {
					percent,
				},
				enrolledAt: r.enrolled_at,
			};
		});

		return res.json({ enrollments: items });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

module.exports = router;
