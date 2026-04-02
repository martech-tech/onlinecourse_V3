const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getPool } = require('../db');
const { makeSlug } = require('../utils/slug');
const { hashPassword, verifyPassword } = require('../utils/courseAuth');
const { makeRegisterCode, REGISTER_CODE_HEX_LEN } = require('../utils/registerCode');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { calculatePercentCompleted, getTotalLessonsForCourse } = require('../utils/progress');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'oc_auth';
const OTP_COOKIE_NAME = process.env.OTP_COOKIE_NAME || 'oc_otp';

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

function clearOtpCookie(res) {
	res.clearCookie(OTP_COOKIE_NAME, cookieOptions());
}

function tryGetOtpPhoneFromRequest(req) {
	try {
		const token = req.cookies ? req.cookies[OTP_COOKIE_NAME] : null;
		if (!token) return null;
		const payload = jwt.verify(String(token), jwtSecret());
		if (!payload || typeof payload !== 'object') return null;
		if (payload.purpose !== (process.env.OTP_PURPOSE || 'course_register')) return null;
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

const router = express.Router();

function buildBaseUrl(req) {
	const host = req.get('host');
	const forwardedProto = req.get('x-forwarded-proto');
	const proto = forwardedProto ? String(forwardedProto).split(',')[0].trim() : req.protocol;
	return `${proto}://${host}`;
}

function extensionFromImageMime(mime) {
	const m = String(mime || '').toLowerCase();
	if (m === 'image/jpeg') return '.jpg';
	if (m === 'image/png') return '.png';
	if (m === 'image/webp') return '.webp';
	if (m === 'image/gif') return '.gif';
	return '';
}

const uploadsRootDir = process.env.VERCEL 
	? path.join('/tmp', 'uploads')
	: path.join(__dirname, '..', '..', 'uploads');

const courseThumbsDir = path.join(uploadsRootDir, 'course-thumbnails');
if (!fs.existsSync(courseThumbsDir)) {
	fs.mkdirSync(courseThumbsDir, { recursive: true });
}

const courseThumbnailStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, courseThumbsDir),
	filename: (_req, file, cb) => {
		const ext = extensionFromImageMime(file.mimetype) || '.jpg';
		cb(null, `course-thumb-${Date.now()}-${crypto.randomUUID()}${ext}`);
	},
});

const uploadCourseThumbnail = multer({
	storage: courseThumbnailStorage,
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 1,
	},
	fileFilter: (_req, file, cb) => {
		const ext = extensionFromImageMime(file?.mimetype);
		if (!ext) {
			cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
			return;
		}
		cb(null, true);
	},
});

function uploadCourseThumbnailMiddleware(req, res, next) {
	uploadCourseThumbnail.single('thumbnail')(req, res, (err) => {
		if (!err) return next();
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(413).json({ error: 'Thumbnail must be <= 5MB' });
			}
			return res.status(400).json({ error: err.message || 'Upload failed' });
		}
		return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
	});
}

async function ensureUniqueSlug(baseSlug) {
	let candidate = baseSlug;
	let suffix = 1;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const [rows] = await getPool().query('SELECT 1 FROM courses WHERE slug = ? LIMIT 1', [candidate]);
		const exists = Array.isArray(rows) && rows.length > 0;
		if (!exists) return candidate;
		candidate = `${baseSlug}-${suffix}`;
		suffix += 1;
	}
}

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

function formatSoldCount(value) {
	const sold = Number(value) || 0;
	if (sold >= 1000) {
		const short = (sold / 1000).toFixed(1).replace(/\.0$/, '');
		return `Sold ${short}k`;
	}
	return `Sold ${sold}`;
}

async function getLinkedBook(db, bookProductId) {
	if (!bookProductId) return null;
	const [productRows] = await db.query(
		`SELECT id, public_id, name, description, details, tags_json, price, compare_at_price,
			stock_left, sold_count, external_url, badge
		FROM shop_products
		WHERE id = ? AND is_active = 1
		LIMIT 1`,
		[bookProductId]
	);
	if (!Array.isArray(productRows) || productRows.length === 0) return null;
	const product = productRows[0];
	const [imageRows] = await db.query(
		`SELECT image_url
		FROM shop_product_images
		WHERE product_id = ?
		ORDER BY sort_order ASC, id ASC`,
		[bookProductId]
	);
	const images = Array.isArray(imageRows) ? imageRows.map((row) => row.image_url) : [];
	return {
		id: product.public_id,
		name: product.name,
		description: product.description || '',
		details: product.details || undefined,
		tags: parseJsonArray(product.tags_json),
		price: Number(product.price) || 0,
		compareAtPrice:
			product.compare_at_price != null ? Number(product.compare_at_price) : Number(product.price) || 0,
		images,
		stockLeft: Number(product.stock_left) || 0,
		soldCount: formatSoldCount(product.sold_count),
		externalUrl: product.external_url || undefined,
		badge: product.badge || undefined,
	};
}

