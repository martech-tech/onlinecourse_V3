"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCourses, getShopBanners, getShopProducts } from "@/lib/api";
import { SHOP_CATEGORIES, type Category, type ShopBanner, type ShopProduct } from "@/lib/shop";
import BannerSlider from "@/components/shop/BannerSlider";
import CategorySidebar from "@/components/shop/CategorySidebar";
import CategoryIconBar from "@/components/shop/CategoryIconBar";
import ProductCard from "@/components/shop/ProductCard";
import ProductPopupModal from "@/components/shop/ProductPopupModal";
import { useCart } from "@/context/CartContext";

type LoadState = "loading" | "ready" | "error";

export default function ShopClientContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tagParam = searchParams.get("tag");
	const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
	const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
	const [activeBanner, setActiveBanner] = useState(0);
	const [products, setProducts] = useState<ShopProduct[]>([]);
	const [banners, setBanners] = useState<ShopBanner[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("loading");
	const [reloadToken, setReloadToken] = useState(0);
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const { addItem } = useCart();

	const displayBanners = useMemo(() => {
		return banners;
	}, [banners]);

	useEffect(() => {
		let isActive = true;
		setLoadState("loading");
		Promise.all([getShopProducts(), getShopBanners(), getCourses()])
			.then(([shopProducts, shopBanners, courses]) => {
				if (!isActive) return;
				const courseProducts: ShopProduct[] = courses.map((course) => {
					const price = course.pricing?.model === "paid" ? Number(course.pricing.amount || 0) : 0;
					const compareAt = course.pricing?.compareAt != null ? Number(course.pricing.compareAt) : undefined;
					return {
						id: `course-${course.slug}`,
						name: course.title,
						category: "course",
						description: course.categories?.length
							? `หมวดหมู่: ${course.categories.join(", ")}`
							: "คอร์สออนไลน์",
						details: course.level ? `ระดับ: ${course.level}` : undefined,
						tags: course.categories?.length ? course.categories : ["คอร์ส"],
						price,
						compareAtPrice: compareAt != null ? compareAt : price,
						images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
						stockLeft: 0,
						soldCount: course.locked ? "ล็อก" : "คอร์ส",
						badge: course.locked ? "ล็อก" : undefined,
						externalUrl: `/courses/${course.slug}`,
					};
				});
				const nonCourseProducts = shopProducts.filter((product) => product.category !== "course");
				setProducts([...courseProducts, ...nonCourseProducts]);
				setBanners(shopBanners);
				setLoadState("ready");
			})
			.catch(() => {
				if (!isActive) return;
				setProducts([]);
				setBanners([]);
				setLoadState("error");
			});

		return () => {
			isActive = false;
		};
	}, [reloadToken]);

	useEffect(() => {
		const bannerCount = displayBanners.length;
		if (bannerCount === 0) return;
		const timer = window.setInterval(() => {
			setActiveBanner((prev) => (prev + 1) % bannerCount);
		}, 5000);

		return () => window.clearInterval(timer);
	}, [displayBanners.length]);

	useEffect(() => {
		setActiveBanner(0);
	}, [displayBanners.length]);

	useEffect(() => {
		if (tagParam) {
			setActiveTag(tagParam);
			setActiveCategory("book");
		} else {
			setActiveTag(null);
		}
	}, [tagParam]);

	const filteredProducts = useMemo(() => {
		const sourceProducts = products;
		const normalizedTag = activeTag?.toLowerCase();

		const categoryOrder: Record<string, number> = { book: 0, course: 1, camp: 2, other: 3 };
		const sortByCategory = (a: ShopProduct, b: ShopProduct) =>
			(categoryOrder[a.category] ?? 9) - (categoryOrder[b.category] ?? 9);

		if (normalizedTag) {
			return sourceProducts.filter(
				(product) =>
					product.category === "book" &&
					(product.tags ?? []).some((tag) => tag.toLowerCase() === normalizedTag)
			);
		}
		if (activeCategory === "all") {
			return [...sourceProducts].sort(sortByCategory);
		}
		return sourceProducts.filter((product) => product.category === activeCategory);
	}, [activeCategory, activeTag, products]);

	const categoryCounts = useMemo(() => {
		const sourceProducts = products;
		const counts: Record<Category | "all", number> = {
			all: products.length,
			course: 0,
			book: 0,
			camp: 0,
			other: 0,
		};
		counts.all = sourceProducts.length;
		for (const product of sourceProducts) {
			counts[product.category] += 1;
		}
		return counts;
	}, [products]);

	const handleProductClick = (product: ShopProduct) => {
		if (product.category === "camp") {
			window.open(product.externalUrl ?? "https://example.com", "_blank");
			return;
		}

		if (product.category === "course") {
			router.push(product.externalUrl ?? "/courses");
			return;
		}

		setSelectedProduct(product);
	};

	const handleAddToCart = (quantity: number) => {
		if (!selectedProduct) return;
		addItem(selectedProduct, quantity);
	};

	const handleRetry = () => {
		setReloadToken((prev) => prev + 1);
	};

	const handleCategorySelect = (category: Category | "all") => {
		setActiveCategory(category);
		if (tagParam) {
			router.replace("/shop");
		}
		setActiveTag(null);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:py-10">
				<div className="hidden lg:block">
					<CategorySidebar
						categories={SHOP_CATEGORIES}
						activeCategory={activeCategory}
						onSelect={handleCategorySelect}
						counts={categoryCounts}
					/>
				</div>

				<main className="flex-1 space-y-6 pb-10">
					<section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
						<div className="grid w-full grid-cols-1 gap-3 p-3 lg:aspect-[3/1] lg:grid-cols-3">
							<div className="lg:h-full lg:col-span-2">
								{loadState === "loading" ? (
									<div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-slate-100 lg:aspect-auto lg:h-full" />
								) : displayBanners.length ? (
									<BannerSlider
										banners={displayBanners.slice(0, 3)}
										activeIndex={activeBanner}
										onSelect={setActiveBanner}
										className="aspect-[16/9] lg:aspect-auto lg:h-full bg-sky-50"
									/>
								) : (
									<div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-slate-600 lg:aspect-auto lg:h-full">
										ไม่มีแบนเนอร์
									</div>
								)}
							</div>

							<div className="grid gap-3 lg:h-full lg:grid-rows-2">
								{loadState === "loading" ? (
									<>
										<div className="aspect-[16/9] animate-pulse rounded-2xl bg-slate-100 lg:aspect-auto lg:h-full" />
										<div className="aspect-[16/9] animate-pulse rounded-2xl bg-slate-100 lg:aspect-auto lg:h-full" />
									</>
								) : (
									(displayBanners.length ? displayBanners.slice(3, 5) : []).map((banner, index) => (
										<div
											key={`promo-${index}-${banner.title}`}
											className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-100 bg-white lg:aspect-auto lg:h-full"
										>
											<img
												src={banner.image}
												alt={banner.title}
												className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
												width={1600}
												height={900}
												loading="lazy"
												decoding="async"
											/>
											<div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
											<div className="absolute inset-0 flex flex-col justify-end p-4">
												<p className="text-[11px] font-semibold uppercase tracking-wide text-orange-200">
													{banner.subtitle}
												</p>
												<p className="text-sm font-semibold text-white">{banner.title}</p>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</section>

					<CategoryIconBar
						categories={SHOP_CATEGORIES}
						activeCategory={activeCategory}
						onSelect={handleCategorySelect}
						counts={categoryCounts}
					/>

					<section className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-slate-900">
								{activeTag ? activeTag : "แนะนำสำหรับคุณ"}
							</h2>
							<span className="text-sm text-slate-500">
								{loadState === "ready" ? `${filteredProducts.length} รายการ` : "กำลังโหลด..."}
							</span>
						</div>
						{loadState === "loading" ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{Array.from({ length: 6 }).map((_, index) => (
											<div
												key={`skeleton-${index}`}
												className="h-72 animate-pulse rounded-2xl bg-white shadow-sm"
											/>
										))}
							</div>
						) : loadState === "error" ? (
							<div className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
								<p>ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง</p>
								<button
									type="button"
									onClick={handleRetry}
									className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
								>
									ลองใหม่
								</button>
							</div>
						) : (
							<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
								{filteredProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										onClick={() => handleProductClick(product)}
									/>
								))}
							</div>
						)}
					</section>
				</main>
			</div>

			{selectedProduct ? (
				<ProductPopupModal
					product={selectedProduct}
					onClose={() => setSelectedProduct(null)}
					onAddToCart={handleAddToCart}
				/>
			) : null}

		</div>
	);
}
