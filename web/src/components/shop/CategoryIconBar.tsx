import type { Category } from "@/lib/shop";
import Image from "next/image";

export type CategoryItem = { key: Category | "all"; label: string };

type Props = {
	categories: CategoryItem[];
	activeCategory: Category | "all";
	onSelect: (category: Category | "all") => void;
	counts: Record<Category | "all", number>;
};

type CategoryImageConfig = {
	src: string;
	alt: string;
};

const CATEGORY_IMAGE: Record<Category | "all", CategoryImageConfig> = {
	all: { src: "/shop/categories/all.svg", alt: "ทั้งหมด" },
	course: { src: "/shop/categories/course.svg", alt: "คอร์ส" },
	book: { src: "/shop/categories/book.svg", alt: "หนังสือ" },
	camp: { src: "/shop/categories/camp.svg", alt: "แคมป์" },
	other: { src: "/shop/categories/other.svg", alt: "อื่นๆ" },
};

export default function CategoryIconBar({ categories, activeCategory, onSelect, counts }: Props) {
	return (
		<section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
			<div className="flex items-center justify-between gap-3 px-1">
				<h2 className="text-sm font-semibold text-slate-900">หมวดหมู่</h2>
			</div>

			<div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{categories.map((category) => {
					const config = CATEGORY_IMAGE[category.key];
					const isActive = activeCategory === category.key;

					return (
						<button
							key={category.key}
							type="button"
							onClick={() => onSelect(category.key)}
							aria-pressed={isActive}
							className={`group flex min-w-[130px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition sm:min-w-[150px] ${
								isActive
									? "border-orange-200 bg-orange-50"
									: "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/40"
							}`}
						>
							<span
								className={`grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white ${
									isActive ? "ring-2 ring-orange-200" : "ring-1 ring-slate-200 group-hover:ring-2 group-hover:ring-orange-100"
								}`}
							>
								<Image src={config.src} alt={config.alt} width={48} height={48} className="h-12 w-12" />
							</span>

							<div className="space-y-0.5">
								<p className="text-xs font-semibold text-slate-900">{category.label}</p>
								<p className="text-[11px] text-slate-500">{counts[category.key]} รายการ</p>
							</div>
						</button>
					);
				})}
			</div>
		</section>
	);
}
