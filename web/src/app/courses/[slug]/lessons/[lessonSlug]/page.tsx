import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCourseBySlug, getEnrollmentStatusServer } from '@/lib/api';
import UnlockForm from '../../UnlockForm';
import LessonCompletionButton from './LessonCompletionButton';
import LessonVideoFrame from './LessonVideoFrame';

type Lesson = {
	id: string | number;
	slug: string;
	title: string;
	video?: { url?: string } | null;
	contentHtml?: string | null;
};

type Module = {
	id: string | number;
	title: string;
	lessons: Lesson[];
};

type Course = {
	slug: string;
	title: string;
	modules: Module[];
};

const BUNNY_AND_VIMEO_SLUGS = new Set(['local', 'korpor-book']);
const BUNNY_LIBRARY_ID_BY_SLUG: Record<string, string> = {
	'local': '618924',
	'korpor-book': '618924',
};
const BUNNY_VIDEO_ID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function canUseBunnyAndVimeo(slug: string) {
	return BUNNY_AND_VIMEO_SLUGS.has(String(slug || '').trim().toLowerCase());
}

function bunnyLibraryIdForCourse(slug: string) {
	const key = String(slug || '').trim().toLowerCase();
	return BUNNY_LIBRARY_ID_BY_SLUG[key] || '';
}

function toBunnyEmbedUrl(libraryId: string, videoId: string, search?: URLSearchParams) {
	const embed = new URL(`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`);
	if (search) {
		search.forEach((value, key) => embed.searchParams.set(key, value));
	}
	// Keep iOS Safari behavior stable regardless of incoming URL params.
	embed.searchParams.set('autoplay', 'false');
	embed.searchParams.set('preload', 'true');
	embed.searchParams.set('responsive', 'true');
	embed.searchParams.set('playsinline', 'true');
	// embed.searchParams.set('disableIosPlayer', 'true');
	return embed.toString();
}

function normalizeRouteSlug(input: string) {
	const raw = String(input || '');
	const trimmed = raw.trim();
	if (!trimmed) return { raw: '', decoded: '', encoded: '' };
	let decoded = trimmed;
	try {
		decoded = decodeURIComponent(trimmed);
	} catch {
		// ignore
	}
	let encoded = trimmed;
	try {
		encoded = encodeURIComponent(decoded);
	} catch {
		// ignore
	}
	return { raw: trimmed, decoded, encoded };
}

function findLesson(course: Course, lessonSlug: string) {
	const target = normalizeRouteSlug(lessonSlug);
	for (const m of course.modules || []) {
		for (const l of m.lessons || []) {
			const lesson = normalizeRouteSlug(String(l.slug || ''));
			if (
				lesson.raw === target.raw ||
				lesson.raw === target.decoded ||
				lesson.decoded === target.raw ||
				lesson.decoded === target.decoded ||
				lesson.encoded === target.raw
			) {
				return { module: m, lesson: l };
			}
		}
	}
	return null;
}

