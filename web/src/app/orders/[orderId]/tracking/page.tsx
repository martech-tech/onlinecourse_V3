"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
	getOrderTracking,
	SHIPPING_STATUS_LABELS,
	SHIPPING_STATUS_COLORS,
	type TrackingInfo,
	type TrackingEvent,
	type ShippingStatus,
} from "@/lib/shippingApi";

// Timeline step order for progress bar
const STATUS_STEPS: ShippingStatus[] = [
	"submitted",
	"picked_up",
	"in_transit",
	"out_for_delivery",
	"delivered",
];

function getStepIndex(status: ShippingStatus): number {
	const idx = STATUS_STEPS.indexOf(status);
	return idx >= 0 ? idx : -1;
}

function StatusBadge({ status }: { status: ShippingStatus }) {
	const color = SHIPPING_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
	const label = SHIPPING_STATUS_LABELS[status] || status;
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
		>
			{label}
		</span>
	);
}

function ProgressStepper({ currentStatus }: { currentStatus: ShippingStatus }) {
	const currentIdx = getStepIndex(currentStatus);
	const isCancelled = currentStatus === "cancelled" || currentStatus === "failed";

	return (
		<div className="mt-6">
			<div className="flex items-center justify-between">
				{STATUS_STEPS.map((step, i) => {
					const isActive = i <= currentIdx;
					const isCurrent = i === currentIdx;
					return (
						<div key={step} className="flex flex-1 flex-col items-center">
							<div className="relative flex w-full items-center">
								{i > 0 && (
									<div
										className={`h-0.5 flex-1 ${
											isActive ? "bg-orange-500" : "bg-slate-200"
										}`}
									/>
								)}
								<div
									className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
										isCancelled
											? "bg-red-100 text-red-500"
											: isCurrent
											? "bg-orange-500 text-white ring-4 ring-orange-100"
											: isActive
											? "bg-orange-500 text-white"
											: "bg-slate-200 text-slate-400"
									}`}
								>
									{isActive && !isCancelled ? (
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									) : (
										i + 1
									)}
								</div>
								{i < STATUS_STEPS.length - 1 && (
									<div
										className={`h-0.5 flex-1 ${
											i < currentIdx ? "bg-orange-500" : "bg-slate-200"
										}`}
									/>
								)}
							</div>
							<p
								className={`mt-2 text-center text-[10px] leading-tight ${
									isActive ? "font-semibold text-slate-700" : "text-slate-400"
								}`}
							>
								{SHIPPING_STATUS_LABELS[step]}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
	if (!events.length) {
		return (
			<p className="py-8 text-center text-sm text-slate-400">
				ยังไม่มีข้อมูลการเคลื่อนไหวพัสดุ
			</p>
		);
	}

	return (
		<div className="relative ml-4 border-l-2 border-slate-200 pl-6">
			{events.map((event, i) => (
				<div key={i} className="relative pb-6 last:pb-0">
					{/* Dot */}
					<div
						className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 ${
							i === 0
								? "border-orange-500 bg-orange-500"
								: "border-slate-300 bg-white"
						}`}
					/>
					<div>
						<p className="text-sm font-semibold text-slate-800">
							{event.description || event.scanType}
						</p>
						<div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
							{event.scanTime && (
								<span>
									{new Date(event.scanTime).toLocaleString("th-TH", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</span>
							)}
							{event.scanCity && <span>{event.scanCity}</span>}
							{event.province && <span>{event.province}</span>}
							{event.entrySiteName && <span>{event.entrySiteName}</span>}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default function OrderTrackingPage() {
	const params = useParams();
	const orderId = params?.orderId as string;

	const [tracking, setTracking] = useState<TrackingInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTracking = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getOrderTracking(orderId);
			setTracking(data);
			setError(null);
		} catch (e) {
			setError(
				e instanceof Error && e.message === "NOT_FOUND"
					? "ไม่พบข้อมูลการจัดส่ง"
					: "โหลดข้อมูลไม่สำเร็จ"
			);
		} finally {
			setLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		if (orderId) fetchTracking();
	}, [orderId, fetchTracking]);

	// Auto-refresh every 30 seconds if in transit
	useEffect(() => {
		if (!tracking) return;
		const autoRefreshStatuses: ShippingStatus[] = [
			"submitted",
			"picked_up",
			"in_transit",
			"out_for_delivery",
		];
		if (!autoRefreshStatuses.includes(tracking.shipping.status)) return;

		const interval = setInterval(fetchTracking, 30_000);
		return () => clearInterval(interval);
	}, [tracking, fetchTracking]);

	// Combine stored events + live traces, deduplicate
	const allEvents: TrackingEvent[] = (() => {
		if (!tracking) return [];
		const combined = [...tracking.events];
		for (const live of tracking.liveTraces) {
			const exists = combined.some(
				(e) => e.scanType === live.scanType && e.scanTime === live.scanTime
			);
			if (!exists) combined.push(live);
		}
		combined.sort(
			(a, b) =>
				new Date(b.scanTime || 0).getTime() -
				new Date(a.scanTime || 0).getTime()
		);
		return combined;
	})();

	if (loading && !tracking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
				<div className="text-sm text-slate-500">กำลังโหลด...</div>
			</div>
		);
	}

	if (error && !tracking) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
				<p className="text-sm text-red-600">{error}</p>
				<Link
					href="/dashboard"
					className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
				>
					กลับหน้าแดชบอร์ด
				</Link>
			</div>
		);
	}

	if (!tracking) return null;

	const { shipping } = tracking;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-slate-900">
							ติดตามพัสดุ
						</h1>
						<p className="mt-0.5 text-xs text-slate-500">
							คำสั่งซื้อ: {shipping.orderPublicId}
						</p>
					</div>
					<Link
						href="/dashboard"
						className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
					>
						กลับ
					</Link>
				</div>

				{/* Bill code & Status */}
				<div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-xs text-slate-500">เลขพัสดุ J&T Express</p>
							<p className="mt-1 text-lg font-bold tracking-wider text-slate-900">
								{shipping.billCode || "รอสร้างเลขพัสดุ"}
							</p>
						</div>
						<StatusBadge status={shipping.status} />
					</div>

					{/* Progress stepper */}
					{shipping.status !== "pending" &&
						shipping.status !== "cancelled" &&
						shipping.status !== "failed" && (
							<ProgressStepper currentStatus={shipping.status} />
						)}

					{shipping.status === "cancelled" && (
						<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							การจัดส่งถูกยกเลิก
						</div>
					)}
				</div>

				{/* Receiver info */}
				<div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
					<h2 className="text-sm font-semibold text-slate-900">
						ข้อมูลผู้รับ
					</h2>
					<div className="mt-3 space-y-1.5 text-sm text-slate-600">
						<p>
							<span className="font-medium">ชื่อ:</span>{" "}
							{shipping.receiver.name}
						</p>
						<p>
							<span className="font-medium">โทร:</span>{" "}
							{shipping.receiver.phone}
						</p>
						<p>
							<span className="font-medium">ที่อยู่:</span>{" "}
							{[
								shipping.receiver.address,
								shipping.receiver.district,
								shipping.receiver.city,
								shipping.receiver.province,
								shipping.receiver.postCode,
							]
								.filter(Boolean)
								.join(", ")}
						</p>
					</div>
				</div>

				{/* Tracking timeline */}
				<div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-slate-900">
							ประวัติการเคลื่อนไหว
						</h2>
						<button
							type="button"
							onClick={fetchTracking}
							disabled={loading}
							className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
						>
							{loading ? "กำลังโหลด..." : "รีเฟรช"}
						</button>
					</div>
					<div className="mt-4">
						<TrackingTimeline events={allEvents} />
					</div>
				</div>
			</div>
		</div>
	);
}
