'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function AdminCourseUnlockForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const existing = useMemo(() => searchParams.get('password') || '', [searchParams]);
	const [password, setPassword] = useState(existing);
	const showIncorrect = existing.length > 0;

	return (
		<form
			className="mt-4 grid gap-3 rounded border bg-white p-4"
			onSubmit={(e) => {
				e.preventDefault();
				const qs = new URLSearchParams(searchParams.toString());
				qs.set('password', password);
				router.replace(`?${qs.toString()}`);
			}}
		>
			<label className="grid gap-1 text-sm">
				<span className="font-medium">รหัสผ่านคอร์ส</span>
				<input
					className="w-full rounded border px-3 py-2"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="off"
					placeholder="กรอกรหัสผ่าน"
				/>
			</label>
			{showIncorrect ? <div className="text-sm text-red-600">รหัสผ่านไม่ถูกต้อง</div> : null}
			<button className="w-fit rounded bg-black px-4 py-2 text-sm text-white" type="submit">
				ปลดล็อก
			</button>
		</form>
	);
}
