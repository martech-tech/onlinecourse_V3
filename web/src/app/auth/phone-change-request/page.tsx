'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function PhoneChangeRequestPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [now, setNow] = useState(() => Date.now());
	const [cooldown, setCooldown] = useState<{ attempts: number; nextAllowedAt: number } | null>(null);

	const emailKey = useMemo(() => email.trim().toLowerCase(), [email]);
	const storageKey = useMemo(() => {
		if (!emailKey) return null;
		return `phone-change-request-cooldown:${emailKey}`;
	}, [emailKey]);

	const cooldownMs = useMemo(() => {
		if (!cooldown) return 0;
		return Math.max(0, cooldown.nextAllowedAt - now);
	}, [cooldown, now]);

	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!storageKey) {
			setCooldown(null);
			return;
		}
		try {
			const raw = window.localStorage.getItem(storageKey);
			if (!raw) {
				setCooldown(null);
				return;
			}
			const parsed = JSON.parse(raw) as { attempts?: unknown; nextAllowedAt?: unknown };
			const attempts = typeof parsed.attempts === 'number' ? parsed.attempts : 0;
			const nextAllowedAt = typeof parsed.nextAllowedAt === 'number' ? parsed.nextAllowedAt : 0;
			if (!attempts || !nextAllowedAt) {
				setCooldown(null);
				return;
			}
			setCooldown({ attempts, nextAllowedAt });
		} catch {
			setCooldown(null);
		}
	}, [storageKey]);

	function formatDuration(ms: number) {
		const totalSeconds = Math.ceil(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		if (minutes <= 0) return `${seconds} วินาที`;
		return `${minutes} นาที${seconds ? ` ${seconds} วินาที` : ''}`;
	}

	function nextCooldownDelayMs(nextAttempt: number) {
		const scheduleSeconds = [60, 180, 300, 900, 3600];
		const idx = Math.max(0, nextAttempt - 1);
		const seconds = scheduleSeconds[idx] ?? 3600;
		return seconds * 1000;
	}

	function canSendNow() {
		if (!cooldown) return true;
		return Date.now() >= cooldown.nextAllowedAt;
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setDone(false);
		const value = email.trim();
		if (!value) {
			setError('กรุณากรอกอีเมล');
			return;
		}
		if (!canSendNow()) {
			setError(`คุณส่งคำขอไปแล้ว กรุณารอ ${formatDuration(cooldownMs)} แล้วลองใหม่อีกครั้ง`);
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${apiBase()}/auth/request-phone-change`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: value }),
			});
			const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
			if (!res.ok || !json?.ok) {
				if (res.status === 404 && json?.error === 'email_not_found') {
					throw new Error('ไม่พบอีเมลนี้ในระบบ');
				}
				throw new Error(json?.error || 'ส่งอีเมลไม่สำเร็จ');
			}
			setDone(true);
			if (storageKey) {
				const nextAttempt = (cooldown?.attempts ?? 0) + 1;
				const delayMs = nextCooldownDelayMs(nextAttempt);
				const nextAllowedAt = Date.now() + delayMs;
				const nextState = { attempts: nextAttempt, nextAllowedAt };
				try {
					window.localStorage.setItem(storageKey, JSON.stringify(nextState));
				} catch {
					// ignore storage errors
				}
				setCooldown(nextState);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'ส่งอีเมลไม่สำเร็จ');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl flex-col justify-center gap-4 p-8">
			<h1 className="text-2xl font-semibold">ขอลิงก์เปลี่ยนเบอร์โทร</h1>
			<div className="max-w-md rounded border p-4 text-sm">
				<p className="text-gray-700">
					กรอกอีเมลที่เคยลงทะเบียนไว้ ระบบจะส่งลิงก์ไปให้เพื่อไปกรอกเบอร์ใหม่
				</p>
				<p className="mt-2 text-gray-600">
					หากไม่พบอีเมล กรุณาตรวจสอบใน Spam/ถังขยะ
				</p>
				<form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
					<label className="text-sm">
						อีเมล *
						<input
							className="mt-1 w-full rounded border px-3 py-2"
							type="email"
							required
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setError(null);
							}}
							autoComplete="email"
						/>
					</label>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					{done ? <p className="text-sm text-green-700">ส่งลิงก์แล้ว กรุณาตรวจสอบในกล่องจดหมาย รวมถึง Spam/ถังขยะ</p> : null}
					{cooldownMs > 0 ? (
						<p className="text-xs text-gray-600">สามารถส่งใหม่ได้ใน {formatDuration(cooldownMs)}</p>
					) : null}
					<button
						type="submit"
						disabled={loading || !email.trim() || !canSendNow()}
						className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					>
						{loading ? 'กำลังส่ง…' : 'ส่งลิงก์'}
					</button>
				</form>
			</div>
			<div className="text-sm">
				<Link className="underline" href="/login">
					กลับไปหน้าเข้าสู่ระบบ
				</Link>
			</div>
		</div>
	);
}
