'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

type VerifyState =
	| { status: 'verifying' }
	| { status: 'success' }
	| { status: 'error'; message: string };

export default function VerifyClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

	const [state, setState] = useState<VerifyState>({ status: 'verifying' });

	useEffect(() => {
		let cancelled = false;

		async function run() {
			if (!token) {
				setState({ status: 'error', message: 'โทเค็นไม่ถูกต้องหรือหมดอายุ' });
				return;
			}

			setState({ status: 'verifying' });
			try {
				const res = await fetch(`${apiBase()}/auth/verify-email?token=${encodeURIComponent(token)}`, {
					method: 'GET',
					cache: 'no-store',
				});
				if (!res.ok) {
					const json = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
					throw new Error(json?.error || json?.message || 'โทเค็นไม่ถูกต้องหรือหมดอายุ');
				}

				if (cancelled) return;
				setState({ status: 'success' });

				setTimeout(() => {
					router.push('/login');
					router.refresh();
				}, 3000);
			} catch (err) {
				if (cancelled) return;
				setState({
					status: 'error',
					message: err instanceof Error ? err.message : 'โทเค็นไม่ถูกต้องหรือหมดอายุ',
				});
			}
		}

		run();
		return () => {
			cancelled = true;
		};
	}, [router, token]);

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">ยืนยันอีเมล</h1>

			{state.status === 'verifying' ? (
				<div className="flex items-center gap-3 text-sm text-gray-700">
					<span
						className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent"
						aria-hidden="true"
					/>
					กำลังยืนยัน…
				</div>
			) : state.status === 'success' ? (
				<div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
					<p className="font-medium">ยืนยันบัญชีเรียบร้อย! กำลังพาไปหน้าเข้าสู่ระบบ…</p>
					<p className="mt-1">
						หากไม่ถูกเปลี่ยนหน้าอัตโนมัติ ให้{' '}
						<Link className="underline" href="/login">
							คลิกที่นี่เพื่อเข้าสู่ระบบ
						</Link>
						.
					</p>
				</div>
			) : (
				<div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					<p className="font-medium">{state.message || 'โทเค็นไม่ถูกต้องหรือหมดอายุ'}</p>
					<p className="mt-1">คุณสามารถลองสมัครสมาชิกใหม่ หรือขอลิงก์ยืนยันใหม่ได้</p>
					<div className="mt-3 flex gap-2">
						<Link className="rounded border border-red-200 bg-white px-3 py-1.5" href="/register">
							ไปหน้าสมัครสมาชิก
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
