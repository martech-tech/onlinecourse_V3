"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/useAuth";
import { formatPrice } from "@/lib/shop";
import { signIn } from "next-auth/react";

const COUPON_STORAGE_KEY = "jk-cart-coupon";

type AppliedCoupon = {
	code: string;
	discount: number;
	total: number;
	subtotal: number;
	description: string | null;
	appliedAt: string;
};

type ShippingInfo = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
};

const SHIPPING_STORAGE_KEY = "jk-checkout-shipping";

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) return "";
	return base.replace(/\/$/, "");
}

function readShippingFromSession(): Partial<ShippingInfo> {
	if (typeof window === "undefined") return {};
	const raw = window.sessionStorage.getItem(SHIPPING_STORAGE_KEY);
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw) as Partial<ShippingInfo>;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

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

type CheckoutGuestResponse = {
	ok: boolean;
	found?: boolean;
	created?: boolean;
	error?: string;
	message?: string;
	user?: {
		id: string;
		email: string;
		role: string;
		name?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		phoneNumber?: string | null;
	};
};

export default function CheckoutPage() {
	const router = useRouter();
	const { user, updateSession } = useAuth();
	const { items, subtotal, totalItems, clearCart } = useCart();

	const originalTotal = useMemo(
		() => items.reduce((total, item) => total + item.product.compareAtPrice * item.quantity, 0),
		[items]
	);

	const [shipping, setShipping] = useState<ShippingInfo>({
		firstName: "",
		lastName: "",
		email: user?.email ?? "",
		phone: user?.phoneNumber ?? "",
		address: "",
	});

	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

	// Guest lookup state
	const [lookupStatus, setLookupStatus] = useState<"idle" | "checking" | "found" | "not_found" | "error">("idle");
	const [lookupMessage, setLookupMessage] = useState<string | null>(null);
	const lookupDoneRef = useRef(false);

	const couponDiscount = useMemo(() => {
		if (!appliedCoupon) return 0;
		if (appliedCoupon.subtotal !== subtotal) return 0;
		return appliedCoupon.discount;
	}, [appliedCoupon, subtotal]);

	const payTotal = useMemo(() => Math.max(subtotal - couponDiscount, 0), [subtotal, couponDiscount]);

	// Restore from session + prefill from user
	useEffect(() => {
		const stored = readShippingFromSession();
		setShipping((prev) => ({
			firstName: stored.firstName ?? prev.firstName ?? (user?.firstName ?? ""),
			lastName: stored.lastName ?? prev.lastName ?? (user?.lastName ?? ""),
			email: stored.email ?? prev.email ?? (user?.email ?? ""),
			phone: stored.phone ?? prev.phone ?? (user?.phoneNumber ?? ""),
			address: stored.address ?? prev.address,
		}));
	}, [user?.email, user?.firstName, user?.lastName, user?.phoneNumber]);

	useEffect(() => {
		const storedCoupon = readCouponFromSession();
		if (storedCoupon && storedCoupon.subtotal === subtotal) setAppliedCoupon(storedCoupon);
	}, [subtotal]);

	// Persist shipping to session
	useEffect(() => {
		if (typeof window === "undefined") return;
		window.sessionStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
	}, [shipping]);

	// --- Guest auto-login lookup: triggered when phone reaches 10 digits ---
	const doGuestLookup = useCallback(
		async (email: string, phone: string) => {
			if (user) return; // already logged in
			if (!email.trim() || !email.includes("@")) return;
			const cleaned = phone.replace(/\D/g, "");
			if (cleaned.length !== 10 || !cleaned.startsWith("0")) return;

			setLookupStatus("checking");
			setLookupMessage(null);
			try {
				const res = await fetch(`${apiBase()}/auth/checkout-guest`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ email: email.trim(), phone: cleaned }),
				});
				const json = (await res.json()) as CheckoutGuestResponse;

				if (res.ok && json.ok && json.found && json.user) {
					// Auto-login succeeded — sync NextAuth session
					setLookupStatus("found");
					setLookupMessage(`พบบัญชีผู้ใช้ (${json.user.email}) เข้าสู่ระบบอัตโนมัติแล้ว`);
					// Pre-fill name from user if form fields are still empty
					if (json.user.firstName) {
						setShipping((prev) => ({
							...prev,
							firstName: prev.firstName || json.user!.firstName || "",
							lastName: prev.lastName || json.user!.lastName || "",
						}));
					}
					lookupDoneRef.current = true;
					// Refresh NextAuth session so useAuth() picks up the new user
					await signIn("server-cookie", { redirect: false });
					await updateSession();
				} else if (res.ok && json.ok && !json.found) {
					setLookupStatus("not_found");
					setLookupMessage(null);
					lookupDoneRef.current = true;
				} else {
					setLookupStatus("error");
					setLookupMessage(json.message || json.error || "ตรวจสอบไม่สำเร็จ");
				}
			} catch {
				setLookupStatus("error");
				setLookupMessage("ไม่สามารถตรวจสอบบัญชีได้ กรุณาลองใหม่");
			}
		},
		[user, updateSession]
	);

	// Trigger lookup when phone changes to 10 digits
	useEffect(() => {
		if (user) return; // logged in, skip
		if (lookupDoneRef.current) return; // already looked up
		const cleaned = shipping.phone.replace(/\D/g, "");
		if (cleaned.length === 10 && cleaned.startsWith("0") && shipping.email.includes("@")) {
			doGuestLookup(shipping.email, shipping.phone);
		}
	}, [shipping.phone, shipping.email, user, doGuestLookup]);

	// Reset lookup state if email or phone changes after a lookup was done
	useEffect(() => {
		if (lookupDoneRef.current && lookupStatus !== "checking") {
			// If user edits email or phone after lookup, reset so a new lookup can happen
			lookupDoneRef.current = false;
			setLookupStatus("idle");
			setLookupMessage(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shipping.email, shipping.phone]);

	// --- Guest auto-register at submit time ---
	async function ensureLoggedIn(): Promise<boolean> {
		// If already logged in, we're good
		if (user) return true;

		const email = shipping.email.trim().toLowerCase();
		const phone = shipping.phone.replace(/\D/g, "");
		const firstName = shipping.firstName.trim();
		const lastName = shipping.lastName.trim();

		if (!email || !phone || !firstName) return false;

		try {
			const res = await fetch(`${apiBase()}/auth/checkout-guest`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					email,
					phone,
					firstName,
					lastName,
					register: true,
				}),
			});
			const json = (await res.json()) as CheckoutGuestResponse;

			if (!res.ok || !json.ok) {
				setError(json.message || json.error || "ไม่สามารถสร้างบัญชีได้");
				return false;
			}

			// Sync NextAuth session
			await signIn("server-cookie", { redirect: false });
			await updateSession();
			return true;
		} catch {
			setError("ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่");
			return false;
		}
	}

	async function handlePaySolution() {
		setError(null);
		if (items.length === 0) {
			setError("ตะกร้าของคุณว่างอยู่");
			return;
		}
		if (!shipping.email.trim()) return setError("กรุณากรอกอีเมล");
		if (!shipping.phone.trim()) return setError("กรุณากรอกเบอร์โทรศัพท์");
		if (!shipping.firstName.trim()) return setError("กรุณากรอกชื่อ");
		if (!shipping.address.trim()) return setError("กรุณากรอกที่อยู่");

		setIsSubmitting(true);
		try {
			// Ensure user is logged in (auto-register if guest)
			const loggedIn = await ensureLoggedIn();
			if (!loggedIn) {
				setIsSubmitting(false);
				return;
			}

			const receiverName = `${shipping.firstName.trim()} ${shipping.lastName.trim()}`.trim();

			const res = await fetch("/api/paysolutions/create-subscript", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					amount: payTotal,
					items: items.map((item) => ({
						id: item.product.id,
						name: item.product.name,
						quantity: item.quantity,
						price: item.product.price,
					})),
					couponCode: appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon.code : undefined,
					customer: {
						email: shipping.email,
						phone: shipping.phone,
					},
					shipping: {
						receiverName,
						firstName: shipping.firstName.trim(),
						lastName: shipping.lastName.trim(),
						email: shipping.email,
						phone: shipping.phone,
						address: shipping.address,
					},
				}),
			});

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				throw new Error(text || "สร้างรายการชำระเงินไม่สำเร็จ");
			}

			const json = (await res.json()) as {
				devMode?: boolean;
				reference: string;
				referenceNo: string;
				productDetail: string;
				orderPublicId: string | null;
				merchantId: string;
				paymentUrl: string;
				total: number;
			};

			if (typeof window !== "undefined") {
				window.sessionStorage.setItem(
					"jk-pending-order",
					JSON.stringify({
						orderPublicId: json.orderPublicId,
						reference: json.reference,
						createdAt: new Date().toISOString(),
						items,
						shipping: {
							receiverName,
							firstName: shipping.firstName.trim(),
							lastName: shipping.lastName.trim(),
							email: shipping.email,
							phone: shipping.phone,
							address: shipping.address,
						},
						amount: json.total,
					})
				);
			}

			clearCart();
			setAppliedCoupon(null);
			if (typeof window !== "undefined") {
				window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
			}

			if (json.devMode) {
				router.push("/checkout/status");
				return;
			}

			const form = document.createElement("form");
			form.method = "post";
			form.action = json.paymentUrl;

			const fields: Record<string, string> = {
				refno: json.referenceNo,
				merchantid: json.merchantId,
				customeremail: shipping.email,
				cc: "00",
				productdetail: json.productDetail,
				total: String(json.total),
			};

			for (const [name, value] of Object.entries(fields)) {
				const input = document.createElement("input");
				input.type = "hidden";
				input.name = name;
				input.value = value;
				form.appendChild(input);
			}

			document.body.appendChild(form);
			form.submit();
		} catch (e) {
			setError(e instanceof Error ? e.message : "เริ่มต้นการชำระเงินไม่สำเร็จ");
			setIsSubmitting(false);
		}
	}

	const isLoggedIn = Boolean(user);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">ชำระเงิน</h1>
						<p className="text-sm text-slate-500">{totalItems} รายการ</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => router.push("/cart")}
							className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
						>
							กลับไปที่ตะกร้า
						</button>
						<Link
							href="/shop"
							className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
						>
							เลือกซื้อสินค้าต่อ
						</Link>
					</div>
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
					<div className="mt-6 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-7">
							<div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
								<h2 className="text-sm font-semibold text-slate-900">ข้อมูลการจัดส่ง</h2>
								<p className="mt-1 text-xs text-slate-500">กรุณากรอกข้อมูลก่อนชำระเงิน</p>

								{/* Auto-login notification */}
								{lookupStatus === "found" && lookupMessage && (
									<div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
										{lookupMessage}
									</div>
								)}
								{lookupStatus === "error" && lookupMessage && (
									<div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
										{lookupMessage}
									</div>
								)}

								<div className="mt-4 grid gap-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="text-xs font-semibold text-slate-600">1. อีเมล</label>
											<input
												type="email"
												value={shipping.email}
												onChange={(e) => setShipping((prev) => ({ ...prev, email: e.target.value }))}
												disabled={isLoggedIn}
												className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm disabled:bg-slate-50 disabled:text-slate-500"
												placeholder="you@example.com"
											/>
										</div>
										<div>
											<label className="text-xs font-semibold text-slate-600">
												2. เบอร์โทรศัพท์
												{lookupStatus === "checking" && (
													<span className="ml-2 text-xs font-normal text-slate-400">กำลังตรวจสอบ...</span>
												)}
											</label>
											<input
												type="tel"
												value={shipping.phone}
												onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
												disabled={isLoggedIn}
												className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm disabled:bg-slate-50 disabled:text-slate-500"
												placeholder="0XXXXXXXXX"
												maxLength={10}
											/>
										</div>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="text-xs font-semibold text-slate-600">3. ชื่อ</label>
											<input
												type="text"
												value={shipping.firstName}
												onChange={(e) => setShipping((prev) => ({ ...prev, firstName: e.target.value }))}
												className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
												placeholder="ชื่อ"
											/>
										</div>
										<div>
											<label className="text-xs font-semibold text-slate-600">4. นามสกุล</label>
											<input
												type="text"
												value={shipping.lastName}
												onChange={(e) => setShipping((prev) => ({ ...prev, lastName: e.target.value }))}
												className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
												placeholder="นามสกุล"
											/>
										</div>
									</div>

									<div>
										<label className="text-xs font-semibold text-slate-600">5. ที่อยู่</label>
										<textarea
											value={shipping.address}
											onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))}
											className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
											placeholder="ที่อยู่จัดส่ง"
										/>
									</div>
								</div>

								{error ? (
									<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
										{error}
									</div>
								) : null}
							</div>
						</div>

						<div className="lg:col-span-5">
							<div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
								<h2 className="text-sm font-semibold text-slate-900">สรุปคำสั่งซื้อ</h2>
								<div className="mt-4 space-y-3">
									{items.map((item) => (
										<div key={item.product.id} className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-slate-900">{item.product.name}</p>
												<p className="text-xs text-slate-500">จำนวน: {item.quantity}</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-slate-400 line-through">{formatPrice(item.product.compareAtPrice * item.quantity)}</p>
												<p className="text-sm font-semibold text-slate-900">{formatPrice(item.product.price * item.quantity)}</p>
											</div>
										</div>
									))}
								</div>

								<div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
									<div className="flex items-center justify-between text-xs text-slate-500">
										<span>ราคาเดิม</span>
										<span className="line-through">{formatPrice(originalTotal)}</span>
									</div>
									<div className="mt-2 flex items-center justify-between text-xs text-slate-500">
										<span>ยอดรวม</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									{couponDiscount > 0 && appliedCoupon ? (
										<div className="mt-2 flex items-center justify-between text-xs text-slate-500">
											<span>คูปอง ({appliedCoupon.code})</span>
											<span>-{formatPrice(couponDiscount)}</span>
										</div>
									) : null}
									<div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-900">
										<span>รวมทั้งหมด</span>
										<span>{formatPrice(payTotal)}</span>
									</div>
								</div>

								<button
									type="button"
									onClick={handlePaySolution}
									disabled={isSubmitting}
									className="mt-4 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? "กำลังไปหน้าชำระเงิน…" : "ชำระเงินด้วย PaySolution"}
								</button>
								<p className="mt-2 text-center text-xs text-slate-500">
									ระบบจะพาคุณไปยังหน้าชำระเงิน
								</p>
								<p className="mt-2 text-center text-xs text-slate-500">
									หลังชำระเงิน คุณสามารถตรวจสอบได้ที่{' '}
									<Link href="/checkout/status" className="font-semibold text-orange-600 hover:text-orange-700">
										สถานะการชำระเงิน
									</Link>
									.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
