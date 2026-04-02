"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BannerSlider from "@/components/shop/BannerSlider";
import CourseCategoryIconBar from "@/components/courses/CourseCategoryIconBar";
import CourseCategorySidebar, { type CourseCategory, type CourseCategoryItem } from "@/components/courses/CourseCategorySidebar";
import CourseCardWithProgress from "@/app/dashboard/CourseCardWithProgress";
import { getMyEnrollments, type MyEnrollmentCourse } from "@/lib/api";
import type { CourseListItem } from "@/lib/types";
import type { ShopBanner } from "@/lib/shop";
import { useAuth } from "@/lib/useAuth";

const COURSE_PLACEHOLDER = "/shop/categories/course.svg";

const STATIC_COURSE_BANNERS: ShopBanner[] = [
	{ title: "แบนเนอร์ 1", subtitle: "", image: "/course/hero-1.webp" },
	{ title: "แบนเนอร์ 2", subtitle: "", image: "/course/hero-2.webp" },
	{ title: "แบนเนอร์ 3", subtitle: "", image: "/course/hero-3.webp" },
];

const STATIC_FEATURED_PROMOS = [
	{ image: "/course/sub-hero-1.webp", href: "/courses", fallback: "/course/hero-1.webp" },
	{ image: "/course/sub-hero-2.webp", href: "/courses", fallback: "/course/hero-2.webp" },
];

function formatCategoryLabel(value: string) {
	if (!value) return "อื่นๆ";
	return value
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function buildCategoryData(courses: CourseListItem[]) {
	const categoryCounts = new Map<string, number>();
	courses.forEach((course) => {
		course.categories?.forEach((category) => {
			const key = category.trim();
			if (!key) return;
			categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
		});
	});

	const sorted = Array.from(categoryCounts.entries())
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([key]) => ({ key, label: formatCategoryLabel(key) }));

	const categories: CourseCategoryItem[] = [{ key: "all", label: "คอร์สทั้งหมด" }, ...sorted];
	const counts: Record<string, number> = { all: courses.length };
	for (const [key, value] of categoryCounts.entries()) {
		counts[key] = value;
	}

	return { categories, counts };
}

function getCourseDate(course: CourseListItem) {
	return course.updatedAt ? new Date(course.updatedAt).getTime() : 0;
}

