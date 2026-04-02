export type CourseCategory = string | "all";

export type CourseCategoryItem = {
	key: CourseCategory;
	label: string;
};

type Props = {
	categories: CourseCategoryItem[];
	activeCategory: CourseCategory;
	onSelect: (category: CourseCategory) => void;
	counts: Record<string, number>;
};

export default function CourseCategorySidebar({ categories, activeCategory, onSelect, counts }: Props) {
	return (
		<aside className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:w-64">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-800">หมวดหมู่คอร์ส</h2>
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
						<span className="text-xs opacity-80">{counts[category.key] ?? 0}</span>
					</button>
				))}
			</nav>
		</aside>
	);
}
