'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState, type FormEvent } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function RegisterPage() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2>(1);
	const [otpPhone, setOtpPhone] = useState('');
	const [otpToken, setOtpToken] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState('');
	const [otpSending, setOtpSending] = useState(false);
	const [otpVerifying, setOtpVerifying] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [otpAuthorized, setOtpAuthorized] = useState(false);
	const [isExistingMember, setIsExistingMember] = useState<boolean | null>(null);

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [successOpen, setSuccessOpen] = useState(false);

	useEffect(() => {
		if (!successOpen) return;
		const timerId = setTimeout(async () => {
			try {
				const nextAuth = await signIn('server-cookie', { redirect: false });
				if (!nextAuth || nextAuth.error) throw new Error('สร้างเซสชันไม่สำเร็จ');
				router.push('/courses');
				router.refresh();
			} catch {
				// Fallback: if session sync fails, send user to login.
				router.push('/login');
				router.refresh();
			}
		}, 3000);
		return () => clearTimeout(timerId);
	}, [successOpen, router]);

	function inputClassName(state?: 'error' | 'success') {
		const base =
			'mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2';
		if (state === 'success') return `${base} border-green-600 ring-green-600`;
		if (state === 'error') return `${base} border-red-600 ring-red-600`;
		return `${base}`;
	}

	async function requestOtp() {
		setOtpError(null);
		setOtpToken(null);
		setOtpAuthorized(false);
		setIsExistingMember(null);
		const phoneValue = otpPhone.trim();
		if (!phoneValue) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return;
		}
		setOtpSending(true);
		try {
			const res = await fetch(`${apiBase()}/auth/request-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phoneValue }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok) throw new Error(json?.error || 'ส่ง OTP ไม่สำเร็จ');
			const token = String(json?.token || '').trim();
			if (!token) throw new Error('OTP token ไม่ถูกต้อง');
			setOtpToken(token);
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'ส่ง OTP ไม่สำเร็จ');
		} finally {
			setOtpSending(false);
		}
	}

	async function verifyOtp() {
		setOtpError(null);
		const phoneValue = otpPhone.trim();
		const code = otpCode.trim();
		if (!phoneValue) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return;
		}
		if (!otpToken) {
			setOtpError('กรุณากดส่ง OTP ก่อน');
			return;
		}
		if (!code) {
			setOtpError('กรุณากรอกรหัส OTP');
			return;
		}

		setOtpVerifying(true);
		try {
			const res = await fetch(`${apiBase()}/auth/verify-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phoneValue, token: otpToken, otp_code: code }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok) throw new Error(json?.error || 'ยืนยัน OTP ไม่สำเร็จ');
			if (!json?.ok) throw new Error('ยืนยัน OTP ไม่สำเร็จ');

			setOtpAuthorized(true);
			setIsExistingMember(Boolean(json?.existingUser));
			setStep(2);
			setPhone(phoneValue);
			const prefill = json?.prefill;
			if (prefill) {
				if (typeof prefill.usermail === 'string') setEmail(prefill.usermail);
				if (typeof prefill.name === 'string') {
					const raw = String(prefill.name || '').trim().replace(/\s+/g, ' ');
					const parts = raw ? raw.split(' ') : [];
					if (parts.length === 1) setFirstName(parts[0] || '');
					if (parts.length >= 2) {
						setFirstName(parts[0] || '');
						setLastName(parts.slice(1).join(' '));
					}
				}
			}
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'ยืนยัน OTP ไม่สำเร็จ');
		} finally {
			setOtpVerifying(false);
		}
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setEmailError(null);
		setFormError(null);
		setSuccessOpen(false);

		if (!otpAuthorized) {
			setFormError('กรุณายืนยัน OTP ก่อน');
			setStep(1);
			return;
		}

		if (!email.trim() || !phone.trim() || !firstName.trim() || !lastName.trim()) {
			setFormError('กรุณากรอกข้อมูลให้ครบ');
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`${apiBase()}/auth/register-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ firstName, lastName, phone, email }),
			});
			if (res.status === 409) {
				setEmailError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
				return;
			}
			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
				throw new Error(json?.message || json?.error || 'สมัครสมาชิกไม่สำเร็จ');
			}

			setSuccessOpen(true);
			setFirstName('');
			setLastName('');
			setPhone('');
			setEmail('');
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">สมัครสมาชิก</h1>
			<div className="rounded border p-4 text-sm">
				<div className="flex items-center justify-between gap-3">
					<div className="font-medium">ขั้นตอน {step}/2</div>
					{step === 2 ? (
						<button
							type="button"
							className="text-sm underline"
							onClick={() => {
								setStep(1);
								setOtpAuthorized(false);
								setOtpToken(null);
								setOtpCode('');
								setOtpError(null);
								setFormError(null);
							}}
						>
							เปลี่ยนเบอร์โทร
						</button>
					) : null}
				</div>
				{step === 2 && isExistingMember != null ? (
					<div className="mt-1 text-xs text-gray-600">
						{isExistingMember ? 'พบข้อมูลสมาชิกเดิม ระบบกรอกให้อัตโนมัติ (แก้ไขได้)' : 'กรุณากรอกข้อมูลให้ครบเพื่อสมัครสมาชิก'}
					</div>
				) : null}
			</div>
			{successOpen ? (
				<div className="flex items-start justify-between gap-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
					<div>
						<p className="font-medium">สมัครสมาชิกสำเร็จ</p>
						<p className="mt-1 text-green-800/90">ระบบยืนยันเบอร์โทรแล้ว และพร้อมใช้งาน</p>
					</div>
					<button
						type="button"
						onClick={() => setSuccessOpen(false)}
						className="rounded px-2 py-1 text-green-800 hover:bg-green-100"
						aria-label="ปิด"
					>
						×
					</button>
				</div>
			) : null}
			{successOpen ? null : step === 1 ? (
				<div className="max-w-md rounded border p-4">
					<h2 className="text-base font-semibold">ยืนยันเบอร์โทรศัพท์ด้วย OTP</h2>
					<form
						className="mt-3"
						onSubmit={async (e) => {
							e.preventDefault();
							await requestOtp();
						}}
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<label className="text-sm">
								เบอร์โทรศัพท์ *
								<input
									className={inputClassName()}
									type="tel"
									value={otpPhone}
									onChange={(e) => setOtpPhone(e.target.value)}
									autoComplete="tel"
									required
								/>
							</label>
							<div className="flex items-end">
								<button
									type="submit"
									disabled={otpSending}
									className="inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
								>
									{otpSending ? 'กำลังส่ง…' : 'ส่ง OTP'}
								</button>
							</div>
						</div>
					</form>

					{otpToken ? (
						<form
							className="mt-3"
							onSubmit={async (e) => {
								e.preventDefault();
								await verifyOtp();
							}}
						>
							<div className="grid gap-3 sm:grid-cols-2">
								<label className="text-sm">
									รหัส OTP *
									<input
										className={inputClassName()}
										type="text"
										inputMode="numeric"
										value={otpCode}
										onChange={(e) => setOtpCode(e.target.value)}
										autoComplete="one-time-code"
										required
									/>
								</label>
								<div className="flex items-end">
									<button
										type="submit"
										disabled={otpVerifying}
										className="inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
									>
										{otpVerifying ? 'กำลังตรวจสอบ…' : 'ยืนยัน OTP'}
									</button>
								</div>
							</div>
						</form>
					) : null}

					{otpError ? <p className="mt-3 text-sm text-red-600">{otpError}</p> : null}
				</div>
			) : (
				<form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
					<label className="text-sm">
						อีเมล *
						<input
							className={inputClassName(emailError ? 'error' : undefined)}
							type="email"
							required
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setEmailError(null);
							}}
						/>
					</label>
					{emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
					<label className="text-sm">
						เบอร์โทรศัพท์ *
						<input className={inputClassName()} type="tel" required value={phone} readOnly disabled />
					</label>
					<label className="text-sm">
						ชื่อ *
						<input className={inputClassName()} type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
					</label>
					<label className="text-sm">
						นามสกุล *
						<input className={inputClassName()} type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
					</label>
					{formError ? <p className="text-sm text-red-600">{formError}</p> : null}
					<button
						type="submit"
						disabled={loading}
						className="inline-flex items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					>
						{loading ? (
							<>
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
								กำลังสมัคร…
							</>
						) : (
							'สมัครสมาชิก'
						)}
					</button>
				</form>
			)}
			<div className="max-w-md">
				<div className="relative my-2 flex items-center">
					<div className="flex-grow border-t" />
					<span className="mx-3 text-xs text-gray-400">หรือ</span>
					<div className="flex-grow border-t" />
				</div>
				<a
					href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/auth/line/start?returnPath=${encodeURIComponent('/dashboard')}`}
					className="flex w-full items-center justify-center gap-2 rounded bg-[#06C755] px-4 py-2.5 text-white font-medium hover:bg-[#05b34d] transition-colors"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.21 3.74 7.74 8.79 8.4.34.07.81.23.93.52.1.27.07.68.03.95l-.15.91c-.05.27-.22 1.07.93.58 1.16-.49 6.24-3.67 8.52-6.29C22.94 13.38 22 11.03 22 10.5 22 5.82 17.52 2 12 2z" />
					</svg>
					สมัครสมาชิกด้วย LINE
				</a>
			</div>

			<div className="text-sm text-gray-600">
				มีบัญชีอยู่แล้ว?{' '}
				<Link className="underline" href="/login">
					เข้าสู่ระบบ
				</Link>
			</div>
		</div>
	);
}
