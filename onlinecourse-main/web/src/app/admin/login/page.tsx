'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function AdminLoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const next = searchParams.get('next') || '/admin';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			const res = await fetch(`${apiBase()}/admin/login`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password }),
			});
			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as { error?: string } | null;
				throw new Error(json?.error || 'เข้าสู่ระบบไม่สำเร็จ');
			}
			router.replace(next);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
			<div>
				<h1 className="text-2xl font-semibold">เข้าสู่ระบบแอดมิน</h1>
				<p className="mt-2 text-sm text-slate-600">เข้าสู่ระบบเพื่อเข้าใช้งานแดชบอร์ดแอดมิน</p>
			</div>

			<form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<label className="grid gap-1 text-sm">
					<span className="font-medium text-slate-700">อีเมล</span>
					<input
						className="rounded-lg border border-slate-200 px-3 py-2"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>

				<label className="grid gap-1 text-sm">
					<span className="font-medium text-slate-700">รหัสผ่าน</span>
					<input
						className="rounded-lg border border-slate-200 px-3 py-2"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>

				<button
					type="submit"
					disabled={busy}
					className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
				>
					{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
				</button>

				{error ? <div className="text-sm text-red-600">{error}</div> : null}
			</form>
		</div>
	);
}
