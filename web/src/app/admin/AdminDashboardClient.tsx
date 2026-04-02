'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function AdminDashboardClient({ email }: { email?: string }) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function logout() {
		setError(null);
		setBusy(true);
		try {
			const res = await fetch(`${apiBase()}/admin/logout`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('ออกจากระบบไม่สำเร็จ');
			router.replace('/');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'ออกจากระบบไม่สำเร็จ');
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl p-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">แดชบอร์ดแอดมิน</h1>
					<p className="mt-1 text-sm text-slate-600">เข้าสู่ระบบแล้ว{email ? `: ${email}` : ''}</p>
				</div>
				<button
					type="button"
					onClick={logout}
					disabled={busy}
					className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
				>
					{busy ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
				</button>
			</div>

			{error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

			<div className="mt-8 grid gap-4">
				<Link
					href="/admin/courses"
					className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
				>
					<div className="text-sm font-semibold text-slate-900">คอร์สเรียน</div>
					<div className="mt-1 text-sm text-slate-600">ดูและแก้ไขคอร์สทั้งหมด</div>
				</Link>
				<Link
					href="/builder"
					className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
				>
					<div className="text-sm font-semibold text-slate-900">ตัวสร้างคอร์ส</div>
					<div className="mt-1 text-sm text-slate-600">สร้างหรือแก้ไขคอร์ส</div>
				</Link>
				<Link
					href="/admin/shipping"
					className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
				>
					<div className="text-sm font-semibold text-slate-900">จัดการการส่งหนังสือ</div>
					<div className="mt-1 text-sm text-slate-600">ปริ้นสลิป นำเข้าเลขพัสดุ (OCR/CSV) ติดตามสถานะจัดส่ง</div>
				</Link>
				<Link
					href="/admin/openplatform"
					className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
				>
					<div className="text-sm font-semibold text-slate-900">J&T Express Open Platform</div>
					<div className="mt-1 text-sm text-slate-600">สร้างพัสดุ ออก Bill Code ติดตาม Tracking ผ่าน J&T API</div>
				</Link>
				<Link
					href="/import"
					className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
				>
					<div className="text-sm font-semibold text-slate-900">นำเข้า WordPress JSON</div>
					<div className="mt-1 text-sm text-slate-600">นำไฟล์ส่งออกจาก WordPress เข้า MySQL</div>
				</Link>
			</div>
		</div>
	);
}