function CourseCard({ course }: { course: CourseListItem }) {
	const imageSrc = course.thumbnailUrl || COURSE_PLACEHOLDER;
	const showLockOverlay = course.locked && !course.enrolled;
	const categories = (course.categories ?? []).map((category) => category.trim()).filter(Boolean);
	const normalizeCategory = (value: string) => value.toLowerCase().replace(/[\s\-_]/g, "");
	const mobileHiddenCategories = new Set(["tcas", "alevel"]);
	const desktopCategories = categories.slice(0, 4);
	const mobileCategories = categories
		.filter((category) => !mobileHiddenCategories.has(normalizeCategory(category)))
		.slice(0, 4);
	return (
		<Link
			href={`/courses/${course.slug}`}
			className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="relative aspect-[4/3] w-full bg-slate-100">
				<img src={imageSrc} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
				{showLockOverlay ? (
					<div className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm">
							<svg
								viewBox="0 0 24 24"
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M17 11V7a5 5 0 0 0-10 0v4" />
								<rect x="5" y="11" width="14" height="10" rx="2" />
							</svg>
						</div>
					</div>
				) : null}
			</div>
			<div className="space-y-2 p-4">
				<div>
					<div className="line-clamp-3 text-base font-semibold text-slate-900 transition group-hover:text-slate-700">
						{course.title}
					</div>
					{categories.length ? (
						<div className="mt-2">
							<div className="flex flex-wrap gap-2 sm:hidden">
								{mobileCategories.map((category) => (
									<span
										key={`${course.slug}-${category}-mobile`}
										className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
									>
										{category}
									</span>
								))}
							</div>
							<div className="hidden flex-wrap gap-2 sm:flex">
								{desktopCategories.map((category) => (
									<span
										key={`${course.slug}-${category}-desktop`}
										className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
									>
										{category}
									</span>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</Link>
	);
}

export default function CoursesClientContent({ courses }: { courses: CourseListItem[] }) {
	const [activeCategory, setActiveCategory] = useState<CourseCategory>("all");
	const [activeBanner, setActiveBanner] = useState(0);
	const { user } = useAuth();
	const [enrollments, setEnrollments] = useState<MyEnrollmentCourse[] | null>(null);
	const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

	const { categories, counts } = useMemo(() => buildCategoryData(courses), [courses]);
	const banners = useMemo(() => STATIC_COURSE_BANNERS, []);

	useEffect(() => {
		if (banners.length === 0) return;
		const timer = window.setInterval(() => {
			setActiveBanner((prev) => (prev + 1) % banners.length);
		}, 5000);

		return () => window.clearInterval(timer);
	}, [banners.length]);

	useEffect(() => {
		setActiveBanner(0);
	}, [banners.length]);

	useEffect(() => {
		if (!user) {
			setEnrollments(null);
			setEnrollmentsError(null);
			return;
		}

		let cancelled = false;
		setEnrollmentsError(null);
		getMyEnrollments()
			.then((items) => {
				if (cancelled) return;
				setEnrollments(items);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				if (err instanceof Error && err.message === "UNAUTHORIZED") {
					setEnrollments([]);
					return;
				}
				setEnrollmentsError(err instanceof Error ? err.message : "โหลดคอร์สที่ลงทะเบียนไม่สำเร็จ");
				setEnrollments([]);
			});

		return () => {
			cancelled = true;
		};
	}, [user]);

	const filteredCourses = useMemo(() => {
		const base =
			activeCategory === "all"
				? courses
				: courses.filter((course) => course.categories?.includes(activeCategory));

		const getCategoryCount = (course: CourseListItem) => (course.categories ?? []).filter(Boolean).length;

		return [...base].sort((a, b) => {
			const diff = getCategoryCount(b) - getCategoryCount(a);
			if (diff !== 0) return diff;
			const dateDiff = getCourseDate(b) - getCourseDate(a);
			if (dateDiff !== 0) return dateDiff;
			return (a.title || '').localeCompare(b.title || '');
		});
	}, [activeCategory, courses]);

	const recommendedCourses = useMemo(() => {
		const recent = [...courses].sort((a, b) => getCourseDate(b) - getCourseDate(a));
		if (!user || !enrollments || enrollments.length === 0) return recent.slice(0, 4);

		const coursesBySlug = new Map<string, CourseListItem>();
		for (const course of courses) coursesBySlug.set(course.slug, course);

		const enrolledSlugs = new Set<string>();
		for (const item of enrollments) {
			if (item?.course?.slug) enrolledSlugs.add(item.course.slug);
		}

		const weightByCategory = new Map<string, number>();
		for (const item of enrollments) {
			const slug = item?.course?.slug;
			if (!slug) continue;
			const enrolledCourse = coursesBySlug.get(slug);
			for (const category of enrolledCourse?.categories ?? []) {
				const key = category.trim();
				if (!key) continue;
				weightByCategory.set(key, (weightByCategory.get(key) ?? 0) + 1);
			}
		}

		const candidates = courses.filter((course) => !enrolledSlugs.has(course.slug));
		const scored = candidates
			.map((course) => {
				let score = 0;
				for (const category of course.categories ?? []) {
					const key = category.trim();
					if (!key) continue;
					score += weightByCategory.get(key) ?? 0;
				}
				return { course, score, date: getCourseDate(course) };
			})
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score || b.date - a.date)
			.map((item) => item.course);

		const picked = scored.slice(0, 4);
		if (picked.length >= 4) return picked;

		const seen = new Set(picked.map((course) => course.slug));
		const fillers = candidates
			.filter((course) => !seen.has(course.slug))
			.sort((a, b) => getCourseDate(b) - getCourseDate(a))
			.slice(0, 4 - picked.length);

		return [...picked, ...fillers];
	}, [courses, enrollments, user]);

	const handleCategorySelect = (category: CourseCategory) => {
		setActiveCategory(category);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto max-w-7xl px-3 py-4 lg:px-6 lg:py-10">
				{/* <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
					<Link
						className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
						href="/builder"
					>
						Create course
					</Link>
				</div> */}

				<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
					<div className="hidden lg:block">
						<CourseCategorySidebar
							categories={categories}
							activeCategory={activeCategory}
							onSelect={handleCategorySelect}
							counts={counts}
						/>
					</div>

					<main className="flex-1 space-y-4 lg:space-y-6" style={{ maxWidth: "950px" }}>
						<section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
							<div className="grid w-full grid-cols-1 gap-2 p-2 lg:aspect-[3/1] lg:grid-cols-3 lg:gap-3 lg:p-3">
								<div className="lg:col-span-2 lg:h-full">
									{banners.length ? (
										<BannerSlider
											banners={banners}
											activeIndex={activeBanner}
											onSelect={setActiveBanner}
											className="aspect-[16/9] max-h-[320px] lg:aspect-auto lg:h-full bg-sky-50"
										/>
									) : (
										<div className="flex aspect-[16/9] max-h-[320px] w-full items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-slate-600 lg:aspect-auto lg:h-full">
											ไม่มีแบนเนอร์คอร์ส
										</div>
									)}
								</div>

								<div className="hidden gap-3 lg:grid lg:h-full lg:grid-rows-2">
									{STATIC_FEATURED_PROMOS.length ? (
										STATIC_FEATURED_PROMOS.map((promo, index) => (
											<Link
												key={`static-featured-${index}`}
												href={promo.href}
												className="group relative aspect-[16/9] max-h-[160px] overflow-hidden rounded-2xl border border-slate-100 bg-white lg:aspect-auto lg:h-full"
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={promo.image}
													alt=""
													className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
													loading="lazy"
													onError={(e) => {
														if (promo.fallback && e.currentTarget.src !== promo.fallback) {
															e.currentTarget.src = promo.fallback;
														}
													}}
												/>
											</Link>
										))
									) : (
										<div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-500 lg:aspect-auto lg:h-full">
											ไม่มีคอร์สแนะนำ
										</div>
									)}
								</div>
							</div>
						</section>

						<CourseCategoryIconBar
							categories={categories}
							activeCategory={activeCategory}
							onSelect={handleCategorySelect}
							counts={counts}
						/>

						{user ? (
							<section className="space-y-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-xl font-semibold text-slate-900">คอร์สที่ลงทะเบียนแล้ว</h2>
									</div>
								</div>

								{enrollmentsError ? <p className="text-sm text-red-600">{enrollmentsError}</p> : null}
								{enrollments == null ? (
									<p className="text-sm text-slate-500">กำลังโหลด…</p>
								) : enrollments.length === 0 ? null : (
									<div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-4">
										{enrollments.map((item) => (
											<div
												key={item.enrollmentId}
												className="w-[168px] shrink-0 sm:w-[220px]"
											>
												<CourseCardWithProgress
													title={item.course.title}
													slug={item.course.slug}
													thumbnailUrl={item.course.thumbnailUrl}
													percentCompleted={item.progress?.percent ?? 0}
													continueLessonSlug={item.continueLessonSlug ?? null}
												/>
											</div>
										))}
									</div>
								)}
							</section>
						) : null}

						<section className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-slate-900">คอร์สแนะนำ</h2>
								{/* <span className="text-sm text-slate-500">{recommendedCourses.length} picks</span> */}
							</div>
							<div className="grid grid-cols-2 justify-items-center gap-3 lg:grid-cols-4 lg:gap-4">
								{recommendedCourses.map((course) => (
									<div key={`${course.slug}-recommended`} className="w-[168px] sm:w-[220px]">
										<CourseCard course={course} />
									</div>
								))}
							</div>
						</section>

						<section id="course-results" className="space-y-4 scroll-mt-24">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-slate-900">
									{activeCategory === "all" ? "คอร์สเรียนทั้งหมด" : `คอร์สหมวด ${formatCategoryLabel(activeCategory)}`}
								</h2>
								<span className="text-sm text-slate-500">{filteredCourses.length} คอร์ส</span>
							</div>
							<div className="grid grid-cols-2 justify-items-center gap-4 lg:grid-cols-4">
								{filteredCourses.map((course) => (
									<div key={course.slug} className="w-[168px] sm:w-[220px]">
										<CourseCard course={course} />
									</div>
								))}
							</div>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
}
