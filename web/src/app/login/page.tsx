'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';

function normalizePhoneInput(value: string) {
	let raw = String(value || '').trim();
	if (!raw) return '';
	// Allow user to type separators, but keep only digits/+.
	raw = raw.replace(/[^0-9+]/g, '');
	if (raw.startsWith('+')) raw = raw.slice(1);
	// Convert Thailand country code to local format.
	if (raw.startsWith('66') && raw.length >= 11) raw = `0${raw.slice(2)}`;
	// Final digits only.
	raw = raw.replace(/\D/g, '');
	return raw;
}

function isThaiPhone10Digits(value: string) {
	return /^0\d{9}$/.test(String(value || ''));
}

function looksLikeEmail(value: string) {
	const v = String(value || '').trim().toLowerCase();
	return v.length >= 3 && v.includes('@') && v.includes('.');
}

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

function isUserNotFoundResponse(res: Response, json: any) {
	const code = typeof json?.code === 'string' ? json.code : null;
	const error = typeof json?.error === 'string' ? json.error : null;
	return res.status === 404 && (code === 'user_not_found' || error === 'user_not_found');
}

function otpErrorMessageFromResponse(res: Response, json: any, fallback: string) {
	const code = typeof json?.code === 'string' ? json.code : null;
	const serverError = typeof json?.error === 'string' ? json.error : null;

	if (res.status === 429 && code === 'otp_rate_limited') {
		const retryAfterSeconds = Number(json?.retryAfterSeconds);
		if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
			return `คุณส่ง OTP ไปแล้ว กรุณารอ ${Math.ceil(retryAfterSeconds)} วินาที แล้วลองใหม่อีกครั้ง`;
		}
		return 'คุณส่ง OTP ไปแล้ว กรุณารอสักครู่ แล้วลองใหม่อีกครั้ง';
	}

	if (res.status === 404 && code === 'user_not_found') {
		return 'ไม่พบผู้ใช้นี้ กรุณาสมัครสมาชิก';
	}

	if (res.status === 400 && (code === 'otp_invalid' || code === 'otp_expired' || code === 'otp_invalid_or_expired')) {
		// Prefer server message (already localized) but keep safe fallback.
		return serverError || (code === 'otp_expired'
			? 'รหัส OTP หมดอายุ กรุณาขอรหัสใหม่แล้วลองอีกครั้ง'
			: code === 'otp_invalid'
				? 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
				: 'รหัส OTP ไม่ถูกต้อง หรือหมดอายุ กรุณาขอรหัสใหม่แล้วลองอีกครั้ง');
	}

	return serverError || fallback;
}

