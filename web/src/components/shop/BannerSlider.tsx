import type { ShopBanner } from "@/lib/shop";

type Props = {
	banners: ShopBanner[];
	activeIndex: number;
	onSelect: (index: number) => void;
	className?: string;
};

export default function BannerSlider({ banners, activeIndex, onSelect, className }: Props) {
	if (banners.length === 0) return null;

	const current = banners[activeIndex] ?? banners[0];
	const goPrev = () => {
		const nextIndex = (activeIndex - 1 + banners.length) % banners.length;
		onSelect(nextIndex);
	};
	const goNext = () => {
		const nextIndex = (activeIndex + 1) % banners.length;
		onSelect(nextIndex);
	};

	return (
		<section
			className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${
				className ?? ""
			}`}
		>
			<div className="relative h-full w-full">
				{banners.map((banner, index) => (
					<img
						key={`${banner.title}-${index}`}
						src={banner.image}
						alt={banner.title}
						className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
							index === activeIndex ? "opacity-100" : "opacity-0"
						}`}
						loading={index === activeIndex ? "eager" : "lazy"}
					/>
				))}
				<div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

				<div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
					{/* <div className="max-w-[420px]">
						<p className="text-[11px] font-semibold uppercase tracking-wide text-orange-200">
							{current.subtitle}
						</p>
						<h1 className="mt-1 text-lg font-bold text-white sm:text-2xl lg:text-3xl">
							{current.title}
						</h1>
					</div> */}

					<div className="flex items-center justify-between gap-3">
						{/* <p className="text-xs text-white/80">Tie-in deals</p> */}
						<div className="flex gap-2">
							{banners.map((_, index) => (
								<button
									key={`banner-${index}`}
									type="button"
									onClick={() => onSelect(index)}
									className={`h-2 w-6 rounded-full transition ${
										activeIndex === index ? "bg-orange-400" : "bg-white/40 hover:bg-white/60"
									}`}
									aria-label={`Switch to banner ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>

				<button
					type="button"
					onClick={goPrev}
					aria-label="Previous banner"
					className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 h-10 w-8 flex items-center justify-center text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:pointer-events-none sm:group-hover:pointer-events-auto"
				>
					‹
				</button>
				<button
					type="button"
					onClick={goNext}
					aria-label="Next banner"
					className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 h-10 w-8 flex items-center justify-center text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:pointer-events-none sm:group-hover:pointer-events-auto"
				>
					›
				</button>
			</div>
		</section>
	);
}
