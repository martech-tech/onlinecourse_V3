const express = require('express');
const crypto = require('crypto');
const { getPool } = require('../db');
const { makeSlug } = require('../utils/slug');
const { hashPassword } = require('../utils/courseAuth');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

function safeDecodeSlug(value) {
	if (typeof value !== 'string') return '';
	const trimmed = value.trim();
	if (!trimmed) return '';
	try {
		// Heuristic: only attempt decode when it looks percent-encoded.
		if (/%[0-9A-Fa-f]{2}/.test(trimmed)) return decodeURIComponent(trimmed);
		return trimmed;
	} catch {
		return trimmed;
	}
}

function normalizeStringArray(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
	return String(value)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function mapCourseLevel(raw) {
	const v = String(raw || '').toLowerCase();
	if (v === 'beginner') return 'Beginner';
	if (v === 'intermediate') return 'Intermediate';
	if (v === 'advanced') return 'Advanced';
	// tutor uses all_levels
	return 'All Levels';
}

function extractVideoFromTutorMeta(videoArr) {
	const first = Array.isArray(videoArr) && videoArr.length ? videoArr[0] : null;
	if (!first || typeof first !== 'object') return null;
	const provider = first.source ? String(first.source) : 'unknown';
	const url =
		first.source_vimeo ||
		first.source_youtube ||
		first.source_external_url ||
		first.source_html5 ||
		first.source_embedded ||
		'';
	if (!url) return null;
	return { provider, url: String(url) };
}

function extractDurationSeconds(videoArr) {
	const first = Array.isArray(videoArr) && videoArr.length ? videoArr[0] : null;
	if (!first || typeof first !== 'object') return null;
	const raw = first.duration_sec;
	const n = raw != null ? Number(raw) : NaN;
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n);
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

router.post('/wordpress', requireAdmin, async (req, res) => {
	try {
		const overwrite = String(req.query.overwrite || '') === '1' || String(req.query.overwrite || '') === 'true';
		const payload = req.body;

		const courseNode =
			payload?.data?.find?.((x) => x?.content_type === 'courses')?.data?.course ||
			payload?.course ||
			null;

		if (!courseNode) {
			return res.status(400).json({ error: 'invalid wordpress export: missing course' });
		}

		const title = String(courseNode.post_title || '').trim();
		if (!title) return res.status(400).json({ error: 'course title missing' });

		const rawSlug = safeDecodeSlug(courseNode.post_name);
		let slug = rawSlug || makeSlug(title) || `course-${Date.now()}`;

		const descriptionHtml = String(courseNode.post_content || '');
		const thumbnailUrl = String(courseNode.thumbnail_url || '');

		const tax = courseNode.taxonomies || {};
		const categories = normalizeStringArray((tax.categories || []).map((c) => c?.name).filter(Boolean));
		const tagValues = tax.tags && typeof tax.tags === 'object' ? Object.values(tax.tags) : [];
		const tags = normalizeStringArray(tagValues.map((t) => t?.name).filter(Boolean));

		const meta = courseNode.meta || {};
		const priceType = Array.isArray(meta._tutor_course_price_type) ? meta._tutor_course_price_type[0] : meta._tutor_course_price_type;
		const pricingModel = String(priceType || 'free') === 'paid' ? 'paid' : 'free';
		const salePriceRaw = Array.isArray(meta.tutor_course_sale_price) ? meta.tutor_course_sale_price[0] : meta.tutor_course_sale_price;
		const pricingAmount = pricingModel === 'paid' ? Number(salePriceRaw || 0) : null;

		const levelRaw = Array.isArray(meta._tutor_course_level) ? meta._tutor_course_level[0] : meta._tutor_course_level;
		const level = mapCourseLevel(levelRaw);

		const enableQaRaw = Array.isArray(meta._tutor_enable_qa) ? meta._tutor_enable_qa[0] : meta._tutor_enable_qa;
		const enableQna = String(enableQaRaw || '').toLowerCase() === 'yes' ? 1 : 0;

		const plainPassword = String(courseNode.post_password || '').trim();
		const visibilityType = plainPassword ? 'password' : 'public';
		const passwordHash = plainPassword ? await hashPassword(plainPassword) : null;

		// Curriculum mapping
		const contents = Array.isArray(courseNode.contents) ? courseNode.contents : [];
		const modules = contents
			.filter((t) => t && typeof t === 'object')
			.map((topic) => {
				const moduleId = String(topic.ID || crypto.randomUUID());
				const moduleTitle = String(topic.post_title || '').trim() || 'Untitled Module';
				const moduleOrder = Number.isFinite(topic.menu_order) ? Number(topic.menu_order) : 0;

				const children = Array.isArray(topic.children) ? topic.children : [];
				const lessons = children
					.filter((l) => l && typeof l === 'object')
					.map((lesson) => {
						const lessonId = String(lesson.ID || crypto.randomUUID());
						const lessonTitle = String(lesson.post_title || '').trim() || 'Untitled Lesson';
						const lessonSlugRaw = safeDecodeSlug(lesson.post_name);
						const lessonSlug = lessonSlugRaw || makeSlug(lessonTitle) || `lesson-${lessonId}`;
						const lessonOrder = Number.isFinite(lesson.menu_order) ? Number(lesson.menu_order) : 0;
						const lessonMeta = lesson.meta || {};
						const video = extractVideoFromTutorMeta(lessonMeta._video);
						const durationSeconds = extractDurationSeconds(lessonMeta._video);
						return {
							id: lessonId,
							title: lessonTitle,
							slug: lessonSlug,
							order: lessonOrder,
							durationSeconds: durationSeconds ?? undefined,
							type: 'video',
							video: video || undefined,
							contentHtml: lesson.post_content ? String(lesson.post_content) : undefined,
						};
					});

				return {
					id: moduleId,
					title: moduleTitle,
					order: moduleOrder,
					lessons,
				};
			});

		const db = getPool();

		// If not overwriting, avoid colliding with an existing course slug.
		if (!overwrite) {
			slug = await ensureUniqueSlug(slug);
		}

		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();

			// Upsert behavior by slug when overwrite=true
			let courseId = null;
			if (overwrite) {
				const [existingRows] = await conn.query('SELECT id FROM courses WHERE slug = ? LIMIT 1', [slug]);
				if (existingRows && existingRows.length) courseId = existingRows[0].id;
			}

			if (courseId) {
				await conn.query(
					`UPDATE courses SET
						title = ?,
						description_html = ?,
						thumbnail_url = ?,
						level = ?,
						categories_json = ?,
						tags_json = ?,
						pricing_model = ?,
						pricing_amount = ?,
						pricing_currency = ?,
						visibility_type = ?,
						password_hash = ?,
						enable_qna = ?,
						status = ?
					WHERE id = ?`,
					[
						title,
						descriptionHtml,
						thumbnailUrl,
						level,
						JSON.stringify(categories),
						JSON.stringify(tags),
						pricingModel,
						pricingAmount,
						'THB',
						visibilityType,
						passwordHash,
						enableQna,
						String(courseNode.post_status || 'draft') === 'publish' ? 'published' : 'draft',
						courseId,
					]
				);

				await conn.query('DELETE FROM modules WHERE course_id = ?', [courseId]);
			} else {
				const [result] = await conn.query(
					`INSERT INTO courses (
						title, slug, description_html, thumbnail_url,
						level, categories_json, tags_json,
						pricing_model, pricing_amount, pricing_currency,
						visibility_type, password_hash,
						enable_qna,
						status
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
					[
						title,
						slug,
						descriptionHtml,
						thumbnailUrl,
						level,
						JSON.stringify(categories),
						JSON.stringify(tags),
						pricingModel,
						pricingAmount,
						'THB',
						visibilityType,
						passwordHash,
						enableQna,
						String(courseNode.post_status || 'draft') === 'publish' ? 'published' : 'draft',
					]
				);
				courseId = result.insertId;
			}

			const usedLessonSlugs = new Set();
			for (let mi = 0; mi < modules.length; mi += 1) {
				const m = modules[mi];
				const [moduleResult] = await conn.query(
					'INSERT INTO modules (course_id, public_id, title, module_order) VALUES (?, ?, ?, ?)',
					[courseId, String(m.id || crypto.randomUUID()), m.title, Number(m.order) || 0]
				);
				const moduleId = moduleResult.insertId;

				for (let li = 0; li < m.lessons.length; li += 1) {
					const l = m.lessons[li];
					let lessonSlug = String(l.slug || '').trim() || makeSlug(l.title) || `lesson-${li + 1}`;
					let suffix = 2;
					while (usedLessonSlugs.has(lessonSlug)) {
						lessonSlug = `${lessonSlug}-${suffix}`;
						suffix += 1;
					}
					usedLessonSlugs.add(lessonSlug);

					await conn.query(
						`INSERT INTO lessons (
							module_id, public_id, title, slug, lesson_order,
							duration_seconds, type,
							video_url, video_provider,
							content_html
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
						[
							moduleId,
							String(l.id || crypto.randomUUID()),
							l.title,
							lessonSlug,
							Number(l.order) || 0,
							Number.isFinite(l.durationSeconds) ? Number(l.durationSeconds) : null,
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

		return res.status(201).json({ course: { title, slug, locked: visibilityType === 'password' } });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return res.status(500).json({ error: 'internal error' });
	}
});

module.exports = router;
