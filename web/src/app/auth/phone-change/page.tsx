'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function PhoneChangePage() {
	const router = useRouter();
	const search = useSearchParams();
	const token = search.get('token') || '';
	const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState<string>('');
	const [newPhone, setNewPhone] = useState('');
	const [confirmPhone, setConfirmPhone] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!token) {
				setStatus('error');
				setMessage('ลิงก์ไม่ถูกต้อง');
				return;
			}
			setStatus('loading');
			setMessage('กำลังยืนยัน…');
			try {
				const res = await fetch(`${apiBase()}/auth/verify-phone-change?token=${encodeURIComponent(token)}`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				});
				const json = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
				if (!res.ok || !json?.ok) {
					throw new Error(json?.error || 'ยืนยันไม่สำเร็จ');
				}
				if (cancelled) return;
				setStatus('ready');
				setMessage('');
			} catch (err) {
				if (cancelled) return;
				setStatus('error');
				setMessage(err instanceof Error ? err.message : 'ยืนยันไม่สำเร็จ');
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!token) {
			setStatus('error');
			setMessage('ลิงก์ไม่ถูกต้อง');
			return;
		}
		const a = newPhone.trim();
		const b = confirmPhone.trim();
		if (!a || !b) {
			setStatus('error');
			setMessage('กรุณากรอกเบอร์ใหม่ และยืนยันเบอร์');
			return;
		}
		if (a !== b) {
			setStatus('error');
			setMessage('เบอร์โทรไม่ตรงกัน');
			return;
		}
		setSaving(true);
		try {
			const res = await fetch(`${apiBase()}/auth/confirm-phone-change`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ token, new_phone: a }),
			});
			const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
			if (!res.ok || !json?.ok) {
				if (res.status === 409 && json?.error === 'phone_already_used') {
					throw new Error('เบอร์นี้ถูกใช้งานแล้ว');
				}
				throw new Error(json?.error || 'บันทึกไม่สำเร็จ');
			}
			setStatus('success');
			setMessage('เปลี่ยนเบอร์โทรสำเร็จ');
			router.push('/login');
			router.refresh();
		} catch (err) {
			setStatus('error');
			setMessage(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl flex-col justify-center gap-4 p-8">
			<h1 className="text-2xl font-semibold">เปลี่ยนเบอร์โทร</h1>
			<div className="rounded border p-4 text-sm">
				{status === 'loading' ? <p>{message || 'กำลังโหลด…'}</p> : null}
				{status === 'success' ? <p className="text-green-700">{message}</p> : null}
				{status === 'error' ? <p className="text-red-600">{message}</p> : null}
				{status === 'ready' ? (
					<form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
						<label className="text-sm">
							เบอร์ใหม่ *
							<input
								className="mt-1 w-full rounded border px-3 py-2"
								type="tel"
								required
								value={newPhone}
								onChange={(e) => setNewPhone(e.target.value)}
								autoComplete="tel"
							/>
						</label>
						<label className="text-sm">
							ยืนยันเบอร์ใหม่ *
							<input
								className="mt-1 w-full rounded border px-3 py-2"
								type="tel"
								required
								value={confirmPhone}
								onChange={(e) => setConfirmPhone(e.target.value)}
								autoComplete="tel"
							/>
						</label>
						<button
							type="submit"
							disabled={saving}
							className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
						>
							{saving ? 'กำลังบันทึก…' : 'บันทึก'}
						</button>
					</form>
				) : null}
			</div>
			<div className="text-sm">
				<Link className="underline" href="/login">
					กลับไปหน้าเข้าสู่ระบบ
				</Link>
			</div>
		</div>
	);
}
