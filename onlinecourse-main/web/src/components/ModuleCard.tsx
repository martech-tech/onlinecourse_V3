'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Lesson = {
	id: string;
	title: string;
	slug: string;
};

type Module = {
	id: string; // module public id (current API)
	title: string;
	lessons: Lesson[];
};

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function ModuleCard({
	courseSlug,
	enrollmentId,
	module,
	initialUnlocked,
	password,
	onUnlocked,
}: {
	courseSlug: string;
	enrollmentId: string | number;
	module: Module;
	initialUnlocked: boolean;
	password?: string;
	onUnlocked?: (modulePublicId: string) => void;
}) {
	const [unlocked, setUnlocked] = useState<boolean>(initialUnlocked);
	const [busy, setBusy] = useState(false);
	const qs = useMemo(() => (password ? `?password=${encodeURIComponent(password)}` : ''), [password]);

	async function startModule() {
		setBusy(true);
		try {
			const res = await fetch(
				`${apiBase()}/enrollments/${encodeURIComponent(String(enrollmentId))}/modules/${encodeURIComponent(module.id)}/unlock`,
				{
					method: 'POST',
					credentials: 'include',
				}
			);
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'เริ่มโมดูลไม่สำเร็จ');
			}
			setUnlocked(true);
			onUnlocked?.(module.id);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="rounded border">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="font-medium">{module.title}</div>
				{unlocked ? (
					<span className="text-xs text-gray-600">ปลดล็อกแล้ว</span>
				) : (
					<button
						type="button"
						className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
						onClick={startModule}
						disabled={busy}
					>
						{busy ? 'กำลังเริ่ม…' : 'เริ่มโมดูล'}
					</button>
				)}
			</div>

			{unlocked ? (
				<div className="border-t">
					<ul className="divide-y">
						{module.lessons.map((l) => (
							<li key={l.id} className="px-4 py-3">
								<Link href={`/courses/${courseSlug}/lessons/${l.slug}${qs}`}>{l.title}</Link>
							</li>
						))}
					</ul>
				</div>
			) : (
				<div className="border-t px-4 py-3 text-sm text-gray-600">กรุณาเริ่มโมดูลนี้เพื่อดูบทเรียน</div>
			)}
		</div>
	);
}
