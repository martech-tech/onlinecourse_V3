import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCourseBySlug } from '@/lib/api';
import UnlockForm from './UnlockForm';
import CourseProgressAside from './CourseProgressAside';
import CourseDescriptionExpandable from './CourseDescriptionExpandable';

export default async function CoursePage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ password?: string }>;
}) {
	const { slug } = await params;
	const { password } = await searchParams;
	const cookieStore = await cookies();
	type CookieEntry = { name: string; value: string };
	const cookieHeader = cookieStore
		.getAll()
		.map((c: CookieEntry) => `${c.name}=${c.value}`)
		.join('; ');

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
					<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<UnlockForm course={data.course} />
					</div>
					<div className="mt-6">
						<Link className="text-sm font-medium text-slate-700 underline" href="/courses">
							กลับไปหน้าคอร์สเรียน
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const course = data.course;
	const firstLessonSlug = course.modules?.[0]?.lessons?.[0]?.slug as string | undefined;
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const firstLessonHref = firstLessonSlug
		? `/courses/${course.slug}/lessons/${firstLessonSlug}${qs}`
		: undefined;

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="mx-auto max-w-4xl px-6 pt-10 lg:pb-10">
				<header className="mb-8 w-full flex flex-col gap-4 ">
					<h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
					<div className="w-full flex justify-end items-center gap-3 text-sm text-slate-600">
						<div className="w-full flex justify-start items-left gap-3 text-sm text-slate-600">
							{course.categories?.length ? (
								<div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600">
									{course.categories.map((category) => (
										<span key={`${course.slug}-${category}`} className="rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-medium">
											{category}
										</span>
									))}
								</div>
							) : null}
						</div>
						<div className="w-full flex justify-end items-center gap-3 text-sm text-slate-600">
							<span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
								{course.visibility?.type === 'password' ? 'มีรหัสผ่าน' : 'สาธารณะ'}
							</span>
							<span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
								{course.pricing?.model === 'paid'
									? `${course.pricing.amount ?? 0} ${course.pricing.currency ?? ''}`
									: 'ฟรี'}
							</span>
						</div>
					</div>
				</header>

				{course.thumbnailUrl ? (
					<div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
						<img className="h-64 w-full object-cover sm:h-72 lg:h-80" src={course.thumbnailUrl} alt="" />
					</div>
				) : null}

				<div className="grid gap-8 lg:grid-cols-3">
					<main className="space-y-8 lg:col-span-2"  style={{paddingBottom:'150px!important'}}>
						<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<h2 className="text-lg font-semibold text-slate-900">เกี่ยวกับคอร์ส</h2>
							<div className="mt-3 text-sm text-slate-700">
								<CourseDescriptionExpandable html={course.descriptionHtml || ''} />
							</div>
						</section>

						<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-slate-900">เนื้อหาของคอร์ส</h3>
							</div>
							<div id="course-modules-accordion" className="mt-4 grid gap-3" data-accordion="open">
								{course.modules.map((m, index) => {
									const headingId = `course-module-heading-${m.id}`;
									const bodyId = `course-module-body-${m.id}`;
									const isOpen = index === 0;

									return (
										<div key={m.id} className="overflow-hidden rounded-xl border border-slate-200">
											<h2 id={headingId}>
												<button
													type="button"
													className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition"
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
													{m.lessons.map((l) => (
														<li key={l.id} className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
															<Link
																className="block font-medium text-slate-800 hover:text-slate-900"
																href={`/courses/${course.slug}/lessons/${l.slug}${password ? `?password=${encodeURIComponent(password)}` : ''}`}
															>
																{l.title}
															</Link>
														</li>
													))}
												</ul>
										</div>
									</div>
								);
							})}
						</div>
					</section>
					</main>

					<aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
						<CourseProgressAside slug={course.slug} password={password} firstLessonHref={firstLessonHref} />
						<hr className="my-4 border-slate-200" />
						<div className="text-xs uppercase tracking-wide text-slate-500">การมองเห็น</div>
						<div className="mt-1 text-sm font-medium text-slate-800">
							{course.visibility?.type === 'password' ? 'มีรหัสผ่าน' : 'สาธารณะ'}
						</div>
						<div className="mt-4 text-xs uppercase tracking-wide text-slate-500">ราคา</div>
						<div className="mt-1 text-sm font-medium text-slate-800">
							{course.pricing?.model === 'paid'
								? `${course.pricing.amount ?? 0} ${course.pricing.currency ?? ''}`
								: 'ฟรี'}
						</div>
						<div className="mt-6">
							<Link className="text-sm font-medium text-slate-700 underline" href="/courses">
								กลับไปหน้าคอร์สเรียน
							</Link>
						</div>
					</aside>
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur lg:hidden">
				<div className="mx-auto max-w-6xl">
					<CourseProgressAside slug={course.slug} password={password} firstLessonHref={firstLessonHref} />
				</div>
			</div>
		</div>
	);
}
