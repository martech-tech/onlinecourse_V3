'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatPrice, type ShopProduct } from '@/lib/shop';
import { useCart } from '@/context/CartContext';

type LinkedBook = {
	id: string;
	name: string;
	description: string;
	details?: string;
	tags: string[];
	price: number;
	compareAtPrice: number;
	images: string[];
	stockLeft: number;
	soldCount: string;
	externalUrl?: string;
	badge?: string;
};

type CourseSummary = {
	title: string;
	thumbnailUrl?: string;
	categories?: string[];
	level?: string;
	pricing?: { model: 'free' | 'paid'; amount?: number; compareAt?: number; currency?: string };
	linkedBook?: LinkedBook;
};

export default function UnlockForm({ incorrect, course }: { incorrect?: boolean; course?: CourseSummary }) {
	const router = useRouter();
	const { addItem, items } = useCart();
	const searchParams = useSearchParams();
	const existing = useMemo(() => searchParams.get('password') || '', [searchParams]);
	const [password, setPassword] = useState(existing);
	const [activeImage, setActiveImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const showIncorrect = (incorrect ?? false) || existing.length > 0;
	const linkedBook = course?.linkedBook;
	const bookProduct = useMemo<ShopProduct | null>(() => {
		if (!linkedBook) return null;
		return {
			id: linkedBook.id,
			name: linkedBook.name,
			category: 'book',
			description: linkedBook.description,
			details: linkedBook.details,
			tags: linkedBook.tags,
			price: linkedBook.price,
			compareAtPrice: linkedBook.compareAtPrice,
			images: linkedBook.images,
			stockLeft: linkedBook.stockLeft,
			soldCount: linkedBook.soldCount,
			externalUrl: linkedBook.externalUrl,
			badge: linkedBook.badge,
		};
	}, [linkedBook]);
	const images = useMemo(() => {
		if (linkedBook?.images?.length) return linkedBook.images;
		return course?.thumbnailUrl ? [course.thumbnailUrl] : [];
	}, [linkedBook?.images, course?.thumbnailUrl]);
	const tags = useMemo(() => {
		if (linkedBook?.tags?.length) return linkedBook.tags;
		return (course?.categories ?? []).filter(Boolean);
	}, [linkedBook?.tags, course?.categories]);
	const price = bookProduct ? Number(bookProduct.price || 0) : course?.pricing?.model === 'paid' ? Number(course.pricing.amount || 0) : 0;
	const compareAt = bookProduct
		? Number(bookProduct.compareAtPrice || 0)
		: course?.pricing?.compareAt != null
			? Number(course.pricing.compareAt)
			: undefined;
	const showCompare = compareAt != null && compareAt > price;
	const maxQty = bookProduct?.stockLeft && bookProduct.stockLeft > 0 ? bookProduct.stockLeft : 99;

	const handlePrev = () => {
		setActiveImage((prev) => Math.max(0, prev - 1));
	};

	const handleNext = () => {
		setActiveImage((prev) => Math.min(images.length - 1, prev + 1));
	};

	const handleIncrement = () => {
		setQuantity((prev) => Math.min(prev + 1, maxQty));
	};

	const handleDecrement = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const handleAdd = () => {
		if (!bookProduct) return;
		addItem(bookProduct, quantity);
	};

	const handleBuyNow = () => {
		if (!bookProduct) return;
		const exists = items.find((it) => it.product.id === bookProduct.id);
		if (!exists) addItem(bookProduct, quantity);
		router.push('/cart');
	};

	return (
		<form
			className="flex flex-col gap-3 mx-auto items-center"
			onSubmit={(e) => {
				e.preventDefault();
				const qs = new URLSearchParams(searchParams.toString());
				qs.set('password', password);
				router.replace(`?${qs.toString()}`);
			}}
		>

			<div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
				<div className="grid gap-6 p-4 sm:grid-cols-2">
					<div className="w-full">
							<h3 className="mt-1 text-lg font-bold text-slate-900">ต้องใช้รหัสผ่าน</h3>
							<label className="text-sm font-medium text-center w-full">
								ซื้อหนังสือเพื่อรับรหัสผ่านคอร์ส หากคุณมีรหัสผ่านแล้ว ให้กรอกด้านล่าง
							</label>
					</div>
					<div className="flex w-full flex-col gap-4">
                      <input
							className="rounded-xl border px-3 py-2 w-full text-center"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="กรอกรหัสผ่านคอร์ส"
							autoComplete="off"
						/>
						{showIncorrect ? <div className="text-sm text-red-600 text-center w-full">รหัสผ่านไม่ถูกต้อง</div> : null}
						<button className="w-full rounded-xl bg-black px-4 py-2 text-white" type="submit">
							ปลดล็อก
						</button>
					</div>
				</div>
			</div>

			{bookProduct ? (
			<div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
				<div className="grid gap-6 p-4 sm:grid-cols-2">
					<div className="w-full">
						<div className="relative w-full overflow-hidden rounded-2xl bg-slate-100">
							<div className="relative aspect-[4/3] w-full">
								{images.length ? (
									<div
										className="absolute inset-0 flex"
										style={{
											transform: `translateX(${-activeImage * 100}%)`,
											transition: 'transform 300ms ease',
										}}
									>
										{images.map((image, index) => (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												key={`course-image-${index}`}
												src={image}
												alt={course?.title || 'คอร์ส'}
												className="h-full w-full flex-shrink-0 object-cover"
											/>
										))}
									</div>
								) : (
									<div className="absolute inset-0 grid place-items-center text-sm font-semibold text-slate-500">
										ไม่มีรูปภาพ
									</div>
								)}

								{images.length > 1 ? (
									<>
										<button
											type="button"
											onClick={handlePrev}
											aria-label="รูปก่อนหน้า"
											className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
										>
											‹
										</button>
										<button
											type="button"
											onClick={handleNext}
											aria-label="รูปถัดไป"
											className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
										>
											›
										</button>
									</>
								) : null}
							</div>

							{images.length > 1 ? (
								<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
									{images.map((image, index) => {
										const isActive = activeImage === index;
										return (
											<button
												key={`course-thumb-${index}`}
												type="button"
												onClick={() => setActiveImage(index)}
												aria-pressed={isActive}
												className={`h-14 w-24 flex-none overflow-hidden rounded-lg border bg-white transition ${
													isActive
														? 'border-orange-500 ring-2 ring-orange-200'
														: 'border-slate-200 hover:border-orange-300'
												}`}
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img src={image} alt={course?.title || 'คอร์ส'} className="h-full w-full object-cover" />
											</button>
										);
									})}
								</div>
							) : null}
						</div>
					</div>

					<div className="flex w-full flex-col gap-4">
						<div>
							<p className="text-sm font-semibold text-orange-500">ต้องมีหนังสือ</p>
							<h3 className="mt-1 text-lg font-bold text-slate-900">
								{bookProduct.name}
							</h3>
							<p className="mt-2 text-sm text-slate-600">
								{bookProduct.description ||
									'ซื้อหนังสือเพื่อรับรหัสผ่านคอร์ส หากคุณมีรหัสผ่านแล้ว ให้กรอกด้านล่าง'}
							</p>
							{bookProduct.details ? (
								<p className="mt-2 text-sm text-slate-500">{bookProduct.details}</p>
							) : null}
							{tags.length ? (
								<div className="mt-3 flex flex-wrap gap-2">
									{tags.map((tag) => (
										<span
											key={`course-tag-${tag}`}
											className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600"
										>
											{tag}
										</span>
									))}
								</div>
							) : null}
						</div>

						<div className="flex items-center gap-4 text-sm text-slate-500">
							<span className="rounded-full bg-slate-100 px-3 py-1">
								{`เหลือ ${bookProduct.stockLeft} ชิ้น`}
							</span>
							<span className="rounded-full bg-slate-100 px-3 py-1">
								{bookProduct.soldCount}
							</span>
						</div>

						<div className="rounded-2xl bg-orange-50 p-4">
							{showCompare ? (
								<p className="text-xs text-slate-400 line-through">{formatPrice(compareAt ?? price)}</p>
							) : null}
							<p className="text-2xl font-bold text-orange-600">
								{price === 0 ? 'ฟรี' : formatPrice(price)}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-sm font-semibold text-slate-700">จำนวน</span>
							<div className="flex items-center rounded-xl border border-slate-200">
								<button
									type="button"
									onClick={handleDecrement}
									className="px-3 py-2 text-lg text-slate-500"
									aria-label="ลดจำนวน"
								>
									-
								</button>
								<span className="min-w-8 px-3 text-center text-sm font-semibold text-slate-700">
									{quantity}
								</span>
								<button
									type="button"
									onClick={handleIncrement}
									className="px-3 py-2 text-lg text-slate-500"
									aria-label="เพิ่มจำนวน"
								>
									+
								</button>
							</div>
						</div>

						<div className="mt-auto flex flex-wrap gap-3">
							<button
								type="button"
								onClick={handleAdd}
								className="flex-1 rounded-xl border border-orange-200 bg-orange-100 px-6 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-200"
							>
								เพิ่มหนังสือลงตะกร้า
							</button>
							<button
								type="button"
								onClick={handleBuyNow}
								className="flex-1 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
							>
								ซื้อหนังสือเลย
							</button>
						</div>
					</div>
				</div>
			</div>
			) : (
				<div className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
					<p className="text-sm font-semibold text-orange-500">ต้องมีหนังสือ</p>
					<h3 className="mt-1 text-lg font-bold text-slate-900">ซื้อหนังสือเพื่อปลดล็อกคอร์สนี้</h3>
					<p className="mt-2 text-sm text-slate-600">
						ซื้อหนังสือที่เชื่อมกับคอร์สเพื่อรับรหัสผ่าน หากคุณมีรหัสผ่านแล้ว ให้กรอกด้านล่าง
					</p>
				</div>
			)}
			
		</form>
	);
}