export default function LoginPage() {
	const router = useRouter();
	const [identifier, setIdentifier] = useState('');
	const [identifierMode, setIdentifierMode] = useState<'phone_otp' | 'email_phone' | null>(null);
	const [identifierError, setIdentifierError] = useState<string | null>(null);
	const [step, setStep] = useState<1 | 2>(1);
	const [phone, setPhone] = useState('');
	const [otpToken, setOtpToken] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState('');
	const [resendAvailableAtMs, setResendAvailableAtMs] = useState<number | null>(null);
	const [, setTick] = useState(0);
	const [otpSending, setOtpSending] = useState(false);
	const [otpVerifying, setOtpVerifying] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [offerEmailLogin, setOfferEmailLogin] = useState(false);

	const [email, setEmail] = useState('');
	const [emailPhone, setEmailPhone] = useState('');
	const [emailSubmitting, setEmailSubmitting] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!resendAvailableAtMs) return;
		const id = setInterval(() => setTick((v) => v + 1), 250);
		return () => clearInterval(id);
	}, [resendAvailableAtMs]);

	const resendRemainingSeconds = resendAvailableAtMs
		? Math.max(0, Math.ceil((resendAvailableAtMs - Date.now()) / 1000))
		: 0;

	function resetAll() {
		setIdentifierMode(null);
		setIdentifierError(null);
		setStep(1);
		setPhone('');
		setOtpToken(null);
		setOtpCode('');
		setOtpError(null);
		setOfferEmailLogin(false);
		setResendAvailableAtMs(null);
		setEmail('');
		setEmailPhone('');
		setEmailError(null);
	}

	async function continueWithIdentifier() {
		setIdentifierError(null);
		setOtpError(null);
		setEmailError(null);
		setOfferEmailLogin(false);
		setResendAvailableAtMs(null);
		setOtpToken(null);
		setOtpCode('');
		setStep(1);

		const raw = identifier.trim();
		if (!raw) {
			setIdentifierError('กรุณากรอกเบอร์โทรศัพท์ หรืออีเมล');
			return;
		}

		const normalizedPhone = normalizePhoneInput(raw);
		if (isThaiPhone10Digits(normalizedPhone) && !looksLikeEmail(raw)) {
			setIdentifierMode('phone_otp');
			setPhone(normalizedPhone);
			return;
		}

		if (looksLikeEmail(raw)) {
			setIdentifierMode('email_phone');
			setEmail(raw.toLowerCase());
			return;
		}

		setIdentifierError('รูปแบบไม่ถูกต้อง: เบอร์ต้อง 10 หลักขึ้นต้นด้วย 0 หรือเป็นอีเมลที่ถูกต้อง');
	}

	async function requestOtp() {
		setOtpError(null);
		setOfferEmailLogin(false);
		setOtpToken(null);
		setOtpCode('');
		const phoneValue = normalizePhoneInput(phone);
		if (!phoneValue) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return null;
		}
		if (!isThaiPhone10Digits(phoneValue)) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return null;
		}
		setPhone(phoneValue);
		setOtpSending(true);
		try {
			const res = await fetch(`${apiBase()}/auth/login/request-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phoneValue }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok) {
				if (res.status === 429 && json?.code === 'otp_rate_limited') {
					const retryAfterSeconds = Number(json?.retryAfterSeconds);
					if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
						setResendAvailableAtMs(Date.now() + Math.ceil(retryAfterSeconds) * 1000);
					}
				}
				throw new Error(otpErrorMessageFromResponse(res, json, 'ส่ง OTP ไม่สำเร็จ'));
			}
			const token = String(json?.token || '').trim();
			if (!token) throw new Error('OTP token ไม่ถูกต้อง');
			const cooldownSeconds = Number(json?.cooldownSeconds);
			if (Number.isFinite(cooldownSeconds) && cooldownSeconds > 0) {
				setResendAvailableAtMs(Date.now() + Math.ceil(cooldownSeconds) * 1000);
			} else {
				// Fallback to first cooldown window when server doesn't send it.
				setResendAvailableAtMs(Date.now() + 60 * 1000);
			}
			setOtpToken(token);
			return token;
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'ส่ง OTP ไม่สำเร็จ');
			return null;
		} finally {
			setOtpSending(false);
		}
	}

	async function verifyAndLogin() {
		setOtpError(null);
		setOfferEmailLogin(false);
		const phoneValue = normalizePhoneInput(phone);
		const code = otpCode.trim();
		if (!phoneValue) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return;
		}
		if (!isThaiPhone10Digits(phoneValue)) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}
		setPhone(phoneValue);
		if (!otpToken) {
			setOtpError('กรุณากดส่ง OTP ก่อน');
			return;
		}
		if (!code) {
			setOtpError('กรุณากรอกรหัส OTP');
			return;
		}

		setOtpVerifying(true);
		setLoading(true);
		try {
			// 1) Verify OTP (sets OTP cookie)
			const verifyRes = await fetch(`${apiBase()}/auth/login/verify-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phoneValue, token: otpToken, otp_code: code }),
			});
			const verifyJson = (await verifyRes.json().catch(() => null)) as any;
			if (!verifyRes.ok || !verifyJson?.ok) {
				if (isUserNotFoundResponse(verifyRes, verifyJson)) {
					setOfferEmailLogin(true);
				}
				throw new Error(otpErrorMessageFromResponse(verifyRes, verifyJson, 'ยืนยัน OTP ไม่สำเร็จ'));
			}

			// 2) Exchange OTP cookie -> auth cookie (server login)
			const loginRes = await fetch(`${apiBase()}/auth/login-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({}),
			});
			const loginJson = (await loginRes.json().catch(() => null)) as { error?: string } | null;
			if (!loginRes.ok) {
				if (loginRes.status === 401 && loginJson?.error === 'otp_required') {
					throw new Error(
						'ไม่พบการยืนยัน OTP (อาจเกิดจาก cookie ถูกบล็อก) ลองกดยืนยัน OTP ใหม่อีกครั้ง หรือถ้าเปิดเว็บด้วย 127.0.0.1 ให้ลองเปิดด้วย http://localhost:3000'
					);
				}
				if (loginRes.status === 404 && loginJson?.error === 'user_not_found') {
					setOfferEmailLogin(true);
					throw new Error('ไม่พบผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน');
				}
				throw new Error(loginJson?.error || 'เข้าสู่ระบบไม่สำเร็จ');
			}

			// 3) Sync NextAuth session from server cookie
			const nextAuth = await signIn('server-cookie', { redirect: false });
			if (!nextAuth || nextAuth.error) throw new Error('สร้างเซสชันไม่สำเร็จ');

			router.push('/');
			router.refresh();
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
		} finally {
			setLoading(false);
			setOtpVerifying(false);
		}
	}

	async function loginWithEmailPhone() {
		setEmailError(null);
		const emailValue = String(email || '').trim().toLowerCase();
		const phoneValue = normalizePhoneInput(emailPhone);
		if (!emailValue || !looksLikeEmail(emailValue)) {
			setEmailError('กรุณากรอกอีเมลให้ถูกต้อง');
			return;
		}
		if (!phoneValue || !isThaiPhone10Digits(phoneValue)) {
			setEmailError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}
		setEmailPhone(phoneValue);

		setEmailSubmitting(true);
		setLoading(true);
		try {
			const res = await fetch(`${apiBase()}/auth/login-email-phone`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: emailValue, phone_number: phoneValue }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok || !json?.ok) {
				const serverError = typeof json?.error === 'string' ? json.error : null;
				if (res.status === 401 && serverError === 'invalid credentials') {
					throw new Error('อีเมลหรือเบอร์โทรศัพท์ไม่ถูกต้อง');
				}
				if (res.status === 403 && serverError === 'phone_not_set') {
					throw new Error('บัญชีนี้ยังไม่มีเบอร์โทรศัพท์ในระบบ กรุณาติดต่อแอดมินเพื่อผูกเบอร์');
				}
				throw new Error(serverError || 'เข้าสู่ระบบไม่สำเร็จ');
			}

			const nextAuth = await signIn('server-cookie', { redirect: false });
			if (!nextAuth || nextAuth.error) throw new Error('สร้างเซสชันไม่สำเร็จ');
			router.push('/');
			router.refresh();
		} catch (err) {
			setEmailError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
		} finally {
			setLoading(false);
			setEmailSubmitting(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
			
			<div className="max-w-md">
				<a
					href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/auth/line/start?returnPath=${encodeURIComponent('/dashboard')}`}
					className="flex w-full items-center justify-center gap-2 rounded bg-[#06C755] px-4 py-2.5 text-white font-medium hover:bg-[#05b34d] transition-colors"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.21 3.74 7.74 8.79 8.4.34.07.81.23.93.52.1.27.07.68.03.95l-.15.91c-.05.27-.22 1.07.93.58 1.16-.49 6.24-3.67 8.52-6.29C22.94 13.38 22 11.03 22 10.5 22 5.82 17.52 2 12 2z" />
					</svg>
					เข้าสู่ระบบด้วย LINE
				</a>
				<div className="relative my-2 flex items-center">
					<div className="flex-grow border-t" />
					<span className="mx-3 text-xs text-gray-400">หรือ</span>
					<div className="flex-grow border-t" />
				</div>
			</div>

			<form
				className="max-w-md"
				onSubmit={(e) => {
					e.preventDefault();
					void continueWithIdentifier();
				}}
			>
				<div className="flex items-center justify-between gap-3">
					{/* <h2 className="text-base font-semibold">ยืนยันตัวตน</h2> */}
					{identifierMode ? (
						<button
							type="button"
							className="text-sm underline"
							onClick={() => {
								resetAll();
							}}
						>
							เปลี่ยนข้อมูล
						</button>
					) : null}
				</div>
				<label className="mt-3 block text-sm">
					อีเมลหรือ เบอร์โทรศัพท์ *
					<input
						className="mt-1 w-full rounded border px-3 py-2"
						type="text"
						required
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						autoComplete="username"
					/>
				</label>
				<button
					type="submit"
					disabled={loading}
					className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
				>
					ถัดไป
				</button>
				{identifierError ? <p className="mt-3 text-sm text-red-600 font-bold">{identifierError}</p> : null}
			</form>

			{identifierMode === 'email_phone' ? (
				<form
					className="max-w-md rounded border p-4"
					onSubmit={(e) => {
						e.preventDefault();
						void loginWithEmailPhone();
					}}
				>
					<h2 className="text-base font-semibold">เข้าด้วยอีเมล</h2>
					<p className="mt-1 text-sm text-slate-700">กรอกเบอร์โทรศัพท์แทนรหัสผ่าน</p>
					<label className="mt-3 block text-sm">
						อีเมล
						<input className="mt-1 w-full rounded border px-3 py-2" type="email" value={email} readOnly disabled />
					</label>
					<label className="mt-3 block text-sm">
						เบอร์โทรศัพท์ (ใช้แทนรหัสผ่าน) *
						<input
							className="mt-1 w-full rounded border px-3 py-2"
							type="tel"
							required
							value={emailPhone}
							onChange={(e) => setEmailPhone(e.target.value)}
							autoComplete="tel"
						/>
					</label>
					<button
						type="submit"
						disabled={emailSubmitting || loading}
						className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					>
						{emailSubmitting || loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
					</button>
					{emailError ? <p className="mt-3 text-sm text-red-600 font-bold">{emailError}</p> : null}
				</form>
			) : null}

			{identifierMode === 'phone_otp' ? (
				<>
					<div className="rounded border p-4 text-sm max-w-md">
						<div className="flex items-center justify-between gap-3">
							<div className="font-medium">ขั้นตอน {step}/2</div>
							{step === 2 ? (
								<button
									type="button"
									className="text-sm underline"
									onClick={() => {
										setStep(1);
										setOtpToken(null);
										setOtpCode('');
										setOtpError(null);
										setOfferEmailLogin(false);
									}}
								>
									เปลี่ยนเบอร์โทรรับ OTP
								</button>
							) : null}
						</div>
					</div>

					{step === 1 ? (
						<form
							className="max-w-md rounded border p-4"
							onSubmit={async (e) => {
								e.preventDefault();
								const token = await requestOtp();
								if (token) setStep(2);
							}}
						>
							<h2 className="text-base font-semibold">ยืนยันเบอร์โทรศัพท์ด้วย OTP</h2>
							<div className="mt-3 grid gap-3 sm:grid-cols-2">
								<label className="text-sm">
									เบอร์โทรศัพท์ *
									<input
										className="mt-1 w-full rounded border px-3 py-2"
										type="tel"
										required
										value={phone}
										onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
										autoComplete="tel"
									/>
								</label>
								<div className="flex items-end">
									<button
										type="submit"
										disabled={otpSending || loading}
										className="inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
									>
										{otpSending ? 'กำลังส่ง…' : 'ส่ง OTP'}
									</button>
								</div>
							</div>
							{otpError ? <p className="mt-3 text-sm text-red-600 font-bold">{otpError}</p> : null}
							{offerEmailLogin ? (
								<p className="mt-2 text-sm">ไม่พบผู้ใช้นี้ กรุณาสมัครสมาชิก</p>
							) : null}
						</form>
					) : (
						<form
							className="max-w-md rounded border p-4"
							onSubmit={(e) => {
								e.preventDefault();
								void verifyAndLogin();
							}}
						>
							<h2 className="text-base font-semibold">กรอกรหัส OTP</h2>
							<label className="mt-3 block text-sm">
								เบอร์โทรศัพท์
								<input className="mt-1 w-full rounded border px-3 py-2" type="tel" value={phone} readOnly disabled />
							</label>
							<label className="mt-3 block text-sm">
								รหัส OTP *
								<input
									className="mt-1 w-full rounded border px-3 py-2"
									type="text"
									inputMode="numeric"
									required
									value={otpCode}
									onChange={(e) => setOtpCode(e.target.value)}
									autoComplete="one-time-code"
								/>
							</label>
							<div className="mt-4 grid grid-cols-4 gap-3">
								<button
									type="button"
									disabled={otpSending || loading || otpVerifying || resendRemainingSeconds > 0}
									className="col-span-2 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-100"
									onClick={async () => {
										if (otpSending || loading || otpVerifying) return;
										if (resendRemainingSeconds > 0) return;
										const token = await requestOtp();
										if (token) setOtpError(null);
									}}
								>
									{resendRemainingSeconds > 0
										? `ส่งอีกครั้ง (${resendRemainingSeconds}s)`
										: otpSending
											? 'กำลังส่ง…'
											: 'ส่งอีกครั้ง'}
								</button>
								<button
									type="submit"
									disabled={otpVerifying || loading}
									className="col-span-2 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
								>
									{otpVerifying || loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
								</button>
							</div>
							{otpError ? <p className="mt-3 text-sm text-red-600 font-bold">{otpError}</p> : null}
						</form>
					)}
				</>
			) : null}



			<div className="text-sm">
				<Link className="underline" href="/auth/phone-change-request">
					แจ้งขอเปลี่ยนเบอร์โทร
				</Link>
			</div>
			{/* <div className="text-sm text-gray-600">
				ยังไม่มีบัญชี?{' '}
				<Link className="underline" href="/register">
					สมัครสมาชิก
				</Link>
			</div> */}
		</div>
		);
	}