function toCourseDto(courseRow, moduleLessonRows, linkedBook) {
	const modulesByPublicId = new Map();
	for (const row of moduleLessonRows) {
		const modulePublicId = row.module_public_id;
		if (!modulesByPublicId.has(modulePublicId)) {
			modulesByPublicId.set(modulePublicId, {
				id: modulePublicId,
				title: row.module_title,
				order: row.module_order,
				lessons: [],
			});
		}

		if (row.lesson_public_id) {
			modulesByPublicId.get(modulePublicId).lessons.push({
				id: row.lesson_public_id,
				title: row.lesson_title,
				slug: row.lesson_slug,
				order: row.lesson_order,
				durationSeconds: row.duration_seconds ?? undefined,
				type: row.type || 'video',
				video: row.video_url
					? { provider: row.video_provider || 'unknown', url: row.video_url }
					: undefined,
				contentHtml: row.content_html || undefined,
				attachments: [],
			});
		}
	}

	const modules = Array.from(modulesByPublicId.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	return {
		_id: String(courseRow.id),
		title: courseRow.title,
		slug: courseRow.slug,
		descriptionHtml: courseRow.description_html || '',
		thumbnailUrl: courseRow.thumbnail_url || '',
		introVideo: courseRow.intro_video_url
			? { provider: courseRow.intro_video_provider || 'unknown', url: courseRow.intro_video_url }
			: undefined,
		level: courseRow.level || 'All Levels',
		categories: parseJsonArray(courseRow.categories_json),
		tags: parseJsonArray(courseRow.tags_json),
		pricing: {
				model: courseRow.pricing_model === 'paid' ? 'paid' : 'free',
				amount:
					courseRow.pricing_model === 'paid' && courseRow.pricing_amount != null
						? Number(courseRow.pricing_amount)
						: undefined,
				compareAt:
					courseRow.compare_at_price != null ? Number(courseRow.compare_at_price) : undefined,
				currency: courseRow.pricing_currency || 'THB',
		},
		linkedBook: linkedBook || undefined,
		visibility: { type: courseRow.visibility_type === 'password' ? 'password' : 'public' },
		settings: {
			// Legacy compatibility: old schema had is_public_course.
			// New schema treats a course as "public" when not password protected.
			isPublicCourse: courseRow.visibility_type !== 'password',
			enableQna: Boolean(courseRow.enable_qna),
		},
		modules,
		status: courseRow.status,
		createdAt: courseRow.created_at,
		updatedAt: courseRow.updated_at,
	};
}

function normalizeStringArray(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

router.post('/', requireAdmin, async (req, res) => {
	try {
		const {
			title,
			slug,
			descriptionHtml,
			thumbnailUrl,
			introVideo,
			level,
			categories,
			tags,
			pricing,
			visibility,
			settings,
			modules,
			status,
		} = req.body || {};

		if (!title || String(title).trim().length === 0) {
			return res.status(400).json({ error: 'title is required' });
		}

		const baseSlug = makeSlug(slug || title);
		if (!baseSlug) {
			return res.status(400).json({ error: 'slug could not be generated' });
		}
		const uniqueSlug = await ensureUniqueSlug(baseSlug);
		const registerCode = makeRegisterCode(title);
		if (!registerCode) {
			return res.status(400).json({ error: 'register code could not be generated' });
		}

		let visibilityType = visibility?.type || 'public';
		if (visibilityType !== 'public' && visibilityType !== 'password') visibilityType = 'public';

		const passwordHash =
			visibilityType === 'password' ? await hashPassword(visibility?.password) : '';

		const categoriesArr = normalizeStringArray(categories);
		const tagsArr = normalizeStringArray(tags);
		const modulesArr = Array.isArray(modules) ? modules : [];

		const db = getPool();
		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();

			const [courseResult] = await conn.query(
				`INSERT INTO courses (
					title, register_code, slug, description_html, thumbnail_url,
					intro_video_url, intro_video_provider,
					level, categories_json, tags_json,
					pricing_model, pricing_amount, compare_at_price, pricing_currency,
					book_product_id,
					visibility_type, password_hash,
					enable_qna,
					status
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
				[
					title,
					registerCode,
					uniqueSlug,
					descriptionHtml || '',
					thumbnailUrl || '',
					introVideo?.url || null,
					introVideo?.provider || (introVideo?.url ? 'unknown' : null),
					level || 'All Levels',
					JSON.stringify(categoriesArr),
					JSON.stringify(tagsArr),
					pricing?.model === 'paid' ? 'paid' : 'free',
					pricing?.model === 'paid' ? Number(pricing?.amount || 0) : null,
					pricing?.compareAt != null ? Number(pricing.compareAt) : null,
					pricing?.currency || 'THB',
					Number.isFinite(Number(req.body?.bookProductId)) ? Number(req.body.bookProductId) : null,
					visibilityType,
					visibilityType === 'password' ? passwordHash : null,
					settings?.enableQna !== false ? 1 : 0,
					status === 'published' ? 'published' : 'draft',
				]
			);

			const courseId = courseResult.insertId;
			const usedLessonSlugs = new Set();

			for (let mi = 0; mi < modulesArr.length; mi += 1) {
				const m = modulesArr[mi] || {};
				const modulePublicId = String(m.id || crypto.randomUUID());
				const moduleTitle = String(m.title || '').trim() || `Module ${mi + 1}`;
				const moduleOrder = Number.isFinite(m.order) ? Number(m.order) : mi;

				const [moduleResult] = await conn.query(
					'INSERT INTO modules (course_id, public_id, title, module_order) VALUES (?, ?, ?, ?)',
					[courseId, modulePublicId, moduleTitle, moduleOrder]
				);
				const moduleId = moduleResult.insertId;

				const lessonsArr = Array.isArray(m.lessons) ? m.lessons : [];
				for (let li = 0; li < lessonsArr.length; li += 1) {
					const l = lessonsArr[li] || {};
					const lessonPublicId = String(l.id || crypto.randomUUID());
					const lessonTitle = String(l.title || '').trim() || `Lesson ${li + 1}`;
					let lessonSlug = makeSlug(l.slug || lessonTitle) || `lesson-${li + 1}`;
					let suffix = 2;
					while (usedLessonSlugs.has(lessonSlug)) {
						lessonSlug = `${lessonSlug}-${suffix}`;
						suffix += 1;
					}
					usedLessonSlugs.add(lessonSlug);

					const lessonOrder = Number.isFinite(l.order) ? Number(l.order) : li;
					const durationSeconds =
						Number.isFinite(l.durationSeconds) && Number(l.durationSeconds) > 0
							? Number(l.durationSeconds)
							: null;

					await conn.query(
						`INSERT INTO lessons (
							module_id, public_id, title, slug, lesson_order,
							duration_seconds, type,
							video_url, video_provider,
							content_html
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
						[
							moduleId,
							lessonPublicId,
							lessonTitle,
							lessonSlug,
							lessonOrder,
							durationSeconds,
							l.type || 'video',
							l.video?.url || null,
							l.video?.provider || (l.video?.url ? 'unknown' : null),
							l.contentHtml || null,
						]
					);
				}
			}

			await conn.commit();

			const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ? LIMIT 1', [courseId]);
			const [mlRows] = await db.query(
				`SELECT
					m.public_id AS module_public_id,
					m.title AS module_title,
					m.module_order AS module_order,
					l.public_id AS lesson_public_id,
					l.title AS lesson_title,
					l.slug AS lesson_slug,
					l.lesson_order AS lesson_order,
					l.duration_seconds AS duration_seconds,
					l.type AS type,
					l.video_url AS video_url,
					l.video_provider AS video_provider,
					l.content_html AS content_html
				FROM modules m
				LEFT JOIN lessons l ON l.module_id = m.id
				WHERE m.course_id = ?
				ORDER BY m.module_order ASC, l.lesson_order ASC`,
				[courseId]
			);

			const linkedBook = await getLinkedBook(db, courseRows[0]?.book_product_id);
			const courseDto = toCourseDto(courseRows[0], mlRows, linkedBook);
			return res.status(201).json({ course: courseDto });
		} catch (err) {
			await conn.rollback();
			throw err;
		} finally {
			conn.release();
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.put('/:slug', requireAdmin, async (req, res) => {
	try {
		const { slug } = req.params;
		// Admin-only route: allow editing locked courses without requiring the course password.

		const {
			title,
			descriptionHtml,
			thumbnailUrl,
			introVideo,
			level,
			categories,
			tags,
			pricing,
			visibility,
			settings,
			modules,
			status,
		} = req.body || {};

		if (!title || typeof title !== 'string' || title.trim().length < 2) {
			return res.status(400).json({ error: 'title is required' });
		}

		const db = getPool();
		const [courseRows] = await db.query('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
		if (!courseRows || courseRows.length === 0) return res.status(404).json({ error: 'not found' });
		const courseRow = courseRows[0];

		const categoriesArr = normalizeStringArray(categories);
		const tagsArr = normalizeStringArray(tags);
		const modulesArr = Array.isArray(modules) ? modules : [];
		const nextRegisterCode = makeRegisterCode(title);
		if (!nextRegisterCode) {
			return res.status(400).json({ error: 'register code could not be generated' });
		}

		const requestedVisibilityType = visibility?.type === 'password' ? 'password' : 'public';
		let nextPasswordHash = courseRow.password_hash;
		if (requestedVisibilityType === 'public') {
			nextPasswordHash = null;
		} else {
			const nextPassword = typeof visibility?.password === 'string' ? visibility.password.trim() : '';
			if (nextPassword) {
				nextPasswordHash = await hashPassword(nextPassword);
			}
			// else: keep existing hash
		}

		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();

			await conn.query(
				`UPDATE courses SET
					title = ?,
					register_code = ?,
					description_html = ?,
					thumbnail_url = ?,
					intro_video_url = ?,
					intro_video_provider = ?,
					level = ?,
					categories_json = ?,
					tags_json = ?,
					pricing_model = ?,
					pricing_amount = ?,
					compare_at_price = ?,
					pricing_currency = ?,
					book_product_id = ?,
					visibility_type = ?,
					password_hash = ?,
					enable_qna = ?,
					status = ?
				WHERE id = ?`,
				[
					title.trim(),
					nextRegisterCode,
					descriptionHtml || '',
					thumbnailUrl || '',
					introVideo?.url || null,
					introVideo?.provider || (introVideo?.url ? 'unknown' : null),
					level || 'All Levels',
					JSON.stringify(categoriesArr),
					JSON.stringify(tagsArr),
					pricing?.model === 'paid' ? 'paid' : 'free',
					pricing?.model === 'paid' ? Number(pricing?.amount || 0) : null,
					pricing?.compareAt != null ? Number(pricing.compareAt) : null,
					pricing?.currency || 'THB',
					Number.isFinite(Number(req.body?.bookProductId)) ? Number(req.body.bookProductId) : null,
					requestedVisibilityType,
					nextPasswordHash,
					settings?.enableQna !== false ? 1 : 0,
					status === 'published' ? 'published' : 'draft',
					courseRow.id,
				]
			);

			// Replace curriculum
			await conn.query('DELETE FROM modules WHERE course_id = ?', [courseRow.id]);

			const usedLessonSlugs = new Set();
			for (let mi = 0; mi < modulesArr.length; mi += 1) {
				const m = modulesArr[mi] || {};
				const modulePublicId = String(m.id || crypto.randomUUID());
				const moduleTitle = String(m.title || '').trim() || `Module ${mi + 1}`;
				const moduleOrder = Number.isFinite(m.order) ? Number(m.order) : mi;

				const [moduleResult] = await conn.query(
					'INSERT INTO modules (course_id, public_id, title, module_order) VALUES (?, ?, ?, ?)',
					[courseRow.id, modulePublicId, moduleTitle, moduleOrder]
				);
				const moduleId = moduleResult.insertId;

				const lessonsArr = Array.isArray(m.lessons) ? m.lessons : [];
				for (let li = 0; li < lessonsArr.length; li += 1) {
					const l = lessonsArr[li] || {};
					const lessonPublicId = String(l.id || crypto.randomUUID());
					const lessonTitle = String(l.title || '').trim() || `Lesson ${li + 1}`;
					let lessonSlug = makeSlug(l.slug || lessonTitle) || `lesson-${li + 1}`;
					let suffix = 2;
					while (usedLessonSlugs.has(lessonSlug)) {
						lessonSlug = `${lessonSlug}-${suffix}`;
						suffix += 1;
					}
					usedLessonSlugs.add(lessonSlug);

					const lessonOrder = Number.isFinite(l.order) ? Number(l.order) : li;
					const durationSeconds =
						Number.isFinite(l.durationSeconds) && Number(l.durationSeconds) > 0
							? Number(l.durationSeconds)
							: null;

					await conn.query(
						`INSERT INTO lessons (
							module_id, public_id, title, slug, lesson_order,
							duration_seconds, type,
							video_url, video_provider,
							content_html
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
						[
							moduleId,
							lessonPublicId,
							lessonTitle,
							lessonSlug,
							lessonOrder,
							durationSeconds,
							l.type || 'video',
							l.video?.url || null,
							l.video?.provider || (l.video?.url ? 'unknown' : null),
							l.contentHtml || null,
						]
					);
				}
			}

			await conn.commit();
		} catch (err) {
			await conn.rollback();
			throw err;
		} finally {
			conn.release();
		}

		const [updatedCourseRows] = await db.query('SELECT * FROM courses WHERE id = ? LIMIT 1', [courseRow.id]);
		const [mlRows] = await db.query(
			`SELECT
				m.public_id AS module_public_id,
				m.title AS module_title,
				m.module_order AS module_order,
				l.public_id AS lesson_public_id,
				l.title AS lesson_title,
				l.slug AS lesson_slug,
				l.lesson_order AS lesson_order,
				l.duration_seconds AS duration_seconds,
				l.type AS type,
				l.video_url AS video_url,
				l.video_provider AS video_provider,
				l.content_html AS content_html
			FROM modules m
			LEFT JOIN lessons l ON l.module_id = m.id
			WHERE m.course_id = ?
			ORDER BY m.module_order ASC, l.lesson_order ASC`,
			[courseRow.id]
		);

		const linkedBook = await getLinkedBook(db, updatedCourseRows[0]?.book_product_id);
		const courseDto = toCourseDto(updatedCourseRows[0], mlRows, linkedBook);
		return res.json({ course: courseDto });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/', async (_req, res) => {
	try {
		const [rows] = await getPool().query(
			`SELECT
				id, title, slug, thumbnail_url, categories_json, level,
				pricing_model, pricing_amount, compare_at_price, pricing_currency,
				visibility_type,
				updated_at
			FROM courses
			ORDER BY updated_at DESC`
		);

		const userId = tryGetUserIdFromRequest(_req);
		let enrolledIds = new Set();
		if (userId && Array.isArray(rows) && rows.length) {
			const courseIds = rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
			if (courseIds.length) {
				const placeholders = courseIds.map(() => '?').join(', ');
				const [enrolledRows] = await getPool().query(
					`SELECT course_id FROM enrollments WHERE user_id = ? AND course_id IN (${placeholders})`,
					[userId, ...courseIds]
				);
				if (Array.isArray(enrolledRows)) {
					enrolledIds = new Set(enrolledRows.map((row) => Number(row.course_id)));
				}
			}
		}

		const items = rows.map((c) => ({
			title: c.title,
			slug: c.slug,
			thumbnailUrl: c.thumbnail_url || '',
			categories: parseJsonArray(c.categories_json),
			level: c.level || 'All Levels',
			pricing: {
				model: c.pricing_model === 'paid' ? 'paid' : 'free',
				amount: c.pricing_model === 'paid' && c.pricing_amount != null ? Number(c.pricing_amount) : undefined,
				compareAt: c.compare_at_price != null ? Number(c.compare_at_price) : undefined,
				currency: c.pricing_currency || 'THB',
			},
			locked: c.visibility_type === 'password',
			enrolled: enrolledIds.has(Number(c.id)),
			updatedAt: c.updated_at,
		}));

		return res.json({ courses: items });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/admin', requireAdmin, async (_req, res) => {
	try {
		const [rows] = await getPool().query(
			`SELECT
				c.id,
				c.title,
				c.slug,
				c.thumbnail_url,
				c.categories_json,
				c.level,
				c.pricing_model,
				c.pricing_amount,
				c.compare_at_price,
				c.pricing_currency,
				c.visibility_type,
				c.status,
				c.created_at,
				c.updated_at,
				(SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count,
				(
					SELECT COUNT(*)
					FROM lessons l
					INNER JOIN modules m2 ON m2.id = l.module_id
					WHERE m2.course_id = c.id
				) AS lesson_count
			FROM courses c
			ORDER BY c.updated_at DESC`
		);

		const items = (Array.isArray(rows) ? rows : []).map((c) => ({
			id: String(c.id),
			title: c.title,
			slug: c.slug,
			thumbnailUrl: c.thumbnail_url || '',
			categories: parseJsonArray(c.categories_json),
			level: c.level || 'All Levels',
			pricing: {
				model: c.pricing_model === 'paid' ? 'paid' : 'free',
				amount:
					c.pricing_model === 'paid' && c.pricing_amount != null ? Number(c.pricing_amount) : undefined,
				compareAt: c.compare_at_price != null ? Number(c.compare_at_price) : undefined,
				currency: c.pricing_currency || 'THB',
			},
			visibilityType: c.visibility_type === 'password' ? 'password' : 'public',
			status: c.status === 'published' ? 'published' : 'draft',
			moduleCount: Number(c.module_count) || 0,
			lessonCount: Number(c.lesson_count) || 0,
			createdAt: c.created_at,
			updatedAt: c.updated_at,
		}));

		return res.json({ courses: items });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.post('/admin/thumbnail', requireAdmin, uploadCourseThumbnailMiddleware, async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'thumbnail file is required' });
		const baseUrl = buildBaseUrl(req);
		const publicUrl = `${baseUrl}/uploads/course-thumbnails/${encodeURIComponent(req.file.filename)}`;
		return res.json({ thumbnailUrl: publicUrl });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/admin/:slug', requireAdmin, async (req, res) => {
	try {
		const { slug } = req.params;
		const db = getPool();
		const [courseRows] = await db.query('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
		if (!Array.isArray(courseRows) || courseRows.length === 0) return res.status(404).json({ error: 'not found' });
		const courseRow = courseRows[0];

		const [mlRows] = await db.query(
			`SELECT
				m.public_id AS module_public_id,
				m.title AS module_title,
				m.module_order AS module_order,
				l.public_id AS lesson_public_id,
				l.title AS lesson_title,
				l.slug AS lesson_slug,
				l.lesson_order AS lesson_order,
				l.duration_seconds AS duration_seconds,
				l.type AS type,
				l.video_url AS video_url,
				l.video_provider AS video_provider,
				l.content_html AS content_html
			FROM modules m
			LEFT JOIN lessons l ON l.module_id = m.id
			WHERE m.course_id = ?
			ORDER BY m.module_order ASC, l.lesson_order ASC`,
			[courseRow.id]
		);

		const linkedBook = await getLinkedBook(db, courseRow.book_product_id);
		const courseDto = toCourseDto(courseRow, mlRows, linkedBook);
		return res.json({ course: courseDto });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

// Resolve short register URL code -> course
// Used by /register/[code] page to avoid exposing long course slugs.
router.get('/register-code/:code', async (req, res) => {
	try {
		const raw = String(req.params.code || '').trim().toLowerCase();
		const re = new RegExp(`^[a-f0-9]{${REGISTER_CODE_HEX_LEN}}$`);
		if (!re.test(raw)) return res.status(400).json({ error: 'invalid_register_code' });

		const db = getPool();
		const [rows] = await db.query('SELECT title, slug, register_code, thumbnail_url FROM courses WHERE register_code = ? LIMIT 1', [
			raw,
		]);
		if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'not found' });
		const row = rows[0];
		return res.json({
			course: {
				title: row.title,
				slug: row.slug,
				registerCode: row.register_code,
				thumbnailUrl: row.thumbnail_url || '',
			},
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

router.get('/:slug', async (req, res) => {
	try {
		const { slug } = req.params;
		const password = req.query.password ? String(req.query.password) : '';

		const db = getPool();
		const [courseRows] = await db.query('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
		if (!courseRows || courseRows.length === 0) return res.status(404).json({ error: 'not found' });
		const courseRow = courseRows[0];

		const isPasswordProtected = courseRow.visibility_type === 'password';
		if (isPasswordProtected) {
			let ok = await verifyPassword(password, courseRow.password_hash);
			if (!ok) {
				// If user is logged in and enrolled, allow access without password.
				const userId = tryGetUserIdFromRequest(req);
				if (userId) {
					const [enrRows] = await db.query(
						'SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
						[userId, courseRow.id]
					);
					ok = Array.isArray(enrRows) && enrRows.length > 0;
				}
			}

			if (!ok) {
				const linkedBook = await getLinkedBook(db, courseRow.book_product_id);
				return res.json({
					locked: true,
					course: {
						title: courseRow.title,
						slug: courseRow.slug,
						thumbnailUrl: courseRow.thumbnail_url || '',
						categories: parseJsonArray(courseRow.categories_json),
						level: courseRow.level || 'All Levels',
						pricing: {
							model: courseRow.pricing_model === 'paid' ? 'paid' : 'free',
							amount:
								courseRow.pricing_model === 'paid' && courseRow.pricing_amount != null
									? Number(courseRow.pricing_amount)
									: undefined,
							compareAt: courseRow.compare_at_price != null ? Number(courseRow.compare_at_price) : undefined,
							currency: courseRow.pricing_currency || 'THB',
						},
						linkedBook: linkedBook || undefined,
						visibility: { type: 'password' },
					},
				});
			}
		}

		const [mlRows] = await db.query(
			`SELECT
				m.public_id AS module_public_id,
				m.title AS module_title,
				m.module_order AS module_order,
				l.public_id AS lesson_public_id,
				l.title AS lesson_title,
				l.slug AS lesson_slug,
				l.lesson_order AS lesson_order,
				l.duration_seconds AS duration_seconds,
				l.type AS type,
				l.video_url AS video_url,
				l.video_provider AS video_provider,
				l.content_html AS content_html
			FROM modules m
			LEFT JOIN lessons l ON l.module_id = m.id
			WHERE m.course_id = ?
			ORDER BY m.module_order ASC, l.lesson_order ASC`,
			[courseRow.id]
		);

		const linkedBook = await getLinkedBook(db, courseRow.book_product_id);
		const courseDto = toCourseDto(courseRow, mlRows, linkedBook);
		return res.json({ locked: false, course: courseDto });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

function toInt(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const i = Math.trunc(n);
	if (i <= 0) return null;
	return i;
}

function normalizeEmail(email) {
	const e = String(email || '').trim().toLowerCase();
	return e.length > 0 ? e : '';
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

function isValidEmail(email) {
	const str = String(email || '').trim().toLowerCase();
	return str.length >= 3 && str.includes('@');
}

function isThaiPhone10Digits(phone) {
	return /^0\d{9}$/.test(String(phone || ''));
}

function truthy(value) {
	if (typeof value === 'boolean') return value;
	const v = String(value || '').trim().toLowerCase();
	return v === '1' || v === 'true' || v === 'yes' || v === 'on' || v === 'checked';
}

function splitFullName(fullName) {
	const raw = String(fullName || '').trim().replace(/\s+/g, ' ');
	if (!raw) return { firstName: null, lastName: null };
	const parts = raw.split(' ');
	if (parts.length === 1) return { firstName: raw, lastName: null };
	return { firstName: parts[0] || null, lastName: parts.slice(1).join(' ') || null };
}

async function getCourseRowBySlug(slug) {
	const [rows] = await getPool().query('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
	return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function findUserByPhoneOrEmail(conn, { phone, email }) {
	const nextPhone = normalizePhone(phone);
	const nextEmail = normalizeEmail(email);

	if (nextPhone) {
		const [rows] = await conn.query('SELECT * FROM users WHERE phone_number = ? LIMIT 1', [nextPhone]);
		if (Array.isArray(rows) && rows.length) return rows[0];
	}
	if (nextEmail) {
		const [rows] = await conn.query('SELECT * FROM users WHERE email = ? LIMIT 1', [nextEmail]);
		if (Array.isArray(rows) && rows.length) return rows[0];
	}
	return null;
}

async function createUserForCourseRegistration(conn, { phone, email, fullName }) {
	const nextPhone = normalizePhone(phone);
	const nextEmail = normalizeEmail(email);
	if (!nextPhone) throw new Error('phone is required');
	if (!nextEmail) throw new Error('email is required');

	const { firstName, lastName } = splitFullName(fullName);
	const passwordHash = await hashPassword('00000000');

	const [result] = await conn.query(
		'INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number, is_verified) VALUES (?, ?, \'student\', ?, ?, ?, 1)',
		[nextEmail, passwordHash, firstName, lastName, nextPhone]
	);
	const userId = result.insertId;
	const [rows] = await conn.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
	return Array.isArray(rows) && rows.length ? rows[0] : { id: userId };
}

async function ensureEnrollmentUnlockedFirstModule(conn, { userId, courseId }) {
	const existing = await getEnrollmentRow({ userId, courseId });
	if (existing) {
		return { enrollmentId: Number(existing.id), alreadyEnrolled: true };
	}

	const totalLessonsCount = await getTotalLessonsForCourse(conn, courseId);
	let insertResult;
	try {
		[insertResult] = await conn.query(
			`INSERT INTO enrollments (
				user_id, course_id,
				progress_percent, completed_lessons_count, total_lessons_count
			) VALUES (?, ?, 0, 0, ?)` ,
			[userId, courseId, totalLessonsCount]
		);
	} catch (err) {
		// Backward-compat: older schemas may not have completed_lessons_count/total_lessons_count
		if (err && typeof err === 'object' && err.code === 'ER_BAD_FIELD_ERROR') {
			[insertResult] = await conn.query(
				`INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0)` ,
				[userId, courseId]
			);
		} else if (err && typeof err === 'object' && err.code === 'ER_DUP_ENTRY') {
			const nowExisting = await getEnrollmentRow({ userId, courseId });
			return { enrollmentId: nowExisting ? Number(nowExisting.id) : null, alreadyEnrolled: true };
		} else {
			throw err;
		}
	}

	const enrollmentId = insertResult.insertId;

	const [moduleRows] = await conn.query(
		'SELECT id FROM modules WHERE course_id = ? ORDER BY module_order ASC, id ASC LIMIT 1',
		[courseId]
	);
	const firstModuleId = Array.isArray(moduleRows) && moduleRows.length ? Number(moduleRows[0].id) : null;
	if (firstModuleId) {
		await conn.query('INSERT IGNORE INTO module_access (enrollment_id, module_id) VALUES (?, ?)', [
			enrollmentId,
			firstModuleId,
		]);
	}

	await upsertCourseProgress({
		conn,
		userId,
		courseId,
		completedLessonIds: [],
		percentCompleted: 0,
	});

	return { enrollmentId: Number(enrollmentId), alreadyEnrolled: false };
}

// Public course registration: create/find user by phone/email, record the form, and enroll user.
router.post('/:slug/register', async (req, res) => {
	const db = getPool();
	const conn = await db.getConnection();
	try {
		const { slug } = req.params;
		const body = req.body || {};
		const authMode = String(body.auth_mode || body.authMode || '').trim().toLowerCase();
		const authUserId = tryGetUserIdFromRequest(req);

		const prefix = String(body.gender || body.prefix || '').trim();
		const fullName = String(body.name || body.full_name || '').trim();
		const phoneNumber = normalizePhone(body.tel || body.phone_number || body.phone || '');
		const email = normalizeEmail(body.usermail || body.email || '');
		const grade = String(body.grade || '').trim();
		const schoolProvince = String(body.schoolprovince || body.school_province || '').trim();

		if (!phoneNumber) return res.status(400).json({ error: 'phone number is required' });
		if (!isThaiPhone10Digits(phoneNumber)) return res.status(400).json({ error: 'valid phone number is required' });

		const otpPhone = tryGetOtpPhoneFromRequest(req);
		const otpOk = Boolean(otpPhone && otpPhone === phoneNumber);

		if (!otpOk) {
			if (authMode !== 'email_phone') {
				return res.status(401).json({ error: 'otp_required' });
			}
			if (!email) return res.status(400).json({ error: 'email is required' });
			if (!isValidEmail(email)) return res.status(400).json({ error: 'valid email is required' });

			const [emailRows] = await conn.query('SELECT id, email, phone_number, role FROM users WHERE email = ? LIMIT 1', [
				email,
			]);
			const emailUser = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;
			if (emailUser) {
				const existingPhone = normalizePhone(emailUser.phone_number || '');
				if (!existingPhone) return res.status(403).json({ error: 'phone_not_set' });
				if (existingPhone !== phoneNumber) {
					const canUpdateExistingUserPhone = Boolean(authUserId && Number(emailUser.id) === Number(authUserId));
					if (!canUpdateExistingUserPhone) {
						return res.status(401).json({ error: 'invalid credentials' });
					}

					const [phoneRows] = await conn.query('SELECT id FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
					const phoneOwner = Array.isArray(phoneRows) && phoneRows.length ? phoneRows[0] : null;
					if (phoneOwner && Number(phoneOwner.id) !== Number(emailUser.id)) {
						return res.status(409).json({ error: 'phone_already_used' });
					}

					await conn.query('UPDATE users SET phone_number = ? WHERE id = ?', [phoneNumber, emailUser.id]);
				}
			} else {
				const [phoneRows] = await conn.query('SELECT id, email FROM users WHERE phone_number = ? LIMIT 1', [phoneNumber]);
				const phoneUser = Array.isArray(phoneRows) && phoneRows.length ? phoneRows[0] : null;
				if (phoneUser && normalizeEmail(phoneUser.email || '') !== email) {
					return res.status(409).json({ error: 'phone_already_used' });
				}
			}
		}

		if (!email) return res.status(400).json({ error: 'email is required' });
		if (!fullName) return res.status(400).json({ error: 'full name is required' });
		if (!grade) return res.status(400).json({ error: 'grade is required' });
		if (!schoolProvince) return res.status(400).json({ error: 'school province is required' });

		const courseRow = await getCourseRowBySlug(slug);
		if (!courseRow) return res.status(404).json({ error: 'course not found' });
		const courseId = Number(courseRow.id);

		await conn.beginTransaction();

		let userRow = null;
		if (otpOk) {
			userRow = await findUserByPhoneOrEmail(conn, { phone: phoneNumber, email });
		} else {
			const [emailRows] = await conn.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
			userRow = Array.isArray(emailRows) && emailRows.length ? emailRows[0] : null;
		}
		let userCreated = false;
		if (!userRow) {
			userRow = await createUserForCourseRegistration(conn, { phone: phoneNumber, email, fullName });
			userCreated = true;
		}
		const userId = Number(userRow.id);

		const { enrollmentId, alreadyEnrolled } = await ensureEnrollmentUnlockedFirstModule(conn, {
			userId,
			courseId,
		});

		const [insertReg] = await conn.query(
			`INSERT INTO course_registrations (
				course_id, user_id,
				prefix, full_name, phone_number, email, grade, school_province,
				faculty_medicine, faculty_dentistry, faculty_veterinarians, faculty_pharmacy, faculty_medical_technology,
				faculty_nursing, faculty_engineering, faculty_architecture, faculty_science, faculty_business_administration,
				faculty_humanities, faculty_literature, faculty_social_sciences, faculty_law, faculty_education, faculty_other_text,
				university_chula, university_thammasat, university_mahidol, university_chiangmai, university_knonkaen,
				university_songkhla, university_ubon, university_kingmongkut_north, university_sarakham, university_walailak,
				university_maejo, university_kingmongkut_ladkrabang, university_other_text,
				protocol, agent, fbp, fbc, city, postal
			) VALUES (
				?, ?,
				?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?,
				?, ?, ?, ?, ?,
				?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?,
				?, ?, ?, ?, ?,
				?, ?, ?,
				?, ?, ?, ?, ?, ?
			)` ,
			[
				courseId,
				userId,
				prefix || null,
				fullName || null,
				phoneNumber,
				email || null,
				grade || null,
				schoolProvince || null,
				truthy(body.medicine) ? 1 : 0,
				truthy(body.dentistry) ? 1 : 0,
				truthy(body.veterinarians) ? 1 : 0,
				truthy(body.pharmacy) ? 1 : 0,
				truthy(body.medical_technology) ? 1 : 0,
				truthy(body.nursing) ? 1 : 0,
				truthy(body.engineering) ? 1 : 0,
				truthy(body.architecture) ? 1 : 0,
				truthy(body.science) ? 1 : 0,
				truthy(body.business_administration) ? 1 : 0,
				truthy(body.humanities) ? 1 : 0,
				truthy(body.literature) ? 1 : 0,
				truthy(body.social_sciences) ? 1 : 0,
				truthy(body.law) ? 1 : 0,
				truthy(body.education) ? 1 : 0,
				typeof body.other_faculty === 'string' ? body.other_faculty.trim() || null : null,
				truthy(body.chula) ? 1 : 0,
				truthy(body.thammasat) ? 1 : 0,
				truthy(body.mahidol) ? 1 : 0,
				truthy(body.chiangmai) ? 1 : 0,
				truthy(body.knonkaen) ? 1 : 0,
				truthy(body.songkhla) ? 1 : 0,
				truthy(body.ubon) ? 1 : 0,
				truthy(body.kingmongkut_north) ? 1 : 0,
				truthy(body.sarakham) ? 1 : 0,
				truthy(body.walailak) ? 1 : 0,
				truthy(body.maejo) ? 1 : 0,
				truthy(body.kingmongkut_ladkrabang) ? 1 : 0,
				typeof body.other_university === 'string' ? body.other_university.trim() || null : null,
				typeof body.protocol === 'string' ? body.protocol.trim() || null : null,
				typeof body.agent === 'string' ? body.agent.trim() || null : null,
				typeof body.fbp === 'string' ? body.fbp.trim() || null : null,
				typeof body.fbc === 'string' ? body.fbc.trim() || null : null,
				typeof body.city === 'string' ? body.city.trim() || null : null,
				typeof body.postal === 'string' ? body.postal.trim() || null : null,
			]
		);

		await conn.commit();

		// Auto-login after successful registration
		try {
			const accessToken = signAccessToken(userRow);
			setAuthCookie(res, accessToken);
		} catch (tokenErr) {
			// eslint-disable-next-line no-console
			console.error('setAuthCookie failed:', tokenErr);
		}

		// One-time: clear OTP cookie
		clearOtpCookie(res);

		return res.status(201).json({
			ok: true,
			courseId: String(courseId),
			userId: String(userId),
			userCreated,
			enrolled: true,
			alreadyEnrolled,
			enrollmentId: enrollmentId ? String(enrollmentId) : null,
			registrationId: insertReg && insertReg.insertId ? String(insertReg.insertId) : null,
		});
	} catch (err) {
		await safeRollback(conn);
		// eslint-disable-next-line no-console
		console.error('course registration failed:', err);
		return res.status(500).json({ error: 'internal error' });
	} finally {
		conn.release();
	}
});

async function isEnrolled({ userId, courseId }) {
	const uId = toInt(userId);
	const cId = toInt(courseId);
	if (!uId || !cId) return false;
	const [rows] = await getPool().query(
		'SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
		[uId, cId]
	);
	return Array.isArray(rows) && rows.length > 0;
}

async function assertCourseUnlockedOrThrow({ courseRow, password, userId }) {
	if (!courseRow) {
		const err = new Error('NOT_FOUND');
		// @ts-ignore
		err.statusCode = 404;
		throw err;
	}
	const isPasswordProtected = courseRow.visibility_type === 'password';
	if (!isPasswordProtected) return;
	let ok = await verifyPassword(password || '', courseRow.password_hash);
	if (!ok && userId) {
		ok = await isEnrolled({ userId, courseId: courseRow.id });
	}
	if (ok) return;
	const err = new Error('LOCKED');
	// @ts-ignore
	err.statusCode = 403;
	throw err;
}

async function resolveLessonRow({ courseId, lessonSlug }) {
	const [rows] = await getPool().query(
		`SELECT l.id AS lesson_id
		FROM lessons l
		INNER JOIN modules m ON m.id = l.module_id
		WHERE m.course_id = ? AND l.slug = ?
		LIMIT 1`,
		[courseId, lessonSlug]
	);
	return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function getEnrollmentRow({ userId, courseId }) {
	const [rows] = await getPool().query(
		'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
		[userId, courseId]
	);
	return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function upsertCourseProgress({ conn, userId, courseId, completedLessonIds, percentCompleted }) {
	try {
		const ids = Array.isArray(completedLessonIds)
			? completedLessonIds.map((x) => Number(x)).filter((n) => Number.isFinite(n))
			: [];
		const json = JSON.stringify(ids);
		const pct = Number.isFinite(Number(percentCompleted)) ? Math.trunc(Number(percentCompleted)) : 0;
		await conn.query(
			`INSERT INTO course_progress (
				user_id, course_id, completed_lessons_json, percent_completed, last_accessed_at
			) VALUES (?, ?, ?, ?, NOW())
			ON DUPLICATE KEY UPDATE
				completed_lessons_json = VALUES(completed_lessons_json),
				percent_completed = VALUES(percent_completed),
				last_accessed_at = VALUES(last_accessed_at)`,
			[userId, courseId, json, pct]
		);
	} catch {
		// course_progress is optional / legacy; ignore if not present
	}
}

async function getCompletedLessonIdsForEnrollment(conn, enrollmentId) {
	const [rows] = await conn.query(
		'SELECT lesson_id FROM lesson_completions WHERE enrollment_id = ? ORDER BY lesson_id ASC',
		[enrollmentId]
	);
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => Number(r.lesson_id)).filter((n) => Number.isFinite(n));
}

async function getCompletedLessonsCountForEnrollmentCourse(conn, { enrollmentId, courseId }) {
	try {
		const [rows] = await conn.query(
			`SELECT COUNT(*) AS completed
			FROM lesson_completions lc
			INNER JOIN lessons l ON l.id = lc.lesson_id
			INNER JOIN modules m ON m.id = l.module_id
			WHERE lc.enrollment_id = ? AND m.course_id = ? AND l.is_active = 1`,
			[enrollmentId, courseId]
		);
		return Array.isArray(rows) && rows.length ? Number(rows[0].completed) : 0;
	} catch (err) {
		// Backward-compat: older schemas may not have lessons.is_active
		if (err && typeof err === 'object' && err.code === 'ER_BAD_FIELD_ERROR') {
			const [rows] = await conn.query(
				`SELECT COUNT(*) AS completed
				FROM lesson_completions lc
				INNER JOIN lessons l ON l.id = lc.lesson_id
				INNER JOIN modules m ON m.id = l.module_id
				WHERE lc.enrollment_id = ? AND m.course_id = ?`,
				[enrollmentId, courseId]
			);
			return Array.isArray(rows) && rows.length ? Number(rows[0].completed) : 0;
		}
		throw err;
	}
}

async function safeRollback(conn) {
	try {
		await conn.rollback();
	} catch {
		// ignore rollback errors (e.g., no active transaction)
	}
}

// Returns enrollment + cached progress for current user
router.get('/:slug/enrollment', requireAuth, async (req, res) => {
	try {
		const { slug } = req.params;
		const password = req.query.password ? String(req.query.password) : '';
		const userId = toInt(req.user?.id);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const courseRow = await getCourseRowBySlug(slug);
		await assertCourseUnlockedOrThrow({ courseRow, password, userId });

		const enrollment = await getEnrollmentRow({ userId, courseId: Number(courseRow.id) });
		if (!enrollment) {
			return res.json({ enrolled: false });
		}

		const enrollmentId = Number(enrollment.id);
		const totalLessonsCount = await getTotalLessonsForCourse(getPool(), Number(courseRow.id));
		const completedLessonsCount = await getCompletedLessonsCountForEnrollmentCourse(getPool(), {
			enrollmentId,
			courseId: Number(courseRow.id),
		});
		const progressPercent = calculatePercentCompleted(completedLessonsCount, totalLessonsCount);

		return res.json({
			enrolled: true,
			enrollment: {
				id: String(enrollment.id),
				progressPercent: Number.isFinite(Number(enrollment.progress_percent))
					? Number(enrollment.progress_percent)
					: progressPercent,
				completedLessonsCount,
				totalLessonsCount,
				enrolledAt: enrollment.enrolled_at,
			},
		});
	} catch (err) {
		const status = err && typeof err === 'object' && err.statusCode ? Number(err.statusCode) : 500;
		if (status === 404) return res.status(404).json({ error: 'not found' });
		if (status === 403) return res.status(403).json({ error: 'locked' });
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

// Enroll current user into course and unlock the first module
router.post('/:slug/enroll', requireAuth, async (req, res) => {
	const db = getPool();
	const conn = await db.getConnection();
	try {
		const { slug } = req.params;
		const password = req.query.password ? String(req.query.password) : '';
		const userId = toInt(req.user?.id);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const courseRow = await getCourseRowBySlug(slug);
		const courseId = Number(courseRow.id);

		// If already enrolled, allow without requiring password.
		const existing = await getEnrollmentRow({ userId, courseId });
		if (existing) {
			return res.json({
				enrolled: true,
				enrollment: {
					id: String(existing.id),
					progressPercent: Number(existing.progress_percent) || 0,
					completedLessonsCount: 0,
					totalLessonsCount: await getTotalLessonsForCourse(getPool(), courseId),
					enrolledAt: existing.enrolled_at,
				},
			});
		}

		await assertCourseUnlockedOrThrow({ courseRow, password, userId });

		await conn.beginTransaction();

		const totalLessonsCount = await getTotalLessonsForCourse(conn, courseId);
		let insertResult;
		try {
			[insertResult] = await conn.query(
				`INSERT INTO enrollments (
					user_id, course_id,
					progress_percent, completed_lessons_count, total_lessons_count
				) VALUES (?, ?, 0, 0, ?)` ,
				[userId, courseId, totalLessonsCount]
			);
		} catch (err) {
			// Backward-compat: older schemas may not have completed_lessons_count/total_lessons_count
			if (err && typeof err === 'object' && err.code === 'ER_BAD_FIELD_ERROR') {
				[insertResult] = await conn.query(
					`INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0)` ,
					[userId, courseId]
				);
			} else {
				throw err;
			}
		}
		const enrollmentId = insertResult.insertId;

		// Unlock the first module (lowest module_order)
		const [moduleRows] = await conn.query(
			'SELECT id FROM modules WHERE course_id = ? ORDER BY module_order ASC, id ASC LIMIT 1',
			[courseId]
		);
		const firstModuleId = Array.isArray(moduleRows) && moduleRows.length ? Number(moduleRows[0].id) : null;
		if (firstModuleId) {
			await conn.query(
				'INSERT IGNORE INTO module_access (enrollment_id, module_id) VALUES (?, ?)',
				[enrollmentId, firstModuleId]
			);
		}

		await upsertCourseProgress({
			conn,
			userId,
			courseId,
			completedLessonIds: [],
			percentCompleted: 0,
		});

		await conn.commit();

		return res.status(201).json({
			enrolled: true,
			enrollment: {
				id: String(enrollmentId),
				progressPercent: 0,
				completedLessonsCount: 0,
				totalLessonsCount,
			},
		});
	} catch (err) {
		await safeRollback(conn);
		const status = err && typeof err === 'object' && err.statusCode ? Number(err.statusCode) : 500;
		if (status === 404) return res.status(404).json({ error: 'not found' });
		if (status === 403) return res.status(403).json({ error: 'locked' });
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	} finally {
		conn.release();
	}
});

// Get completion status for a lesson (current user)
router.get('/:slug/lessons/:lessonSlug/completion', requireAuth, async (req, res) => {
	try {
		const { slug, lessonSlug } = req.params;
		const password = req.query.password ? String(req.query.password) : '';
		const userId = toInt(req.user?.id);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const courseRow = await getCourseRowBySlug(slug);
		await assertCourseUnlockedOrThrow({ courseRow, password, userId });
		const courseId = Number(courseRow.id);

		const enrollment = await getEnrollmentRow({ userId, courseId });
		if (!enrollment) return res.json({ enrolled: false, completed: false });

		const lessonRow = await resolveLessonRow({ courseId, lessonSlug: String(lessonSlug) });
		if (!lessonRow) return res.status(404).json({ error: 'not found' });
		const lessonId = Number(lessonRow.lesson_id);

		const [rows] = await getPool().query(
			'SELECT 1 FROM lesson_completions WHERE enrollment_id = ? AND lesson_id = ? LIMIT 1',
			[Number(enrollment.id), lessonId]
		);
		const completed = Array.isArray(rows) && rows.length > 0;

		return res.json({
			enrolled: true,
			completed,
			progress: {
				progressPercent: Number(enrollment.progress_percent) || 0,
				completedLessonsCount: Number(enrollment.completed_lessons_count) || 0,
				totalLessonsCount: Number(enrollment.total_lessons_count) || 0,
			},
		});
	} catch (err) {
		const status = err && typeof err === 'object' && err.statusCode ? Number(err.statusCode) : 500;
		if (status === 404) return res.status(404).json({ error: 'not found' });
		if (status === 403) return res.status(403).json({ error: 'locked' });
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

// Mark a lesson completed (idempotent) and refresh enrollment progress
router.post('/:slug/lessons/:lessonSlug/complete', requireAuth, async (req, res) => {
	const db = getPool();
	const conn = await db.getConnection();
	try {
		const { slug, lessonSlug } = req.params;
		const password = req.query.password ? String(req.query.password) : '';
		const userId = toInt(req.user?.id);
		if (!userId) return res.status(401).json({ error: 'unauthorized' });

		const courseRow = await getCourseRowBySlug(slug);
		await assertCourseUnlockedOrThrow({ courseRow, password, userId });
		const courseId = Number(courseRow.id);

		const enrollment = await getEnrollmentRow({ userId, courseId });
		if (!enrollment) return res.status(409).json({ error: 'not enrolled' });
		const enrollmentId = Number(enrollment.id);

		const lessonRow = await resolveLessonRow({ courseId, lessonSlug: String(lessonSlug) });
		if (!lessonRow) return res.status(404).json({ error: 'not found' });
		const lessonId = Number(lessonRow.lesson_id);

		await conn.beginTransaction();
		await conn.query(
			'INSERT IGNORE INTO lesson_completions (enrollment_id, lesson_id) VALUES (?, ?)',
			[enrollmentId, lessonId]
		);

		const completedLessonsCount = await getCompletedLessonsCountForEnrollmentCourse(conn, {
			enrollmentId,
			courseId,
		});
		const totalLessonsCount = await getTotalLessonsForCourse(conn, courseId);
		const progressPercent = calculatePercentCompleted(completedLessonsCount, totalLessonsCount);

		// Update enrollment cached progress (schema-dependent)
		try {
			await conn.query(
				`UPDATE enrollments
				SET completed_lessons_count = ?, total_lessons_count = ?, progress_percent = ?
				WHERE id = ?`,
				[completedLessonsCount, totalLessonsCount, progressPercent, enrollmentId]
			);
		} catch (err) {
			// Backward-compat: older schemas may not have these columns
			if (err && typeof err === 'object' && err.code === 'ER_BAD_FIELD_ERROR') {
				await conn.query('UPDATE enrollments SET progress_percent = ? WHERE id = ?', [progressPercent, enrollmentId]);
			} else {
				throw err;
			}
		}

		const completedLessonIds = await getCompletedLessonIdsForEnrollment(conn, enrollmentId);
		await upsertCourseProgress({
			conn,
			userId,
			courseId,
			completedLessonIds,
			percentCompleted: progressPercent,
		});

		await conn.commit();
		return res.json({
			ok: true,
			progress: {
				progressPercent,
				completedLessonsCount,
				totalLessonsCount,
			},
		});
	} catch (err) {
		await safeRollback(conn);
		const status = err && typeof err === 'object' && err.statusCode ? Number(err.statusCode) : 500;
		if (status === 404) return res.status(404).json({ error: 'not found' });
		if (status === 403) return res.status(403).json({ error: 'locked' });
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	} finally {
		conn.release();
	}
});

module.exports = router;
