'use client';

import Link from 'next/link';

export default function ResetPasswordPage() {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
			<h1 className="text-2xl font-semibold">รีเซ็ตรหัสผ่าน</h1>
			<div className="max-w-md rounded border p-4 text-sm">
				<p className="font-medium">ระบบรีเซ็ตรหัสผ่านถูกยกเลิกแล้ว</p>
				<p className="mt-1 text-gray-700">ปัจจุบันเข้าสู่ระบบด้วย OTP และสามารถขอลิงก์เปลี่ยนเบอร์ได้จากหน้านี้</p>
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
