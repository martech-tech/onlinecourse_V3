'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface OrderItem {
	productName: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
}

interface JTOrder {
	id: number;
	publicId: string;
	receiverName: string | null;
	email: string | null;
	phone: string | null;
	shippingAddress: string | null;
	total: number;
	shippingStatus: string;
	billCode: string | null;
	trackingNumber: string | null;
	sortCode: string | null;
	txLogisticId: string | null;
	jtStatus: string | null;
	hasShippingOrder: boolean;
	createdAt: string;
	items: OrderItem[];
}

interface TrackingDetail {
	scanType: string;
	description: string;
	scanTime: string;
	scanCity: string;
	province: string;
	entrySiteName: string;
}

// ─── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
	const res = await fetch(`${apiBase()}${path}`, {
		credentials: 'include',
		...opts,
		headers: { 'Content-Type': 'application/json', ...opts?.headers },
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
	return body as T;
}

// ─── Toast ──────────────────────────────────────────────────────────────────────

function useToast() {
	const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'ok' | 'err' }[]>([]);
	let nextId = 0;

	const show = (msg: string, type: 'ok' | 'err' = 'ok') => {
		const id = nextId++;
		setToasts((p) => [...p, { id, msg, type }]);
		setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
	};

	const ToastContainer = () =>
		toasts.length > 0 ? (
			<div className="fixed bottom-4 right-4 z-50 space-y-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
							t.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
						}`}
					>
						{t.msg}
					</div>
				))}
			</div>
		) : null;

	return { success: (m: string) => show(m, 'ok'), error: (m: string) => show(m, 'err'), ToastContainer };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseAddress(addr: string | null): { address: string; province: string; district: string; city: string; postCode: string } {
	if (!addr) return { address: '', province: '', district: '', city: '', postCode: '' };
	try {
		const obj = JSON.parse(addr);
		return {
			address: obj.address || '',
			province: obj.province || '',
			district: obj.district || '',
			city: obj.city || '',
			postCode: obj.postCode || '',
		};
	} catch {
		return { address: addr, province: '', district: '', city: '', postCode: '' };
	}
}

const JT_STATUS_LABEL: Record<string, string> = {
	pending: 'รอสร้างพัสดุ',
	submitted: 'สร้างพัสดุแล้ว',
	picked_up: 'รับพัสดุแล้ว',
	in_transit: 'กำลังจัดส่ง',
	out_for_delivery: 'กำลังนำจ่าย',
	delivered: 'จัดส่งสำเร็จ',
	cancelled: 'ยกเลิก',
	failed: 'มีปัญหา',
};

const JT_STATUS_STYLE: Record<string, string> = {
	pending: 'bg-slate-100 text-slate-600',
	submitted: 'bg-blue-100 text-blue-700',
	picked_up: 'bg-cyan-100 text-cyan-700',
	in_transit: 'bg-indigo-100 text-indigo-700',
	out_for_delivery: 'bg-purple-100 text-purple-700',
	delivered: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-700',
	failed: 'bg-red-100 text-red-700',
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminJTClient() {
	const toast = useToast();

	const [orders, setOrders] = useState<JTOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'no_bill' | 'has_bill'>('all');
	const [expanded, setExpanded] = useState<number | null>(null);
	const [creatingId, setCreatingId] = useState<number | null>(null);
	const [cancellingId, setCancellingId] = useState<number | null>(null);
	const [trackingData, setTrackingData] = useState<Record<string, TrackingDetail[]>>({});
	const [trackingLoading, setTrackingLoading] = useState<string | null>(null);

	const fetchAll = useCallback(async () => {
		try {
			const data = await apiFetch<{ orders: JTOrder[] }>('/admin/jt/orders');
			setOrders(data.orders || []);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	// ─── Create shipment ──────────────────────────────────────────────────

	const handleCreateShipment = async (orderId: number) => {
		setCreatingId(orderId);
		try {
			const data = await apiFetch<{ billCode: string; sortCode: string }>('/admin/jt/create-shipment', {
				method: 'POST',
				body: JSON.stringify({ orderId }),
			});
			toast.success(`สร้างพัสดุสำเร็จ — Bill Code: ${data.billCode}`);
			await fetchAll();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'สร้างพัสดุไม่สำเร็จ');
		}
		setCreatingId(null);
	};

	// ─── Cancel shipment ──────────────────────────────────────────────────

	const handleCancelShipment = async (orderId: number) => {
		if (!confirm('ยืนยันยกเลิกพัสดุ?')) return;
		setCancellingId(orderId);
		try {
			await apiFetch('/admin/jt/cancel-shipment', {
				method: 'POST',
				body: JSON.stringify({ orderId }),
			});
			toast.success('ยกเลิกพัสดุสำเร็จ');
			await fetchAll();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'ยกเลิกไม่สำเร็จ');
		}
		setCancellingId(null);
	};

	// ─── Query tracking ───────────────────────────────────────────────────

	const handleQueryTracking = async (billCode: string) => {
		if (trackingData[billCode]) {
			setTrackingData((prev) => {
				const next = { ...prev };
				delete next[billCode];
				return next;
			});
			return;
		}
		setTrackingLoading(billCode);
		try {
			const data = await apiFetch<{ traces: { billCode: string; details: TrackingDetail[] }[] }>(
				`/admin/jt/tracking/${encodeURIComponent(billCode)}`
			);
			const details = data.traces?.[0]?.details || [];
			setTrackingData((prev) => ({ ...prev, [billCode]: details }));
			if (!details.length) toast.error('ไม่พบข้อมูล tracking');
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'Query tracking ไม่สำเร็จ');
		}
		setTrackingLoading(null);
	};

	// ─── Filter ───────────────────────────────────────────────────────────

	const filtered = orders.filter((o) => {
		if (filter === 'no_bill') return !o.billCode;
		if (filter === 'has_bill') return Boolean(o.billCode);
		return true;
	});

	const countNoBill = orders.filter((o) => !o.billCode).length;
	const countHasBill = orders.filter((o) => Boolean(o.billCode)).length;

	// ─── Render ───────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="mx-auto max-w-5xl p-8">
				<p className="text-slate-500">กำลังโหลด...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl p-6 space-y-5">
			<toast.ToastContainer />

			<Link href="/admin" className="text-sm text-blue-600 hover:underline">
				&larr; กลับหน้าแดชบอร์ด
			</Link>

			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-bold text-slate-900">J&T Express Open Platform</h1>
					<p className="text-sm text-slate-500">สร้างพัสดุ ออก Bill Code และติดตามสถานะ J&T</p>
				</div>
				<button
					onClick={() => { setLoading(true); fetchAll(); }}
					className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
				>
					รีเฟรช
				</button>
			</div>

			{/* Filter */}
			<div className="flex flex-wrap gap-2">
				{[
					{ key: 'all' as const, label: 'ทั้งหมด', count: orders.length },
					{ key: 'no_bill' as const, label: 'ยังไม่มี Bill Code', count: countNoBill },
					{ key: 'has_bill' as const, label: 'มี Bill Code แล้ว', count: countHasBill },
				].map((f) => (
					<button
						key={f.key}
						onClick={() => setFilter(f.key)}
						className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
							filter === f.key
								? 'border-slate-400 bg-slate-100 text-slate-900'
								: 'border-slate-200 text-slate-500 hover:text-slate-900'
						}`}
					>
						{f.label} <span className="ml-1 text-slate-400">({f.count})</span>
					</button>
				))}
			</div>

			{/* Order List */}
			{filtered.length === 0 ? (
				<div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400">
					ไม่มีรายการ
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((order) => {
						const isExp = expanded === order.id;
						const addr = parseAddress(order.shippingAddress);
						const jtStatus = order.jtStatus || (order.billCode ? 'submitted' : 'pending');
						const billCode = order.billCode;

						return (
							<div
								key={order.id}
								className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
							>
								{/* Row */}
								<div className="flex items-center gap-3 p-5">
									<div
										className="min-w-0 flex-1 cursor-pointer"
										onClick={() => setExpanded(isExp ? null : order.id)}
									>
										<div className="mb-1 flex flex-wrap items-center gap-2">
											<span className="font-bold text-slate-900">#{order.id}</span>
											<span
												className={`rounded-full px-2.5 py-1 text-xs font-bold ${
													JT_STATUS_STYLE[jtStatus] || 'bg-slate-100 text-slate-600'
												}`}
											>
												{JT_STATUS_LABEL[jtStatus] || jtStatus}
											</span>
											<span className="text-sm font-bold text-emerald-600">
												{Number(order.total).toLocaleString()} ฿
											</span>
										</div>
										<div className="text-sm text-slate-500">
											{order.receiverName || 'ไม่มีข้อมูลผู้รับ'}
											{order.phone ? ` · ${order.phone}` : ''}
										</div>
										{billCode ? (
											<div className="mt-1 flex items-center gap-2">
												<span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
													{billCode}
												</span>
												{order.sortCode ? (
													<span className="text-xs text-slate-400">Sort: {order.sortCode}</span>
												) : null}
											</div>
										) : null}
										<div className="mt-0.5 text-xs text-slate-400">
											{new Date(order.createdAt).toLocaleString('th-TH')} ·{' '}
											{order.items.map((i) => i.productName).join(', ')}
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-shrink-0 flex-col items-end gap-2">
										{!billCode ? (
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleCreateShipment(order.id);
												}}
												disabled={creatingId === order.id}
												className="whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
											>
												{creatingId === order.id ? 'กำลังสร้าง...' : 'สร้างพัสดุ J&T'}
											</button>
										) : (
											<>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleQueryTracking(billCode);
													}}
													disabled={trackingLoading === billCode}
													className="whitespace-nowrap rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
												>
													{trackingLoading === billCode
														? 'กำลังโหลด...'
														: trackingData[billCode]
															? 'ซ่อน Tracking'
															: 'ดู Tracking'}
												</button>
												{!['delivered', 'cancelled'].includes(jtStatus) ? (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleCancelShipment(order.id);
														}}
														disabled={cancellingId === order.id}
														className="whitespace-nowrap rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
													>
														{cancellingId === order.id ? '...' : 'ยกเลิกพัสดุ'}
													</button>
												) : null}
											</>
										)}
										<button onClick={() => setExpanded(isExp ? null : order.id)}>
											<svg
												className={`h-4 w-4 text-slate-400 transition-transform ${isExp ? 'rotate-180' : ''}`}
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</button>
									</div>
								</div>

								{/* Tracking timeline inline */}
								{billCode && trackingData[billCode] && trackingData[billCode].length > 0 ? (
									<div className="border-t border-slate-100 bg-orange-50/50 px-5 py-4">
										<p className="mb-3 text-xs font-semibold uppercase text-slate-500">
											Tracking Timeline — {billCode}
										</p>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{trackingData[billCode].map((ev, idx) => (
												<div key={idx} className="flex gap-3 text-sm">
													<div className="flex flex-col items-center">
														<div
															className={`mt-1 h-2.5 w-2.5 rounded-full ${
																idx === 0 ? 'bg-orange-500' : 'bg-slate-300'
															}`}
														/>
														{idx < trackingData[billCode].length - 1 ? (
															<div className="w-px flex-1 bg-slate-200" />
														) : null}
													</div>
													<div className="pb-3">
														<p
															className={`font-semibold ${
																idx === 0 ? 'text-orange-700' : 'text-slate-700'
															}`}
														>
															{ev.description || ev.scanType}
														</p>
														<p className="text-xs text-slate-400">
															{ev.scanTime
																? new Date(ev.scanTime).toLocaleString('th-TH')
																: ''}
															{ev.scanCity || ev.province
																? ` · ${ev.scanCity} ${ev.province}`.trim()
																: ''}
															{ev.entrySiteName ? ` (${ev.entrySiteName})` : ''}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>
								) : null}

								{/* Expanded detail */}
								{isExp && (
									<div className="space-y-4 border-t border-slate-100 bg-slate-50 p-5">
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<div className="mb-2 text-xs font-semibold uppercase text-slate-400">
													ที่อยู่ผู้รับ
												</div>
												<div className="space-y-1 text-sm">
													<div className="font-semibold text-slate-900">
														{order.receiverName || '-'}
													</div>
													<div className="text-slate-600">{addr.address}</div>
													<div className="text-slate-600">
														{addr.district} {addr.city} {addr.province} {addr.postCode}
													</div>
													<div className="text-slate-500">{order.phone}</div>
													<div className="text-slate-500">{order.email}</div>
												</div>
											</div>
											<div>
												<div className="mb-2 text-xs font-semibold uppercase text-slate-400">
													รายการสินค้า
												</div>
												<div className="space-y-1">
													{order.items.map((it, i) => (
														<div key={i} className="flex justify-between text-sm">
															<span className="text-slate-900">
																{it.productName} x{it.quantity}
															</span>
															<span className="text-emerald-600">
																{Number(it.lineTotal).toLocaleString()} ฿
															</span>
														</div>
													))}
												</div>
											</div>
										</div>

										{/* J&T info */}
										<div className="rounded-xl border border-slate-200 bg-white p-4">
											<div className="mb-2 text-xs font-semibold uppercase text-slate-400">
												J&T Express Info
											</div>
											<div className="grid gap-3 text-sm sm:grid-cols-3">
												<div>
													<span className="text-slate-500">Bill Code:</span>{' '}
													<span className="font-mono font-bold text-slate-900">
														{billCode || '-'}
													</span>
												</div>
												<div>
													<span className="text-slate-500">Sort Code:</span>{' '}
													<span className="font-mono text-slate-900">
														{order.sortCode || '-'}
													</span>
												</div>
												<div>
													<span className="text-slate-500">TX Logistic ID:</span>{' '}
													<span className="font-mono text-xs text-slate-900">
														{order.txLogisticId || '-'}
													</span>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
