'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

/**
 * /auth/line/complete
 *
 * Shown when LINE Login did not provide an email address.
 * User must enter email (+ optionally phone) to complete registration.
 * The LINE profile info is stored in the `oc_line_pending` cookie on the backend.
 */
function LineCompleteInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnPath = searchParams.get('returnPath') || '/courses';

	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		const trimmedEmail = email.trim();
		if (!trimmedEmail || !trimmedEmail.includes('@')) {
			setError('กรุณากรอกอีเมลให้ถูกต้อง');
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`${apiBase()}/auth/line/complete-registration`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: trimmedEmail, phone: phone.trim() }),
			});

			const json = (await res.json().catch(() => null)) as {
				ok?: boolean;
				error?: string;
				message?: string;
			} | null;

			if (!res.ok || !json?.ok) {
				const msg =
					json?.message ||
					json?.error ||
					'สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่';
				throw new Error(msg);
			}

			// Sync NextAuth session
			try {
				await signIn('server-cookie', { redirect: false });
			} catch {
				// oc_auth cookie is set, login will still work on next page load
			}

			router.replace(returnPath);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">เข้าสู่ระบบด้วย LINE - กรอกข้อมูลเพิ่มเติม</h1>
			<p className="text-sm text-gray-600">
				บัญชี LINE ของคุณไม่มีอีเมล กรุณากรอกข้อมูลด้านล่างเพื่อสร้างบัญชีหรือเชื่อมต่อกับบัญชีเดิม
			</p>

			<form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4 rounded border p-4">
				<label className="text-sm">
					อีเมล *
					<input
						className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						placeholder="email@example.com"
					/>
				</label>

				<label className="text-sm">
					เบอร์โทรศัพท์
					<input
						className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2"
						type="tel"
                        required
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						autoComplete="tel"
						placeholder="0812345678"
					/>
				</label>

				{error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}

				<button
					type="submit"
					disabled={loading}
					className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
				>
					{loading ? 'กำลังดำเนินการ…' : 'ยืนยัน'}
				</button>
			</form>

			<div className="text-sm">
				<Link className="underline" href="/login">
					กลับไปหน้าเข้าสู่ระบบ
				</Link>
			</div>
		</div>
	);
}

export default function LineCompletePage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
					<p className="text-sm text-gray-500">กำลังโหลด…</p>
				</div>
			}
		>
			<LineCompleteInner />
		</Suspense>
	);
}
