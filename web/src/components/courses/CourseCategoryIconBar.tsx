"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CourseCategory, CourseCategoryItem } from "@/components/courses/CourseCategorySidebar";

type Props = {
	categories: CourseCategoryItem[];
	activeCategory: CourseCategory;
	onSelect: (category: CourseCategory) => void;
	counts: Record<string, number>;
};

const DEFAULT_ICON = "/shop/categories/course.svg";
const ALL_ICON = "/shop/categories/all.svg";

const COURSE_RESULTS_ANCHOR_ID = "course-results";

export default function CourseCategoryIconBar({ categories, activeCategory, onSelect, counts }: Props) {
	const INITIAL_MOBILE_COUNT = 6;
	const [isExpanded, setIsExpanded] = useState(false);
	const hasMoreOnMobile = categories.length > INITIAL_MOBILE_COUNT;

	const handleSelect = (category: CourseCategory) => {
		onSelect(category);
		requestAnimationFrame(() => {
			const target = document.getElementById(COURSE_RESULTS_ANCHOR_ID);
			target?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	const expandedLabel = useMemo(() => {
		return isExpanded ? "ย่อ" : "แสดงเพิ่มเติม";
	}, [isExpanded]);

	return (
		<section className="w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-sm md:max-w-5xl md:p-3">
			<div className="flex items-center justify-between gap-3 px-1">
				<h2 className="text-xl font-semibold text-slate-900">หมวดหมู่คอร์ส</h2>
			</div>

			<div className="mt-2 grid grid-cols-2 gap-2 md:mt-3 md:flex md:gap-3 md:overflow-x-auto md:pb-1 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
				{categories.map((category, index) => {
					const isActive = activeCategory === category.key;
					const icon = category.key === "all" ? ALL_ICON : DEFAULT_ICON;
					const hiddenOnMobile = !isExpanded && index >= INITIAL_MOBILE_COUNT;
					const displayClass = hiddenOnMobile ? "hidden md:flex" : "flex";

					return (
						<button
							key={category.key}
							type="button"
							onClick={() => handleSelect(category.key)}
							aria-pressed={isActive}
							className={`group ${displayClass} w-full h-[52px] items-center justify-start gap-2 rounded-2xl border px-2.5 py-2 text-left transition md:h-auto md:min-w-[140px] md:flex-col md:justify-center md:gap-2 md:px-3 md:py-3 md:text-center md:w-auto sm:md:min-w-[160px] ${
								isActive
									? "border-orange-200 bg-orange-50"
									: "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/40"
							}`}
						>
							<span
								className={`grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white md:h-12 md:w-12 ${
									isActive
										? "ring-2 ring-orange-200"
										: "ring-1 ring-slate-200 group-hover:ring-2 group-hover:ring-orange-100"
								}`}
							>
								<Image src={icon} alt={category.label} width={48} height={48} className="h-8 w-8 md:h-12 md:w-12" />
							</span>

							<div className="space-y-0.5">
								<p className="truncate text-xs font-semibold text-slate-900 md:whitespace-normal md:truncate-none">
									{category.label}
								</p>
								<p className="hidden text-[11px] text-slate-500 md:block">{counts[category.key] ?? 0} คอร์ส</p>
							</div>
						</button>
					);
				})}

				{hasMoreOnMobile ? (
					<button
						type="button"
						className="col-span-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50/40 md:hidden"
						aria-expanded={isExpanded}
						onClick={() => setIsExpanded((prev) => !prev)}
					>
						{expandedLabel}
					</button>
				) : null}
			</div>
		</section>
	);
}
