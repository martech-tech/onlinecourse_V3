'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { enrollInCourse, getEnrollmentStatus, type EnrollmentStatusResponse } from '@/lib/api';

export default function CourseProgressAside({
	slug,
	password,
	firstLessonHref,
}: {
	slug: string;
	password?: string;
	firstLessonHref?: string;
}) {
	const [data, setData] = useState<EnrollmentStatusResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const percent = useMemo(() => {
		if (!data || !('enrolled' in data) || data.enrolled === false) return 0;
		return Math.max(0, Math.min(100, Number(data.enrollment.progressPercent) || 0));
	}, [data]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		getEnrollmentStatus(slug, password)
			.then((res) => {
				if (cancelled) return;
				setData(res);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : 'โหลดสถานะการลงทะเบียนไม่สำเร็จ');
			})
			.finally(() => {
				if (cancelled) return;
				setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [slug, password]);

	async function onEnroll() {
		setLoading(true);
		setError(null);
		try {
			const res = await enrollInCourse(slug, password);
			setData(res);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'ลงทะเบียนเรียนไม่สำเร็จ');
		} finally {
			setLoading(false);
		}
	}

	if (loading && !data) {
		return <div className="text-sm text-gray-600">กำลังโหลด…</div>;
	}

	if (error && !data) {
		if (error === 'UNAUTHORIZED') {
			return (
				<div className="grid gap-2">
					<Link className="rounded bg-black px-3 py-2 text-center text-sm text-white" href="/login">
						เข้าสู่ระบบเพื่อสมัครเรียน
					</Link>
				</div>
			);
		}
		return <div className="text-sm text-red-600">{error}</div>;
	}

	if (!data || data.enrolled === false) {
		const unauthorized = error === 'UNAUTHORIZED';
		return (
			<div className="grid gap-2">
				{unauthorized ? (
					<Link className="rounded bg-black px-3 py-2 text-center text-sm text-white" href="/login">
						เข้าสู่ระบบเพื่อสมัครเรียน
					</Link>
				) : (
					<button
						type="button"
						onClick={onEnroll}
						disabled={loading}
						className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
					>
						{loading ? 'กำลังลงทะเบียน…' : 'สมัครเรียน'}
					</button>
				)}
				{error ? <div className="text-sm text-red-600">{error}</div> : null}
			</div>
		);
	}

	const { completedLessonsCount, totalLessonsCount } = data.enrollment;

	return (
		<div className="grid gap-2">
			<div className="flex items-center justify-between text-sm">
				<div className="text-gray-700">ความคืบหน้าคอร์ส</div>
				<div className="font-medium">{percent}%</div>
			</div>

			<div className="h-2.5 w-full rounded-full bg-gray-200">
				<div className="h-2.5 rounded-full bg-black" style={{ width: `${percent}%` }} />
			</div>

			<div className="text-xs text-gray-600">
				{completedLessonsCount}/{totalLessonsCount} บทเรียนที่เรียนจบแล้ว
			</div>

			{firstLessonHref ? (
				<Link className="mt-2 rounded-xl bg-black px-3 py-2 text-center text-sm text-white" href={firstLessonHref}>
					ไปที่บทเรียน
				</Link>
			) : null}

			{error ? <div className="text-sm text-red-600">{error}</div> : null}
		</div>
	);
}
