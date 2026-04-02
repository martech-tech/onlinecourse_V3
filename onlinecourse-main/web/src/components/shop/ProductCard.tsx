"use client";

import { useRouter } from "next/navigation";
import { formatPrice, type ShopProduct } from "@/lib/shop";

type Props = {
	product: ShopProduct;
	onClick: () => void;
};

export default function ProductCard({ product, onClick }: Props) {
	const router = useRouter();
	const tags = (product.tags ?? []).filter(Boolean);

	const handleTagClick = (event: React.MouseEvent, tag: string) => {
		event.stopPropagation();
		router.push(`/shop?tag=${encodeURIComponent(tag)}`);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick();
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
		>
			<div className="relative h-44 w-full overflow-hidden">
				<img
					src={product.images[0]}
					alt={product.name}
					className="h-full w-full object-cover transition group-hover:scale-105"
				/>
				{product.badge ? (
					<span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
						{product.badge}
					</span>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-3 p-4">
				<div className="space-y-1">
					<h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
					<p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
					{tags.length ? (
						<div className="mt-2 flex flex-wrap gap-2">
							{tags.map((tag) => (
								<button
									key={`${product.id}-tag-${tag}`}
									type="button"
									onClick={(event) => handleTagClick(event, tag)}
									className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600 hover:bg-orange-100"
								>
									{tag}
								</button>
							))}
						</div>
					) : null}
				</div>
				<div className="mt-auto flex items-center justify-between">
					<div>
						{product.compareAtPrice > product.price ? (
							<p className="text-xs text-slate-400 line-through">
								{formatPrice(product.compareAtPrice)}
							</p>
						) : null}
						<p className="text-lg font-bold text-orange-600">
							{product.price === 0 ? 'ฟรี' : formatPrice(product.price)}
						</p>
					</div>
					<span className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-orange-600">
						ซื้อ
					</span>
				</div>
			</div>
		</div>
	);
}
