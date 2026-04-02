'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

/**
 * /auth/line/callback
 *
 * Landing page after LINE login succeeds on the backend.
 * The backend set the `oc_auth` cookie on Express's origin.
 *
 * Flow:
 * 1. Verify the cookie is valid by calling GET /auth/me with
 *    `credentials:'include'` (browser sends oc_auth to Express).
 * 2. Sync the NextAuth session via signIn('server-cookie').
 * 3. Redirect to returnPath.
 */
function LineCallbackInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnPath = searchParams.get('returnPath') || '/dashboard';
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function syncSession() {
			try {
				// Step 1 — Verify oc_auth is valid (browser sends cookie to Express)
				const meRes = await fetch(`${apiBase()}/auth/me`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				});
				if (!meRes.ok) {
					if (cancelled) return;
					setError('ไม่สามารถยืนยันตัวตนได้ กรุณาลองเข้าสู่ระบบอีกครั้ง');
					return;
				}

				// Step 2 — Sync NextAuth session
				const result = await signIn('server-cookie', { redirect: false });
				if (cancelled) return;

				if (!result || result.error) {
					// oc_auth is valid even if NextAuth sync failed — still redirect
					console.warn('NextAuth signIn returned error, redirecting anyway');
				}

				router.replace(returnPath);
				router.refresh();
			} catch {
				if (cancelled) return;
				setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
			}
		}

		syncSession();
		return () => {
			cancelled = true;
		};
	}, [returnPath, router]);

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col items-center justify-center gap-4 p-8">
			{error ? (
				<div className="rounded border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
					<p className="font-medium">{error}</p>
					<a href="/login" className="mt-2 inline-block underline">
						กลับไปหน้าเข้าสู่ระบบ
					</a>
				</div>
			) : (
				<div className="flex flex-col items-center gap-3 text-sm text-gray-700">
					<span
						className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-transparent"
						aria-hidden="true"
					/>
					<p>กำลังเข้าสู่ระบบ…</p>
				</div>
			)}
		</div>
	);
}

const LoadingSpinner = (
	<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col items-center justify-center gap-4 p-8">
		<div className="flex flex-col items-center gap-3 text-sm text-gray-700">
			<span
				className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-transparent"
				aria-hidden="true"
			/>
			<p>กำลังเข้าสู่ระบบ…</p>
		</div>
	</div>
);

export default function LineCallbackPage() {
	return <Suspense fallback={LoadingSpinner}><LineCallbackInner /></Suspense>;
}
