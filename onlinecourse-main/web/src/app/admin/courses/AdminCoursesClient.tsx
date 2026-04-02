'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { AdminCourseListItem } from '@/lib/types';

function formatPrice(model: 'free' | 'paid', amount?: number, currency?: string) {
	if (model !== 'paid') return 'ฟรี';
	const value = Number(amount || 0);
	const ccy = currency || 'THB';
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: ccy,
			maximumFractionDigits: 0,
		}).format(value);
	} catch {
		return `${value} ${ccy}`;
	}
}

function formatDateTime(value?: string) {
	if (!value) return '';
	const dt = new Date(value);
	if (!Number.isFinite(dt.getTime())) return '';
	const date = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
	const time = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	return `${date} · ${time}`;
}

export default function AdminCoursesClient({ courses }: { courses: AdminCourseListItem[] }) {
	const rows = useMemo(() => (Array.isArray(courses) ? courses : []), [courses]);

	return (
		<div className="mx-auto max-w-6xl p-6">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">คอร์สเรียน</h1>
					<p className="mt-1 text-sm text-slate-600">จัดการคอร์ส (เฉพาะแอดมิน)</p>
				</div>
				<div className="flex items-center gap-2">
					<Link href="/admin" className="rounded border px-3 py-2 text-sm">
						กลับ
					</Link>
					<Link href="/builder" className="rounded bg-black px-3 py-2 text-sm text-white">
						เพิ่มคอร์สใหม่
					</Link>
				</div>
			</div>

			<div className="tutor-table-responsive tutor-dashboard-list-table overflow-x-auto rounded border bg-white">
				<table className="tutor-table tutor-table-middle table-dashboard-course-list w-full">
					<thead className="tutor-text-sm tutor-text-400 border-b text-left text-sm text-slate-600">
						<tr>
							<th className="px-4 py-3" style={{ width: '30%' }}>
								ชื่อคอร์ส
							</th>
							<th className="px-4 py-3" style={{ width: '13%' }}>
								หมวดหมู่
							</th>
							<th className="px-4 py-3" style={{ width: '10%' }}>
								ราคา
							</th>
							<th className="px-4 py-3" style={{ width: '13%' }}>
								สถานะ
							</th>
							<th className="px-4 py-3" style={{ width: '15%' }}>
								อัปเดตล่าสุด
							</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody className="text-sm">
						{rows.map((c) => {
							const priceLabel = formatPrice(c.pricing?.model ?? 'free', c.pricing?.amount, c.pricing?.currency);
							const when = formatDateTime(c.updatedAt || c.createdAt);
							const categories = (c.categories || []).filter(Boolean).join(', ');
							return (
								<tr key={c.id} className="border-b last:border-b-0">
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="h-12 w-16 overflow-hidden rounded bg-slate-100">
												{/* eslint-disable-next-line @next/next/no-img-element */}
												{c.thumbnailUrl ? (
													<img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
												) : null}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<Link href={`/admin/courses/${encodeURIComponent(c.slug)}/edit`} className="tutor-table-link font-medium text-slate-900 hover:underline">
														{c.title}
													</Link>
													{c.visibilityType === 'password' ? (
														<span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">ล็อก</span>
													) : null}
												</div>
												<div className="mt-1 text-xs text-slate-600">
													โมดูล: {c.moduleCount} · บทเรียน: {c.lessonCount}
												</div>
											</div>
										</div>
									</td>
									<td className="px-4 py-3 text-slate-700">
										<div className="line-clamp-2" title={categories}>
											{categories || '—'}
										</div>
									</td>
									<td className="px-4 py-3 text-slate-700">{priceLabel}</td>
									<td className="px-4 py-3 text-slate-700">
										{c.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
									</td>
									<td className="px-4 py-3 text-slate-700">{when || '—'}</td>
									<td className="px-4 py-3">
										<div className="flex justify-end gap-2">
											<Link
												href={`/courses/${encodeURIComponent(c.slug)}`}
												className="rounded border px-3 py-1.5 text-xs"
												target="_blank"
												rel="noreferrer"
											>
												ดู
											</Link>
											<Link
												href={`/admin/courses/${encodeURIComponent(c.slug)}/edit`}
												className="rounded bg-black px-3 py-1.5 text-xs text-white"
											>
												แก้ไข
											</Link>
										</div>
									</td>
								</tr>
							);
						})}

						{rows.length === 0 ? (
							<tr>
								<td className="px-4 py-8 text-center text-slate-600" colSpan={6}>
									ไม่มีคอร์ส
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
		</div>
	);
}
