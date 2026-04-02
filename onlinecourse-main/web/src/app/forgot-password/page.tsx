'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">ลืมรหัสผ่าน</h1>
			<div className="max-w-md rounded border p-4 text-sm">
				<p className="font-medium">ระบบเข้าสู่ระบบถูกเปลี่ยนเป็น OTP แล้ว</p>
				<p className="mt-1 text-gray-700">
					หากต้องการเปลี่ยนเบอร์โทร ให้ขอลิงก์เปลี่ยนเบอร์จากหน้านี้
				</p>
				<p className="mt-2">
					<Link className="underline" href="/auth/phone-change-request">
						ไปหน้าขอลิงก์เปลี่ยนเบอร์
					</Link>
				</p>
			</div>
			<div className="text-sm">
				<Link className="underline" href="/login">
					กลับไปหน้าเข้าสู่ระบบ
				</Link>
			</div>
		</div>
	);
}
