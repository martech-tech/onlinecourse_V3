'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createWorker } from 'tesseract.js';

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

interface ShippingOrder {
	id: number;
	publicId: string;
	receiverName: string | null;
	email: string | null;
	phone: string | null;
	shippingAddress: string | null;
	total: number;
	shippingStatus: 'pending' | 'processing' | 'shipped';
	trackingNumber: string | null;
	notes: string | null;
	printedAt: string | null;
	shippedAt: string | null;
	createdAt: string;
	items: OrderItem[];
}

interface TrackingEntry {
	tracking: string;
	name: string;
	orderId: number | null;
	orderName: string;
	matchNote?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const SHIP_STATUSES = [
	{ key: 'all', label: 'ทั้งหมด', color: 'text-slate-500' },
	{ key: 'pending', label: 'รอดำเนินการ', color: 'text-yellow-600' },
	{ key: 'processing', label: 'จัดส่งให้ขนส่งแล้ว', color: 'text-blue-600' },
	{ key: 'shipped', label: 'จัดส่งแล้ว', color: 'text-orange-600' },
] as const;

const SHIP_STYLE: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
	processing: 'bg-blue-100 text-blue-700 border-blue-300',
	shipped: 'bg-orange-100 text-orange-700 border-orange-300',
};

const SHIP_LABEL: Record<string, string> = {
	pending: '⏳ รอดำเนินการ',
	processing: '📦 จัดส่งให้ขนส่งแล้ว',
	shipped: '🚚 จัดส่งแล้ว',
};

// ─── Parse helpers ──────────────────────────────────────────────────────────────

function parseFlashText(text: string): { tracking: string; name: string }[] {
	const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
	const results: { tracking: string; name: string }[] = [];
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/\b(TH[A-Z0-9]{8,})\b/);
		if (m) {
			const tracking = m[1];
			let name = '';
			const next = lines[i + 1] || '';
			if (next && !next.match(/\bTH[A-Z0-9]{8,}\b/) && !next.match(/Weight:|Amount:|^\d+\./)) {
				name = next.replace(/^(นาย|นาง|นางสาว|น\.ส\.|ด\.ช\.|ด\.ญ\.)\s*/u, '').trim();
				i++;
			}
			if (tracking) results.push({ tracking, name });
		}
	}
	return results;
}

function parseCSVText(text: string): { tracking: string; name: string }[] {
	const lines = text.split('\n').filter((l) => l.trim());
	if (lines.length < 2) return [];
	const delim = lines[0].includes('\t') ? '\t' : ',';
	const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase().replace(/"/g, ''));
	const tIdx = headers.findIndex((h) => /tracking|barcode|พัสดุ|เลขที่|ref|หมายเลข/.test(h));
	const nIdx = headers.findIndex((h) => /name|ชื่อ|receiver|ผู้รับ|customer/.test(h));
	if (tIdx === -1) return [];
	return lines
		.slice(1)
		.map((line) => {
			const cols = line.split(delim).map((c) => c.trim().replace(/^"([\s\S]*)"$/, '$1'));
			return { tracking: cols[tIdx] || '', name: nIdx !== -1 ? cols[nIdx] || '' : '' };
		})
		.filter((r) => r.tracking.trim());
}

function normName(n: string) {
	return n
		.toLowerCase()
		.replace(/\s+/g, '')
		.replace(/นาย|นาง|นางสาว|น\.ส\.|ด\.ช\.|ด\.ญ\./g, '')
		.replace(/[^ก-ูa-z0-9]/g, '');
}

function parseAddress(addr: string | null): { address: string; province: string; district: string; postCode: string } {
	if (!addr) return { address: '', province: '', district: '', postCode: '' };
	try {
		const obj = JSON.parse(addr);
		return {
			address: obj.address || '',
			province: obj.province || '',
			district: obj.district || '',
			postCode: obj.postCode || '',
		};
	} catch {
		return { address: addr, province: '', district: '', postCode: '' };
	}
}

// ─── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
	const res = await fetch(`${apiBase()}${path}`, {
		credentials: 'include',
		...opts,
		headers: { 'Content-Type': 'application/json', ...opts?.headers },
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `HTTP ${res.status}`);
	}
	return res.json();
}

