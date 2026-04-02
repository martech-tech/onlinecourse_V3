"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function firstParam(params: URLSearchParams, keys: string[]) {
	for (const key of keys) {
		const value = params.get(key);
		if (value && value.trim()) return value.trim();
	}
	return "";
}

export default function CheckoutReturnPage() {
	const router = useRouter();
	const params = useSearchParams();
	const [stored, setStored] = useState(false);

	const refNo = useMemo(() => {
		if (!params) return "";
		return firstParam(params, ["refno", "refNo", "reference", "referenceNo", "RefNo"]);
	}, [params]);

	useEffect(() => {
		if (!refNo) return;
		if (typeof window === "undefined") return;

		const reference = refNo.startsWith("trxn-") ? refNo : `trxn-${refNo}`;
		const existingRaw = window.sessionStorage.getItem("jk-pending-order");
		let existing: unknown = null;
		try {
			existing = existingRaw ? (JSON.parse(existingRaw) as unknown) : null;
		} catch {
			existing = null;
		}

		window.sessionStorage.setItem(
			"jk-pending-order",
			JSON.stringify({
				...(existing && typeof existing === "object" ? (existing as Record<string, unknown>) : {}),
				reference,
				returnedAt: new Date().toISOString(),
			})
		);
		setStored(true);

		const t = window.setTimeout(() => router.replace("/checkout/status"), 800);
		return () => window.clearTimeout(t);
	}, [refNo, router]);

		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
				<div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10">
					<h1 className="text-2xl font-bold text-slate-900">กำลังกลับจากหน้าชำระเงิน</h1>
					<p className="mt-2 text-sm text-slate-600">
						{refNo
							? "กำลังบันทึกเลขอ้างอิงและตรวจสอบสถานะ…"
							: "ไม่พบเลขอ้างอิงใน URL."}
					</p>

				<div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">เลขอ้างอิง (refno)</p>
						<p className="mt-1 text-sm font-semibold text-slate-900">{refNo || "(ไม่มี)"}</p>
					<p className="mt-2 text-xs text-slate-500">
							{stored ? "บันทึกแล้ว กำลังไปหน้าสถานะ…" : ""}
					</p>

					<div className="mt-4 flex flex-wrap gap-2">
							<Link
								href="/checkout/status"
								className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
							>
								ไปที่หน้าสถานะ
							</Link>
							<Link
								href="/checkout"
								className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
							>
								กลับไปที่ชำระเงิน
							</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
