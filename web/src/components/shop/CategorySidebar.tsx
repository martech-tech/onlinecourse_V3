import type { Category } from "@/lib/shop";

export type CategoryItem = { key: Category | "all"; label: string };

type Props = {
	categories: CategoryItem[];
	activeCategory: Category | "all";
	onSelect: (category: Category | "all") => void;
	counts: Record<Category | "all", number>;
};

export default function CategorySidebar({
	categories,
	activeCategory,
	onSelect,
	counts,
}: Props) {
	return (
		<aside className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:w-64">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-800">หมวดหมู่</h2>
			</div>
			<nav className="space-y-2">
				{categories.map((category) => (
					<button
						key={category.key}
						type="button"
						onClick={() => onSelect(category.key)}
						className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
							activeCategory === category.key
								? "bg-orange-500 text-white shadow"
								: "bg-slate-100 text-slate-700 hover:bg-orange-50"
						}`}
					>
						<span>{category.label}</span>
						<span className="text-xs opacity-80">{counts[category.key]}</span>
					</button>
				))}
			</nav>
		</aside>
	);
}