// ─── Toast ──────────────────────────────────────────────────────────────────────

function useToast() {
	const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'ok' | 'err' }[]>([]);
	const nextId = useRef(0);

	const show = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
		const id = nextId.current++;
		setToasts((p) => [...p, { id, msg, type }]);
		setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
	}, []);

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

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminShippingClient() {
	const toast = useToast();

	const [orders, setOrders] = useState<ShippingOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const [expanded, setExpanded] = useState<number | null>(null);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [editTracking, setEditTracking] = useState<Record<number, string>>({});
	const [editNotes, setEditNotes] = useState<Record<number, string>>({});
	const [saving, setSaving] = useState<number | null>(null);
	const [printing, setPrinting] = useState(false);

	// Import modal
	const [showImport, setShowImport] = useState(false);
	const [importTab, setImportTab] = useState<'image' | 'csv'>('image');
	const [parsed, setParsed] = useState<TrackingEntry[]>([]);
	const [importing, setImporting] = useState(false);
	const [ocrLoading, setOcrLoading] = useState(false);
	const [ocrProgress, setOcrProgress] = useState(0);
	const [ocrImages, setOcrImages] = useState<{ file: File; preview: string }[]>([]);
	const [ocrRawText, setOcrRawText] = useState('');
	const [importDate, setImportDate] = useState(() => new Date().toISOString().slice(0, 10));
	const imageInputRef = useRef<HTMLInputElement>(null);
	const csvInputRef = useRef<HTMLInputElement>(null);

	// ─── Fetch ────────────────────────────────────────────────────────────────

	const fetchAll = useCallback(async () => {
		try {
			const data = await apiFetch<{ orders: ShippingOrder[] }>('/admin/shipping/orders');
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

	// ─── Status helpers ───────────────────────────────────────────────────────

	const getStatus = (order: ShippingOrder) => order.shippingStatus || 'pending';

	const updateStatus = async (orderId: number, status: string) => {
		setSaving(orderId);
		try {
			await apiFetch(`/admin/shipping/orders/${orderId}/status`, {
				method: 'PATCH',
				body: JSON.stringify({ status }),
			});
			toast.success('อัปเดตสถานะแล้ว');
			await fetchAll();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'อัปเดตไม่สำเร็จ');
		}
		setSaving(null);
	};

	const saveTrackingNotes = async (orderId: number) => {
		setSaving(orderId);
		const order = orders.find((o) => o.id === orderId);
		try {
			await apiFetch(`/admin/shipping/orders/${orderId}/tracking`, {
				method: 'PATCH',
				body: JSON.stringify({
					trackingNumber: editTracking[orderId] ?? order?.trackingNumber ?? null,
					notes: editNotes[orderId] ?? order?.notes ?? null,
				}),
			});
			toast.success('บันทึกแล้ว');
			await fetchAll();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
		}
		setSaving(null);
	};

	// ─── Match tracking entries to orders ─────────────────────────────────────

	const matchEntries = (entries: { tracking: string; name: string }[]): TrackingEntry[] => {
		return entries.map((e) => {
			const nn = normName(e.name);
			let orderId: number | null = null;
			let orderName = '';
			let matchNote = '';

			if (nn) {
				for (const order of orders) {
					if (order.shippingStatus !== 'processing') continue;
					if (!order.receiverName) continue;

					const sn = normName(order.receiverName);
					if (!(sn === nn || sn.includes(nn) || nn.includes(sn))) continue;

					if (order.printedAt) {
						const printedDay = new Date(order.printedAt).toISOString().slice(0, 10);
						if (printedDay !== importDate) {
							matchNote = `ชื่อตรง แต่วันที่ปริ้น (${printedDay}) ไม่ตรงกับ ${importDate}`;
							continue;
						}
					} else {
						continue;
					}

					orderId = order.id;
					orderName = order.receiverName;
					break;
				}
			}
			return { tracking: e.tracking, name: e.name, orderId, orderName, matchNote };
		});
	};

	// ─── CSV import ───────────────────────────────────────────────────────────

	const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const text = ev.target?.result as string;
			const entries = parseCSVText(text);
			if (!entries.length) {
				toast.error('ไม่พบข้อมูล หรือรูปแบบ CSV ไม่ถูกต้อง');
				return;
			}
			setParsed(matchEntries(entries));
			toast.success(`พบ ${entries.length} รายการ`);
		};
		reader.readAsText(file, 'UTF-8');
	};

	// ─── Import confirm ───────────────────────────────────────────────────────

	const handleImportConfirm = async () => {
		const toApply = parsed.filter((p) => p.orderId !== null);
		if (!toApply.length) {
			toast.error('ไม่มีรายการที่ match กับออเดอร์');
			return;
		}
		setImporting(true);
		try {
			await apiFetch('/admin/shipping/orders/bulk-import', {
				method: 'POST',
				body: JSON.stringify({
					entries: toApply.map((e) => ({ orderId: e.orderId, trackingNumber: e.tracking })),
				}),
			});
			toast.success(`นำเข้า ${toApply.length} เลขพัสดุสำเร็จ — สถานะเปลี่ยนเป็น "จัดส่งแล้ว"`);
			setShowImport(false);
			setParsed([]);
			setOcrImages([]);
			await fetchAll();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'นำเข้าไม่สำเร็จ');
		}
		setImporting(false);
	};

	// ─── Image OCR ────────────────────────────────────────────────────────────

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;
		const items = files.map((f) => ({ file: f, preview: URL.createObjectURL(f as Blob) }));
		setOcrImages((prev) => [...prev, ...items]);
		setParsed([]);
		setOcrRawText('');
		e.target.value = '';
	};

	const handleOCR = async () => {
		if (!ocrImages.length) return;
		setOcrLoading(true);
		setOcrProgress(0);
		setParsed([]);
		setOcrRawText('');

		let allText = '';
		try {
			const worker = await createWorker('tha+eng', 1, {
				logger: (m: { status: string; progress: number }) => {
					if (m.status === 'recognizing text') {
						setOcrProgress(Math.round(m.progress * 100));
					}
				},
			});

			for (let i = 0; i < ocrImages.length; i++) {
				setOcrProgress(0);
				const {
					data: { text },
				} = await worker.recognize(ocrImages[i].file);
				allText += (allText ? '\n' : '') + text;
			}
			await worker.terminate();

			setOcrRawText(allText);
			const entries = parseFlashText(allText);

			if (!entries.length) {
				toast.error('ไม่พบเลขพัสดุในรูปภาพ ลองใช้รูปที่คมชัดกว่า');
			} else {
				setParsed(matchEntries(entries));
				toast.success(`พบเลขพัสดุ ${entries.length} รายการ`);
			}
		} catch (err: unknown) {
			toast.error('OCR ล้มเหลว: ' + (err instanceof Error ? err.message : 'unknown'));
		}
		setOcrLoading(false);
		setOcrProgress(0);
	};

	// ─── Print ────────────────────────────────────────────────────────────────

	const handlePrint = async () => {
		if (selected.size === 0) {
			toast.error('เลือกออเดอร์ก่อน');
			return;
		}
		setPrinting(true);

		const slips = Array.from(selected)
			.map((orderId) => {
				const order = orders.find((o) => o.id === orderId);
				if (!order) return '';
				const addr = parseAddress(order.shippingAddress);
				return `
				<div class="slip">
					<div class="slip-header">
						<span class="brand">J-KNOWLEDGE</span>
						<span class="order-id">ออเดอร์ #${orderId}</span>
					</div>
					<div class="section">
						<div class="label">ผู้รับ</div>
						<div class="value bold">${order.receiverName || '-'}</div>
						<div class="value">${order.phone || '-'}</div>
						<div class="value">${addr.address} ${addr.district} ${addr.province} ${addr.postCode}</div>
						${order.email ? `<div class="value muted">${order.email}</div>` : ''}
					</div>
					<div class="section">
						<div class="label">รายการสินค้า</div>
						${order.items.map((it) => `<div class="item-row"><span>${it.productName} x${it.quantity}</span><span>${Number(it.lineTotal).toLocaleString()} ฿</span></div>`).join('')}
					</div>
					<div class="total-row">รวมทั้งหมด <strong>${Number(order.total).toLocaleString()} ฿</strong></div>
					<div class="date">วันที่สั่ง: ${new Date(order.createdAt).toLocaleString('th-TH')}</div>
					${order.notes ? `<div class="notes">หมายเหตุ: ${order.notes}</div>` : ''}
				</div>`;
			})
			.join('');

		const win = window.open('', '_blank', 'width=800,height=900');
		if (!win) {
			toast.error('ไม่สามารถเปิดหน้าต่างได้ กรุณาอนุญาต popup');
			setPrinting(false);
			return;
		}

		win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
			<title>ใบส่งสินค้า</title>
			<style>
				* { box-sizing: border-box; }
				body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; padding: 20px; background: #fff; color: #000; }
				.slip { border: 2px solid #000; border-radius: 8px; padding: 20px; margin-bottom: 24px; page-break-inside: avoid; max-width: 600px; }
				.slip-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
				.brand { font-size: 18px; font-weight: 900; }
				.order-id { font-size: 20px; font-weight: 900; color: #059669; }
				.section { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #999; }
				.label { font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 4px; }
				.value { font-size: 15px; line-height: 1.6; }
				.value.bold { font-weight: 700; font-size: 17px; }
				.value.muted { color: #666; font-size: 13px; }
				.item-row { display: flex; justify-content: space-between; font-size: 14px; padding: 3px 0; }
				.total-row { text-align: right; font-size: 18px; padding: 8px 0; border-top: 2px solid #000; margin-top: 4px; }
				.date { font-size: 12px; color: #666; margin-top: 6px; }
				.notes { font-size: 13px; color: #444; margin-top: 4px; }
				.no-print { background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
				@media print { .no-print { display: none !important; } }
			</style>
		</head><body>
			<button class="no-print" onclick="window.print()">ปริ้นเลย</button>
			${slips}
		</body></html>`);
		win.document.close();

		// Mark as processing via API
		try {
			const pendingIds = Array.from(selected).filter((id) => {
				const o = orders.find((order) => order.id === id);
				return o && getStatus(o) === 'pending';
			});
			if (pendingIds.length) {
				await apiFetch('/admin/shipping/orders/bulk-print', {
					method: 'POST',
					body: JSON.stringify({ orderIds: pendingIds }),
				});
			}
			setSelected(new Set());
			await fetchAll();
			toast.success(`ปริ้น ${selected.size} ออเดอร์ — สถานะเปลี่ยนเป็น "จัดส่งให้ขนส่งแล้ว"`);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
		}
		setPrinting(false);
	};

	const toggleSelect = (id: number) =>
		setSelected((prev) => {
			const n = new Set(prev);
			n.has(id) ? n.delete(id) : n.add(id);
			return n;
		});

	// ─── Filtered orders ──────────────────────────────────────────────────────

	const filtered = filter === 'all' ? orders : orders.filter((o) => getStatus(o) === filter);
	const pendingOrders = filtered.filter((o) => getStatus(o) === 'pending');

	// ─── Render ───────────────────────────────────────────────────────────────

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

			{/* Back link */}
			<Link href="/admin" className="text-sm text-blue-600 hover:underline">
				&larr; กลับหน้าแดชบอร์ด
			</Link>

			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-bold text-slate-900">
					จัดการการส่งหนังสือ ({filtered.length} รายการ)
				</h1>
				<div className="flex items-center gap-2">
					{selected.size > 0 && (
						<button
							onClick={handlePrint}
							disabled={printing}
							className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
						>
							ปริ้นที่เลือก ({selected.size})
						</button>
					)}
					<button
						onClick={() => {
							setParsed([]);
							setOcrImages([]);
							setOcrRawText('');
							setImportTab('image');
							setShowImport(true);
						}}
						className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
					>
						นำเข้าเลขพัสดุ
					</button>
					<button
						onClick={() => { setLoading(true); fetchAll(); }}
						className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
					>
						รีเฟรช
					</button>
				</div>
			</div>

			{/* Status Filter */}
			<div className="flex flex-wrap gap-2">
				{SHIP_STATUSES.map((s) => {
					const count =
						s.key === 'all' ? orders.length : orders.filter((o) => getStatus(o) === s.key).length;
					return (
						<button
							key={s.key}
							onClick={() => setFilter(s.key)}
							className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
								filter === s.key
									? 'border-slate-400 bg-slate-100 text-slate-900'
									: 'border-slate-200 text-slate-500 hover:text-slate-900'
							}`}
						>
							<span className={s.color}>{s.label}</span>{' '}
							<span className="ml-1 text-slate-400">({count})</span>
						</button>
					);
				})}
			</div>

			{/* Select all pending */}
			{filter !== 'shipped' && pendingOrders.length > 0 && (
				<div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
					<input
						type="checkbox"
						checked={pendingOrders.every((o) => selected.has(o.id))}
						onChange={(e) => {
							if (e.target.checked) setSelected(new Set(pendingOrders.map((o) => o.id)));
							else setSelected(new Set());
						}}
						className="h-4 w-4 accent-blue-600 cursor-pointer"
					/>
					<span className="text-sm font-semibold text-blue-700">
						เลือกทั้งหมดที่รอดำเนินการ ({pendingOrders.length} ออเดอร์) เพื่อปริ้นสลิป
					</span>
				</div>
			)}

			{/* Order List */}
			{filtered.length === 0 ? (
				<div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400">
					ไม่มีรายการ
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((order) => {
						const status = getStatus(order);
						const isExp = expanded === order.id;
						const isSel = selected.has(order.id);
						const addr = parseAddress(order.shippingAddress);

						return (
							<div
								key={order.id}
								className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
									isSel ? 'border-blue-400' : 'border-slate-200'
								}`}
							>
								{/* Row */}
								<div className="flex items-center gap-3 p-5">
									{/* Checkbox */}
									<div className="flex-shrink-0">
										{status === 'pending' ? (
											<input
												type="checkbox"
												checked={isSel}
												onChange={() => toggleSelect(order.id)}
												className="h-5 w-5 accent-blue-600 cursor-pointer"
												onClick={(e) => e.stopPropagation()}
											/>
										) : (
											<div className="h-5 w-5" />
										)}
									</div>

									{/* Info */}
									<div
										className="min-w-0 flex-1 cursor-pointer"
										onClick={() => setExpanded(isExp ? null : order.id)}
									>
										<div className="mb-1 flex flex-wrap items-center gap-3">
											<span className="font-bold text-slate-900">#{order.id}</span>
											<span
												className={`rounded-full border px-2.5 py-1 text-xs font-bold ${SHIP_STYLE[status] || SHIP_STYLE.pending}`}
											>
												{SHIP_LABEL[status] || status}
											</span>
											<span className="text-sm font-bold text-emerald-600">
												{Number(order.total).toLocaleString()} ฿
											</span>
										</div>
										<div className="text-sm text-slate-500">
											{order.receiverName || 'ไม่มีข้อมูลผู้รับ'}
											{order.phone ? ` · ${order.phone}` : ''}
											{order.trackingNumber && (
												<span className="ml-2 text-orange-600">
													{order.trackingNumber}
												</span>
											)}
										</div>
										<div className="mt-0.5 text-xs text-slate-400">
											{new Date(order.createdAt).toLocaleString('th-TH')} ·{' '}
											{order.items.map((i) => i.productName).join(', ')}
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-shrink-0 items-center gap-2">
										{status === 'pending' && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSelected(new Set([order.id]));
												}}
												className="whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
											>
												ปริ้น
											</button>
										)}
										{status === 'processing' && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													updateStatus(order.id, 'shipped');
												}}
												disabled={saving === order.id}
												className="whitespace-nowrap rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100 disabled:opacity-50"
											>
												{saving === order.id ? '...' : '→ จัดส่งแล้ว'}
											</button>
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

								{/* Expanded */}
								{isExp && (
									<div className="space-y-4 border-t border-slate-100 bg-slate-50 p-5">
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<div className="mb-2 text-xs font-semibold uppercase text-slate-400">
													ที่อยู่จัดส่ง
												</div>
												<div className="space-y-1 text-sm">
													<div className="font-semibold text-slate-900">
														{order.receiverName || '-'}
													</div>
													<div className="text-slate-600">{addr.address}</div>
													<div className="text-slate-600">
														{addr.district} {addr.province} {addr.postCode}
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
														<div
															key={i}
															className="flex justify-between text-sm text-slate-900"
														>
															<span>
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

										{/* Tracking & Notes edit */}
										<div className="grid gap-3 md:grid-cols-2">
											<div className="space-y-1">
												<label className="text-xs text-slate-500">
													เลขพัสดุ / Tracking Number
												</label>
												<input
													className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-orange-400"
													placeholder="เช่น TH123456789"
													defaultValue={order.trackingNumber || ''}
													onChange={(e) =>
														setEditTracking((p) => ({
															...p,
															[order.id]: e.target.value,
														}))
													}
												/>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-slate-500">หมายเหตุ</label>
												<input
													className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400"
													placeholder="หมายเหตุเพิ่มเติม"
													defaultValue={order.notes || ''}
													onChange={(e) =>
														setEditNotes((p) => ({
															...p,
															[order.id]: e.target.value,
														}))
													}
												/>
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											<span className="self-center text-xs text-slate-500">
												เปลี่ยนสถานะ:
											</span>
											{['pending', 'processing', 'shipped'].map((s) => (
												<button
													key={s}
													onClick={() => updateStatus(order.id, s)}
													disabled={status === s || saving === order.id}
													className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40 ${
														status === s
															? SHIP_STYLE[s]
															: 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'
													}`}
												>
													{SHIP_LABEL[s]}
												</button>
											))}
											<button
												onClick={() => saveTrackingNotes(order.id)}
												disabled={saving === order.id}
												className="ml-auto rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
											>
												{saving === order.id
													? 'กำลังบันทึก...'
													: 'บันทึก Tracking / หมายเหตุ'}
											</button>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* ─── Import Tracking Modal ──────────────────────────────────────── */}
			{showImport && (
				<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
					<div className="my-8 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-slate-100 p-6">
							<div>
								<h3 className="text-lg font-bold text-slate-900">นำเข้าเลขพัสดุ</h3>
								<p className="mt-0.5 text-xs text-slate-500">
									อ่านข้อมูลจากรูปภาพ (Flash / J&T / Kerry) หรืออัปโหลด CSV
								</p>
							</div>
							<button
								onClick={() => {
									setShowImport(false);
									setOcrImages([]);
									setParsed([]);
								}}
								className="text-slate-400 hover:text-slate-900"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="space-y-5 p-6">
							{/* Import date */}
							<div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-bold text-yellow-700">
										วันที่ส่งสินค้าให้ขนส่ง
									</span>
									<span className="text-xs text-slate-500">
										(ต้องตรงกับวันที่ปริ้นสลิป)
									</span>
								</div>
								<input
									type="date"
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-yellow-500"
									value={importDate}
									onChange={(e) => {
										setImportDate(e.target.value);
										setParsed([]);
									}}
								/>
								<p className="text-xs text-slate-500">
									ระบบจะ match เฉพาะออเดอร์ที่{' '}
									<strong className="text-slate-900">ปริ้นสลิปในวันนี้</strong> และ{' '}
									<strong className="text-slate-900">ชื่อตรงกัน</strong> เท่านั้น
								</p>
							</div>

							{/* Tabs */}
							<div className="flex gap-2 rounded-2xl bg-slate-100 p-1 w-fit">
								{[
									{ key: 'image', label: 'อัปโหลดรูปภาพ' },
									{ key: 'csv', label: 'อัปโหลด CSV' },
								].map((t) => (
									<button
										key={t.key}
										onClick={() => {
											setImportTab(t.key as 'image' | 'csv');
											setParsed([]);
											setOcrImages([]);
											setOcrRawText('');
										}}
										className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
											importTab === t.key
												? 'bg-purple-600 text-white'
												: 'text-slate-500 hover:text-slate-900'
										}`}
									>
										{t.label}
									</button>
								))}
							</div>

							{/* Image OCR Tab */}
							{importTab === 'image' && (
								<div className="space-y-4">
									<div
										onClick={() => imageInputRef.current?.click()}
										className="cursor-pointer rounded-2xl border-2 border-dashed border-purple-300 p-8 text-center transition-all hover:border-purple-500 group"
									>
										<svg className="mx-auto mb-3 h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p className="font-semibold text-slate-900">คลิกเลือกรูปภาพจากขนส่ง</p>
										<p className="mt-1 text-sm text-slate-500">
											รองรับ JPG, PNG — เลือกได้หลายรูปพร้อมกัน
										</p>
										<p className="mt-2 text-xs text-slate-400">
											Flash Express, J&T, Kerry ฯลฯ
										</p>
									</div>
									<input
										ref={imageInputRef}
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={handleImageSelect}
									/>

									{/* Image previews */}
									{ocrImages.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-sm text-slate-500">
													{ocrImages.length} รูปที่เลือก
												</span>
												<button
													onClick={() => {
														setOcrImages([]);
														setParsed([]);
														setOcrRawText('');
													}}
													className="text-xs text-red-500 hover:text-red-700"
												>
													ล้างทั้งหมด
												</button>
											</div>
											<div className="flex gap-3 overflow-x-auto pb-2">
												{ocrImages.map((img, i) => (
													<div key={i} className="relative flex-shrink-0">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={img.preview}
															alt={`img-${i}`}
															className="h-36 w-28 rounded-xl border border-slate-200 object-cover"
														/>
														<button
															onClick={() =>
																setOcrImages((prev) =>
																	prev.filter((_, pi) => pi !== i)
																)
															}
															className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
														>
															&times;
														</button>
													</div>
												))}
												<div
													onClick={() => imageInputRef.current?.click()}
													className="flex h-36 w-28 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 transition-all hover:border-purple-500"
												>
													<svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
													</svg>
													<span className="text-xs text-slate-400">เพิ่มรูป</span>
												</div>
											</div>

											{/* OCR Button */}
											{!ocrLoading ? (
												<button
													onClick={handleOCR}
													className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700"
												>
													อ่านข้อมูลจากรูปภาพ ({ocrImages.length} รูป)
												</button>
											) : (
												<div className="space-y-2">
													<div className="flex justify-between text-sm text-slate-500">
														<span>กำลังอ่านข้อความจากรูป...</span>
														<span className="font-bold text-purple-600">
															{ocrProgress}%
														</span>
													</div>
													<div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
														<div
															className="h-full rounded-full bg-purple-500 transition-all duration-300"
															style={{ width: `${ocrProgress}%` }}
														/>
													</div>
													<p className="text-center text-xs text-slate-400">
														กรุณารอสักครู่ ระบบกำลังอ่านตัวอักษรจากรูปภาพ
													</p>
												</div>
											)}
										</div>
									)}

									{/* Raw text */}
									{ocrRawText && !parsed.length && (
										<details className="rounded-xl bg-slate-100 p-3">
											<summary className="cursor-pointer text-xs text-slate-500">
												ดูข้อความที่อ่านได้ (Raw)
											</summary>
											<pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-600">
												{ocrRawText}
											</pre>
										</details>
									)}
								</div>
							)}

							{/* CSV Tab */}
							{importTab === 'csv' && (
								<div className="space-y-3">
									<div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
										<p className="font-semibold text-slate-700">รูปแบบ CSV ที่รองรับ:</p>
										<p>- ต้องมี header row บรรทัดแรก</p>
										<p>
											- คอลัมน์:{' '}
											<code className="rounded bg-slate-200 px-1">
												tracking / barcode / เลขพัสดุ
											</code>{' '}
											และ{' '}
											<code className="rounded bg-slate-200 px-1">
												name / ชื่อ / receiver
											</code>
										</p>
									</div>
									<div
										onClick={() => csvInputRef.current?.click()}
										className="cursor-pointer rounded-2xl border-2 border-dashed border-purple-300 p-12 text-center transition-all hover:border-purple-500 group"
									>
										<svg className="mx-auto mb-3 h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
										</svg>
										<p className="font-semibold text-slate-900">คลิกเพื่ออัปโหลด CSV</p>
										<p className="mt-1 text-sm text-slate-500">.csv / .tsv / .txt</p>
									</div>
									<input
										ref={csvInputRef}
										type="file"
										accept=".csv,.tsv,.txt"
										className="hidden"
										onChange={handleCSVFile}
									/>
								</div>
							)}

							{/* Results Table */}
							{parsed.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<h4 className="font-bold text-slate-900">
											ผลการวิเคราะห์ ({parsed.length} รายการ)
										</h4>
										<div className="flex gap-3 text-sm">
											<span className="font-bold text-emerald-600">
												{parsed.filter((p) => p.orderId !== null).length} match
											</span>
											<span className="font-bold text-red-500">
												{parsed.filter((p) => p.orderId === null).length} ไม่พบ
											</span>
										</div>
									</div>
									<div className="max-h-72 overflow-auto rounded-2xl border border-slate-200">
										<table className="w-full text-sm">
											<thead>
												<tr className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
													<th className="px-4 py-3 text-left">สถานะ</th>
													<th className="px-4 py-3 text-left">เลขพัสดุ</th>
													<th className="px-4 py-3 text-left">ชื่อจากขนส่ง</th>
													<th className="px-4 py-3 text-left">ออเดอร์</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{parsed.map((p, i) => (
													<tr
														key={i}
														className={
															p.orderId ? 'bg-emerald-50' : 'bg-red-50'
														}
													>
														<td className="px-4 py-3">
															{p.orderId ? (
																<span className="text-xs font-bold text-emerald-600">
																	Match
																</span>
															) : (
																<span className="text-xs font-bold text-red-500">
																	ไม่พบ
																</span>
															)}
														</td>
														<td className="px-4 py-3 font-mono text-xs text-slate-900">
															{p.tracking}
														</td>
														<td className="px-4 py-3 text-xs text-slate-600">
															{p.name || '-'}
														</td>
														<td className="px-4 py-3">
															{p.orderId ? (
																<span className="text-xs text-slate-900">
																	#{p.orderId}{' '}
																	<span className="text-slate-400">
																		({p.orderName})
																	</span>
																</span>
															) : (
																<input
																	type="number"
																	placeholder="Order ID"
																	className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-purple-500"
																	onChange={(e) => {
																		const id = parseInt(e.target.value);
																		setParsed((prev) =>
																			prev.map((r, ri) =>
																				ri === i
																					? {
																							...r,
																							orderId: isNaN(id)
																								? null
																								: id,
																						}
																					: r
																			)
																		);
																	}}
																/>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									<p className="text-xs text-blue-600">
										รายการที่ไม่พบ สามารถใส่ Order ID ด้วยตัวเองในช่องขวา
									</p>
								</div>
							)}
						</div>

						{/* Footer */}
						{parsed.length > 0 && (
							<div className="flex gap-3 border-t border-slate-100 p-6">
								<button
									onClick={() => {
										setShowImport(false);
										setOcrImages([]);
										setParsed([]);
									}}
									className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200"
								>
									ยกเลิก
								</button>
								<button
									onClick={handleImportConfirm}
									disabled={
										importing ||
										parsed.filter((p) => p.orderId !== null).length === 0
									}
									className="flex-1 rounded-xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
								>
									{importing
										? 'กำลังนำเข้า...'
										: `นำเข้า ${parsed.filter((p) => p.orderId !== null).length} รายการ`}
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