function toEmbeddableVideoUrl(input: string, options?: { allowBunny?: boolean; bunnyLibraryId?: string }) {
	const raw = String(input || '').trim();
	if (!raw) return '';

	if (options?.allowBunny) {
		const pathLike = raw.match(/^(?:embed|play)\/([^/?#]+)\/([^/?#]+)(?:\?(.+))?$/i);
		if (pathLike) {
			const [, libraryId, videoId, rawQuery] = pathLike;
			const search = rawQuery ? new URLSearchParams(rawQuery) : undefined;
			return toBunnyEmbedUrl(libraryId, videoId, search);
		}

		if (BUNNY_VIDEO_ID_RE.test(raw) && options.bunnyLibraryId) {
			return toBunnyEmbedUrl(options.bunnyLibraryId, raw);
		}
	}

	const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw);
	const normalized = hasScheme ? raw : `https://${raw.replace(/^\/\//, '')}`;

	let u: URL;
	try {
		u = new URL(normalized);
	} catch {
		return raw;
	}

	const host = u.hostname.toLowerCase();
	if (options?.allowBunny && (host === 'player.mediadelivery.net' || host === 'iframe.mediadelivery.net' || host === 'video.bunnycdn.com')) {
		const pathname = u.pathname || '';
		const embedMatch = pathname.match(/^\/embed\/([^/]+)\/([^/]+)(?:\/|$)/);
		if (embedMatch) {
			const [, libraryId, videoId] = embedMatch;
			return toBunnyEmbedUrl(libraryId, videoId, u.searchParams);
		}

		const playMatch = pathname.match(/^\/play\/([^/]+)\/([^/]+)(?:\/|$)/);
		if (playMatch) {
			const [, libraryId, videoId] = playMatch;
			return toBunnyEmbedUrl(libraryId, videoId, u.searchParams);
		}

		const shortMatch = pathname.match(/^\/([^/]+)\/([^/]+)(?:\/|$)/);
		if (shortMatch && /^\d+$/.test(shortMatch[1])) {
			const [, libraryId, videoId] = shortMatch;
			return toBunnyEmbedUrl(libraryId, videoId, u.searchParams);
		}

		const onlyVideoIdMatch = pathname.match(/^\/([^/?#]+)(?:\/|$)/);
		if (onlyVideoIdMatch && BUNNY_VIDEO_ID_RE.test(onlyVideoIdMatch[1]) && options.bunnyLibraryId) {
			return toBunnyEmbedUrl(options.bunnyLibraryId, onlyVideoIdMatch[1], u.searchParams);
		}
	}

	if (host === 'player.vimeo.com') return u.toString();
	if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
		const pathname = u.pathname || '';
		const m =
			pathname.match(/\/video\/(\d+)(?:$|\/?)/) ||
			pathname.match(/\/videos\/(\d+)(?:$|\/?)/) ||
			pathname.match(/\/(\d+)(?:$|\/?)/);
		const id = m?.[1];
		if (!id) return raw;

		const embed = new URL(`https://player.vimeo.com/video/${id}`);
		u.searchParams.forEach((value, key) => embed.searchParams.append(key, value));
		return embed.toString();
	}

	return u.toString();
}

export default async function LessonPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string; lessonSlug: string }>;
	searchParams: Promise<{ password?: string }>;
}) {
	const { slug, lessonSlug } = await params;
	const { password } = await searchParams;
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const courseHref = `/courses/${encodeURIComponent(slug)}${qs}`;
	const cookieStore = await cookies();
	type CookieEntry = { name: string; value: string };
	const cookieHeader = cookieStore
		.getAll()
		.map((c: CookieEntry) => `${c.name}=${c.value}`)
		.join('; ');

	// Guard: user must be logged in AND enrolled to view lesson content.
	// If not, redirect back to the course page (which contains login/enroll flows).
	try {
		const enrollment = await getEnrollmentStatusServer(slug, password, cookieHeader);
		if (!enrollment.enrolled) {
			redirect(courseHref);
		}
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String((e as { message?: unknown } | null)?.message ?? e);
		if (message === 'NOT_FOUND') return notFound();
		// UNAUTHORIZED (not logged in) or LOCKED (needs password) or other failures
		redirect(courseHref);
	}

	let data;
	try {
		data = await getCourseBySlug(slug, password, cookieHeader);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String((e as { message?: unknown } | null)?.message ?? e);
		if (message === 'NOT_FOUND') return notFound();
		throw e;
	}

	if (data.locked) {
		return (
			<div className="min-h-screen bg-slate-50">
				<div className="mx-auto max-w-3xl px-6 py-10">
					<h1 className="text-2xl font-semibold text-slate-900">{data.course.title}</h1>
					<p className="mt-2 text-sm text-slate-600">คอร์สนี้มีรหัสผ่าน</p>
					<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<UnlockForm />
					</div>
				</div>
			</div>
		);
	}

	const course = data.course as Course;
	const found = findLesson(course, lessonSlug);
	if (!found) return notFound();

	const { module: activeModule, lesson } = found;
	const allowBunny = canUseBunnyAndVimeo(course.slug);
	const bunnyLibraryId = bunnyLibraryIdForCourse(course.slug);
	const videoSrc = lesson.video?.url
		? toEmbeddableVideoUrl(lesson.video.url, { allowBunny, bunnyLibraryId })
		: '';


	return (
		<div className="min-h-screen bg-slate-50">
			<div className="mx-auto max-w-6xl px-6 py-10">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<Link className="text-sm font-medium text-slate-700 underline" href={`/courses/${course.slug}${qs}`}>
						← กลับไปหน้าคอร์ส
					</Link>
					<div className="text-sm text-slate-600">{course.title}</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-4">
					<main className="order-1 lg:order-2 lg:col-span-3">
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="text-lg font-semibold text-slate-900">{lesson.title}</div>
								<LessonCompletionButton courseSlug={course.slug} lessonSlug={lesson.slug} password={password} />
							</div>
							{videoSrc ? (
								<LessonVideoFrame src={videoSrc} title={lesson.title} />
							) : (
								<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
									ยังไม่ได้เลือกวิดีโอ
								</div>
							)}

							{lesson.contentHtml ? (
								<div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: lesson.contentHtml }} />
							) : null}
						</div>
					</main>

					<aside className="order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:order-1 lg:col-span-1">
						<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">เนื้อหาของคอร์ส</div>
						<div id="lesson-modules-accordion" className="grid gap-3" data-accordion="open">
							{course.modules.map((m, index) => {
								const headingId = `lesson-module-heading-${m.id}`;
								const bodyId = `lesson-module-body-${m.id}`;
								const isOpen = String(m.id) === String(activeModule.id);

								return (
									<div key={m.id} className="overflow-hidden rounded-xl border border-slate-200">
										<h2 id={headingId}>
											<button
												type="button"
												className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold transition ${
													isOpen
														? 'bg-slate-900 text-white'
														: 'bg-slate-50 text-slate-800 hover:bg-slate-100'
													}`}
												data-accordion-target={`#${bodyId}`}
												aria-expanded={isOpen}
												aria-controls={bodyId}
											>
												<span className="flex-1">{m.title}</span>
												<svg
													data-accordion-icon
													className="ml-2 h-3.5 w-3.5 shrink-0"
													aria-hidden="true"
													fill="none"
													viewBox="0 0 10 6"
												>
													<path
														d="M9 5 5 1 1 5"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
													/>
												</svg>
											</button>
										</h2>

									<div
											id={bodyId}
											className={isOpen ? 'border-t border-slate-200' : 'hidden border-t border-slate-200'}
											aria-labelledby={headingId}
										>
											<ul className="divide-y divide-slate-100">
												{m.lessons.map((l) => {
													const active = l.slug === lessonSlug;

													return (
														<li
															key={l.id}
															className={`px-3 py-2 text-sm transition ${
															active
																? 'bg-slate-900/10 font-semibold text-slate-900'
																: 'text-slate-700 hover:bg-slate-50'
														}`}
													>
														<Link href={`/courses/${course.slug}/lessons/${l.slug}${qs}`} className="block">
															{l.title}
														</Link>
													</li>
												);
											})}
										</ul>
									</div>
								</div>
							);
						})}
					</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
