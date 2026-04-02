'use client';

import { importWordpressExport } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';

export default function ImportWordpressClient() {
	const [file, setFile] = useState<File | null>(null);
	const [overwrite, setOverwrite] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<{ title: string; slug: string; locked: boolean } | null>(null);

	async function onImport() {
		setError(null);
		setResult(null);
		if (!file) {
			setError('กรุณาเลือกไฟล์ JSON');
			return;
		}

		setBusy(true);
		try {
			const text = await file.text();
			const json = JSON.parse(text);
			const course = await importWordpressExport(json, overwrite);
			setResult(course);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl p-6">
			<h1 className="text-xl font-semibold">นำเข้า WordPress JSON</h1>
			<p className="mt-2 text-sm text-gray-600">อัปโหลดไฟล์ส่งออก เช่น 384.json แล้วนำเข้าไปยัง MySQL</p>

			<div className="mt-6 grid gap-4 rounded border p-4">
				<div>
					<label className="mb-1 block text-sm font-medium">ไฟล์ JSON</label>
					<input
						type="file"
						accept="application/json,.json"
						onChange={(e) => setFile(e.target.files?.[0] || null)}
					/>
				</div>

				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
					เขียนทับคอร์สเดิมที่ใช้ slug เดียวกัน
				</label>

				<button
					className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					disabled={busy}
					type="button"
					onClick={onImport}
				>
					{busy ? 'กำลังนำเข้า…' : 'นำเข้า'}
				</button>

				{error ? <div className="text-sm text-red-600">{error}</div> : null}

				{result ? (
					<div className="rounded border p-3">
						<div className="font-medium">นำเข้าแล้ว: {result.title}</div>
						<div className="mt-1 text-sm text-gray-600">สลัก (slug): {result.slug}</div>
						<div className="mt-3 flex gap-4 text-sm">
							<Link className="underline" href={`/courses/${encodeURIComponent(result.slug)}`}>
								เปิดคอร์ส
							</Link>
							<Link className="underline" href={`/courses/${encodeURIComponent(result.slug)}/edit`}>
								แก้ไขคอร์ส
							</Link>
						</div>
						{result.locked ? (
							<p className="mt-2 text-xs text-gray-600">
								คอร์สนี้ถูกป้องกันด้วยรหัสผ่าน ให้ใส่ <code>?password=...</code> ตอนเปิด/แก้ไข
							</p>
						) : null}
					</div>
				) : null}
			</div>

			<div className="mt-6">
				<Link className="text-sm underline" href="/admin">
					กลับไปหน้าแอดมิน
				</Link>
			</div>
		</div>
	);
}
