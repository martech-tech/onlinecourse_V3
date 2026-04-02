"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice, type ShopProduct } from "@/lib/shop";
import { validateShopCoupon } from "@/lib/api";
import ProductPopupModal from "@/components/shop/ProductPopupModal";

const COUPON_STORAGE_KEY = "jk-cart-coupon";

type AppliedCoupon = {
	code: string;
	discount: number;
	total: number;
	subtotal: number;
	description: string | null;
	appliedAt: string;
};

function readCouponFromSession(): AppliedCoupon | null {
	if (typeof window === "undefined") return null;
	const raw = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as AppliedCoupon;
		if (!parsed || typeof parsed !== "object") return null;
		if (!parsed.code) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeCouponToSession(value: AppliedCoupon | null) {
	if (typeof window === "undefined") return;
	if (!value) {
		window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
		return;
	}
	window.sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(value));
}

export default function CartPage() {
	const router = useRouter();
	const { items, updateQuantity, removeItem, subtotal, totalItems, clearCart } = useCart();
	const [coupon, setCoupon] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
	const [couponError, setCouponError] = useState<string | null>(null);
	const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

	const estimatedTotal = useMemo(
		() => (appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon.total : subtotal),
		[appliedCoupon, subtotal]
	);
	const originalTotal = useMemo(
		() =>
			items.reduce(
				(total, item) => total + item.product.compareAtPrice * item.quantity,
				0
			),
		[items]
	);

	useEffect(() => {
		const stored = readCouponFromSession();
		if (!stored) return;
		setCoupon(stored.code);
		if (stored.subtotal === subtotal) setAppliedCoupon(stored);
	}, [subtotal]);

	useEffect(() => {
		if (!appliedCoupon) return;
		if (appliedCoupon.subtotal !== subtotal) {
			setAppliedCoupon(null);
			writeCouponToSession(null);
			setCouponError("ระบบเอาคูปองออกแล้ว เนื่องจากตะกร้ามีการเปลี่ยนแปลง");
		}
	}, [appliedCoupon, subtotal]);

	async function handleApplyCoupon() {
		setCouponError(null);
		const code = coupon.trim();
		if (!code) {
			setAppliedCoupon(null);
			writeCouponToSession(null);
			return;
		}
		setIsApplyingCoupon(true);
		try {
			const res = await validateShopCoupon(code, subtotal);
			const next: AppliedCoupon = {
				code: res.code,
				discount: res.discount,
				total: res.total,
				subtotal,
				description: res.description,
				appliedAt: new Date().toISOString(),
			};
			setAppliedCoupon(next);
			writeCouponToSession(next);
		} catch (e) {
			setAppliedCoupon(null);
			writeCouponToSession(null);
			setCouponError(e instanceof Error ? e.message : "ใช้คูปองไม่สำเร็จ");
		} finally {
			setIsApplyingCoupon(false);
		}
	}

	function handleClearAll() {
		clearCart();
		setAppliedCoupon(null);
		writeCouponToSession(null);
		setCoupon("");
		setCouponError(null);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-10">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">ตะกร้าสินค้า</h1>
						<p className="text-sm text-slate-500">
							{totalItems} รายการในคำสั่งซื้อ
						</p>
					</div>
					{items.length ? (
						<button
							type="button"
							onClick={handleClearAll}
							className="text-xs font-semibold text-orange-600 hover:text-orange-700"
						>
							ล้างตะกร้า
						</button>
					) : null}
				</div>

				{items.length === 0 ? (
					<div className="mt-10 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
						<p className="text-sm text-slate-600">ตะกร้าของคุณว่างอยู่</p>
						<Link
							href="/shop"
							className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
						>
							เลือกซื้อสินค้าต่อ
						</Link>
					</div>
				) : (
					<div className="mt-6 space-y-4">
						{items.map((item) => (
							<div
								key={item.product.id}
								onClick={() => setSelectedProduct(item.product)}
								className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
							>
								<div className="flex items-center gap-4">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										alt={item.product.name}
										src={item.product.images?.[0] ?? "/shop/products/prod-1a.svg"}
										className="h-20 w-20 rounded-2xl border border-slate-100 object-cover"
									/>
									<div>
										<h3 className="text-sm font-semibold text-slate-900">{item.product.name}</h3>
										<p className="mt-1 text-xs text-slate-500">
											{item.product.description}
										</p>
									</div>
								</div>
								<div
									className="flex flex-1 items-center justify-between gap-4 sm:justify-end"
									onClick={(event) => event.stopPropagation()}
								>
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
											className="h-8 w-8 rounded-full border border-slate-200 text-sm font-semibold text-slate-600"
										>
											-
										</button>
										<span className="min-w-6 text-center text-sm font-semibold text-slate-700">
											{item.quantity}
										</span>
										<button
											type="button"
											onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
											className="h-8 w-8 rounded-full border border-slate-200 text-sm font-semibold text-slate-600"
										>
											+
										</button>
									</div>
									<div className="text-right">
										<p className="text-xs text-slate-400 line-through">
											{formatPrice(item.product.compareAtPrice * item.quantity)}
										</p>
										<p className="text-sm font-semibold text-slate-900">
											{formatPrice(item.product.price * item.quantity)}
										</p>
										<p className="text-xs text-slate-500">
											{formatPrice(item.product.compareAtPrice)} → {formatPrice(item.product.price)}
										</p>
									</div>
									<button
										type="button"
										onClick={() => removeItem(item.product.id)}
										className="text-xs font-semibold text-red-500 hover:text-red-600"
									>
										ลบ
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-4">
						<div>
							<p className="text-xs uppercase tracking-wide text-slate-400">สรุป</p>
							<p className="text-xs text-slate-400 line-through">
								ราคาเดิม: {formatPrice(originalTotal)}
							</p>
							<p className="text-sm font-semibold text-slate-800">ยอดรวม: {formatPrice(subtotal)}</p>
						</div>
						<div>
							<label className="text-xs uppercase tracking-wide text-slate-400">คูปอง</label>
							<div className="mt-1 flex items-center gap-2">
								<input
									type="text"
									value={coupon}
									onChange={(event) => setCoupon(event.target.value)}
									placeholder="SAVE10"
									className="h-9 w-36 rounded-lg border border-slate-200 px-3 text-xs"
								/>
								<button
									type="button"
									onClick={handleApplyCoupon}
									disabled={isApplyingCoupon || subtotal <= 0}
									className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"
								>
									{isApplyingCoupon ? "กำลังใช้…" : "ใช้"}
								</button>
							</div>
							{couponError ? <p className="mt-1 text-xs text-red-600">{couponError}</p> : null}
							{appliedCoupon && appliedCoupon.subtotal === subtotal ? (
								<p className="mt-1 text-xs text-slate-500">
									ใช้แล้ว: {appliedCoupon.code} (-{formatPrice(appliedCoupon.discount)})
								</p>
							) : null}
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
						<div className="text-right">
							<p className="text-xs text-slate-400">ยอดชำระ</p>
							<p className="text-lg font-semibold text-slate-900">{formatPrice(estimatedTotal)}</p>
						</div>
						<button
							type="button"
							onClick={() => router.push("/checkout")}
							disabled={items.length === 0}
							className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600"
						>
							ไปชำระเงิน
						</button>
					</div>
				</div>
			</div>

			{selectedProduct ? (
				<ProductPopupModal
					product={selectedProduct}
					onClose={() => setSelectedProduct(null)}
					variant="readOnly"
				/>
			) : null}
		</div>
	);
}
