"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PendingOrder = {
	reference?: string;
	createdAt?: string;
	amount?: number;
	items?: Array<{ product: { id: string; name: string }; quantity: number }>;
	shipping?: { receiverName?: string; firstName?: string; lastName?: string; email?: string; phone?: string; address?: string };
};

type StatusResponse = {
	status: string | null;
	paid: boolean;
	pending: boolean;
	cancelled: boolean;
	raw: unknown;
};

function readPendingOrder(): PendingOrder | null {
	if (typeof window === "undefined") return null;
	const raw = window.sessionStorage.getItem("jk-pending-order");
	if (!raw) return null;
	try {
		return JSON.parse(raw) as PendingOrder;
	} catch {
		return null;
	}
}

export default function CheckoutStatusPage() {
	const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<StatusResponse | null>(null);

	const referenceNo = useMemo(() => {
		const ref = pendingOrder?.reference;
		if (!ref) return "";
		return ref.startsWith("trxn-") ? ref.slice("trxn-".length) : ref;
	}, [pendingOrder?.reference]);

	const checkStatus = useCallback(async () => {
		setError(null);
		setResult(null);
		if (!referenceNo) {
			setError("ไม่พบเลขอ้างอิง กรุณาเริ่มชำระเงินจากหน้า ตะกร้า/ชำระเงิน ก่อน");
			return;
		}
		setIsLoading(true);
		try {
			const res = await fetch("/api/paysolutions/request-subscription", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ referenceNo, productDetail: "Order" }),
			});
			if (!res.ok) {
				const text = await res.text().catch(() => "");
				throw new Error(text || "ตรวจสอบสถานะไม่สำเร็จ");
			}
			const json = (await res.json()) as StatusResponse;
			setResult(json);

			if (json.paid) {
				// If you later add server-side order persistence, this is where you'd finalize it.
				window.sessionStorage.removeItem("jk-pending-order");
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "ตรวจสอบสถานะไม่สำเร็จ");
		} finally {
			setIsLoading(false);
		}
	}, [referenceNo]);

	useEffect(() => {
		setPendingOrder(readPendingOrder());
	}, []);

	useEffect(() => {
		if (!referenceNo) return;
		if (isLoading) return;
		if (result?.paid) return;

		// Initial check on load / reference change
		checkStatus();
	}, [checkStatus, isLoading, referenceNo, result?.paid]);

	useEffect(() => {
		if (!referenceNo) return;
		if (result?.paid) return;

		const t = window.setInterval(() => {
			checkStatus();
		}, 10000);
		return () => window.clearInterval(t);
	}, [checkStatus, referenceNo, result?.paid]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">สถานะการชำระเงิน</h1>
						<p className="text-sm text-slate-500">ตรวจสอบผลการชำระเงิน PaySolution</p>
					</div>
					<div className="flex items-center gap-2">
						<Link
							href="/cart"
							className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
						>
							กลับไปที่ตะกร้า
						</Link>
						<Link
							href="/checkout"
							className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
						>
							ชำระเงิน
						</Link>
					</div>
				</div>

				<div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">เลขอ้างอิง</p>
					<p className="mt-1 text-sm font-semibold text-slate-900">
						{pendingOrder?.reference ?? "(ไม่มี)"}
					</p>
					<p className="mt-2 text-xs text-slate-500">
						หากเพิ่งชำระเงิน ให้กด “ตรวจสอบสถานะ”
					</p>

					{error ? (
						<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							{error}
						</div>
					) : null}

					{result ? (
						<div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-sm font-semibold text-slate-900">สถานะ: {result.status ?? "ไม่ทราบ"}</p>
							{result.paid ? (
								<p className="mt-1 text-sm text-emerald-700">ชำระเงินสำเร็จ</p>
							) : result.pending ? (
								<p className="mt-1 text-sm text-slate-700">ยังรอดำเนินการ ลองอีกครั้งในอีกสักครู่</p>
							) : result.cancelled ? (
								<p className="mt-1 text-sm text-red-700">ยกเลิกการชำระเงินแล้ว</p>
							) : (
								<p className="mt-1 text-sm text-slate-700">ยังไม่พบการยืนยันการชำระเงิน</p>
							)}
						</div>
					) : null}

					<button
						type="button"
						onClick={checkStatus}
						disabled={isLoading}
						className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoading ? "กำลังตรวจสอบ…" : "ตรวจสอบสถานะ"}
					</button>
					{/* <p className="mt-3 text-center text-xs text-slate-500">
						หากระบบพากลับมาหน้านี้ คุณสามารถใช้{' '}
						<Link href="/checkout/return" className="font-semibold text-orange-600 hover:text-orange-700">
							/checkout/return
						</Link>
						{' '}เพื่อดึงพารามิเตอร์ `refno`
					</p> */}
				</div>

				{/* <div className="mt-6 text-center text-xs text-slate-500">
					ต้องการชำระเงินอีกครั้ง? ไปที่ <Link className="font-semibold text-orange-600" href="/checkout">ชำระเงิน</Link>
				</div> */}
			</div>
		</div>
	);
}
