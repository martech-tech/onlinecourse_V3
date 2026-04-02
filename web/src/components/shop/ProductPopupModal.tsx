"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, type ShopProduct } from "@/lib/shop";
import { useCart } from "@/context/CartContext";

type Props = {
	product: ShopProduct;
	onClose: () => void;
	onAddToCart?: (quantity: number) => void;
	variant?: "full" | "readOnly";
};

export default function ProductPopupModal({ product, onClose, onAddToCart, variant = "full" }: Props) {
	const router = useRouter();
	const { addItem, items } = useCart();
	const [activeImage, setActiveImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const sliderRef = useRef<HTMLDivElement | null>(null);
	const pointerIdRef = useRef<number | null>(null);
	const dragStartXRef = useRef(0);
	const [dragOffsetPx, setDragOffsetPx] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const isReadOnly = variant === "readOnly";

	const images = useMemo(() => {
		return (product.images ?? []).filter(Boolean);
	}, [product.images]);

	const tags = useMemo(() => {
		return (product.tags ?? []).filter(Boolean);
	}, [product.tags]);

	useEffect(() => {
		setActiveImage(0);
		setQuantity(1);
		setDragOffsetPx(0);
		setIsDragging(false);
	}, [product.id]);

	useEffect(() => {
		if (activeImage >= images.length) {
			setActiveImage(0);
		}
	}, [activeImage, images.length]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
			if (event.key === "ArrowLeft") handlePrev();
			if (event.key === "ArrowRight") handleNext();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	});

	const handleIncrement = () => {
		setQuantity((prev) => Math.min(prev + 1, product.stockLeft));
	};

	const handleDecrement = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const handleAdd = () => {
		if (isReadOnly) return;
		onAddToCart?.(quantity);
	};

	const handleBuyNow = () => {
		if (isReadOnly) return;
		const exists = items.find((it) => it.product.id === product.id);
		if (!exists) addItem(product, quantity);
		router.push("/cart");
	};

	const handleTagClick = (tag: string) => {
		onClose();
		router.push(`/shop?tag=${encodeURIComponent(tag)}`);
	};

	const clampIndex = (index: number) => {
		if (images.length === 0) return 0;
		return Math.max(0, Math.min(images.length - 1, index));
	};

	const handlePrev = () => {
		setActiveImage((prev) => clampIndex(prev - 1));
	};

	const handleNext = () => {
		setActiveImage((prev) => clampIndex(prev + 1));
	};

	const handlePointerDown = (event: React.PointerEvent) => {
		if (images.length <= 1) return;
		pointerIdRef.current = event.pointerId;
		dragStartXRef.current = event.clientX;
		setIsDragging(true);
		setDragOffsetPx(0);
		sliderRef.current?.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		if (!isDragging) return;
		if (pointerIdRef.current !== event.pointerId) return;
		const deltaX = event.clientX - dragStartXRef.current;
		setDragOffsetPx(deltaX);
	};

	const finishDrag = (event: React.PointerEvent) => {
		if (!isDragging) return;
		if (pointerIdRef.current !== event.pointerId) return;
		setIsDragging(false);

		const sliderWidth = sliderRef.current?.getBoundingClientRect().width ?? 0;
		const threshold = Math.max(40, sliderWidth * 0.15);
		if (dragOffsetPx <= -threshold) {
			handleNext();
		} else if (dragOffsetPx >= threshold) {
			handlePrev();
		}

		setDragOffsetPx(0);
		try {
			sliderRef.current?.releasePointerCapture(event.pointerId);
		} catch {
			// ignore
		}
		pointerIdRef.current = null;
	};

	const handlePointerCancel = (event: React.PointerEvent) => {
		if (pointerIdRef.current === event.pointerId) {
			pointerIdRef.current = null;
		}
		setIsDragging(false);
		setDragOffsetPx(0);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto lg:overflow-hidden rounded-2xl bg-white shadow-xl">
				<button
					type="button"
					onClick={onClose}
					aria-label="ปิด"
					className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 text-sm text-slate-600 shadow lg:hidden"
				>
					ปิด
				</button>
				<div className="flex flex-col gap-6 p-6 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<div className="relative w-full overflow-hidden rounded-2xl bg-slate-100">
							<div
								ref={sliderRef}
								onPointerDown={handlePointerDown}
								onPointerMove={handlePointerMove}
								onPointerUp={finishDrag}
								onPointerCancel={handlePointerCancel}
								className="relative aspect-[4/3] w-full select-none touch-pan-y"
							>
								{images.length ? (
									<div
										className="absolute inset-0 flex"
										style={{
											transform: `translateX(calc(${-activeImage * 100}% + ${dragOffsetPx}px))`,
											transition: isDragging ? "none" : "transform 300ms ease",
										}}
									>
										{images.map((image, index) => (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												key={`${product.id}-hero-${index}`}
												src={image}
												alt={`${product.name} ${index + 1}`}
												draggable={false}
												className="h-full w-full flex-shrink-0 object-cover"
												style={{ width: "100%" }}
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
											onPointerDown={(e) => e.stopPropagation()}
											onPointerUp={(e) => e.stopPropagation()}
											onClick={handlePrev}
											aria-label="รูปก่อนหน้า"
											className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
										>
											‹
										</button>
										<button
											type="button"
											onPointerDown={(e) => e.stopPropagation()}
											onPointerUp={(e) => e.stopPropagation()}
											onClick={handleNext}
											aria-label="รูปถัดไป"
											className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
										>
											›
										</button>
									</>
								) : null}
							</div>
						</div>

						<div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							{images.map((image, index) => {
								const isActive = activeImage === index;
								return (
									<button
										key={`${product.id}-image-${index}`}
										type="button"
										onClick={() => setActiveImage(index)}
										aria-pressed={isActive}
										className={`h-14 w-24 flex-none snap-start overflow-hidden rounded-lg border bg-white transition ${
											isActive
												? "border-orange-500 ring-2 ring-orange-200"
												: "border-slate-200 hover:border-orange-300"
										}`}
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={image}
											alt={`${product.name} ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex w-full flex-col gap-4 lg:w-1/2">
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-2xl font-bold text-slate-900">{product.name}</h3>
								<p className="mt-2 text-sm text-slate-600">{product.description}</p>
								{tags.length ? (
									<div className="mt-3 flex flex-wrap gap-2">
										{tags.map((tag) => (
											<button
												key={`${product.id}-tag-${tag}`}
												type="button"
												onClick={() => handleTagClick(tag)}
												className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100"
												>
													{tag}
												</button>
											))}
										</div>
									) : null}
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="ปิด"
								className="hidden lg:inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
							>
								ปิด
							</button>
						</div>

						<div className="flex items-center gap-4 text-sm text-slate-500">
							<span className="rounded-full bg-slate-100 px-3 py-1">
								เหลือ {product.stockLeft} ชิ้น
							</span>
							<span className="rounded-full bg-slate-100 px-3 py-1">{product.soldCount}</span>
						</div>

						<div className="rounded-2xl bg-orange-50 p-4">
							<p className="text-xs text-slate-400 line-through">
								{formatPrice(product.compareAtPrice)}
							</p>
							<p className="text-3xl font-bold text-orange-600">
								{formatPrice(product.price)}
							</p>
						</div>

						{isReadOnly ? null : (
							<>
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
									ใส่ตะกร้า
								</button>
								<button
									type="button"
									onClick={handleBuyNow}
									className="flex-1 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
								>
									ซื้อเลย
								</button>
							</div>
						</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
