'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeLesson, getLessonCompletionStatus } from '@/lib/api';

export default function LessonCompletionButton({
	courseSlug,
	lessonSlug,
	password,
}: {
	courseSlug: string;
	lessonSlug: string;
	password?: string;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [enrolled, setEnrolled] = useState<boolean | null>(null);
	const [completed, setCompleted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setError(null);
		getLessonCompletionStatus(courseSlug, lessonSlug, password)
			.then((res) => {
				if (cancelled) return;
				setEnrolled(res.enrolled);
				setCompleted(res.enrolled ? res.completed : false);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : 'โหลดสถานะการเรียนไม่สำเร็จ');
			})
			.finally(() => {
				if (cancelled) return;
			});
		return () => {
			cancelled = true;
		};
	}, [courseSlug, lessonSlug, password]);

	async function onComplete() {
		setLoading(true);
		setError(null);
		try {
			await completeLesson(courseSlug, lessonSlug, password);
			setCompleted(true);
			setEnrolled(true);
			router.refresh();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'ไม่สำเร็จ');
		} finally {
			setLoading(false);
		}
	}

	if (enrolled === false) {
		return <div className="text-sm text-gray-600">ลงทะเบียนเรียนเพื่อบันทึกความคืบหน้า</div>;
	}

	return (
		<div className="flex items-center gap-3">
			{error ? <div className="text-sm text-red-600">{error}</div> : null}
			<button
				type="button"
				onClick={onComplete}
				disabled={loading || completed}
				className="rounded-xl border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
			>
				{completed ? 'เรียนจบแล้ว' : loading ? 'กำลังบันทึก…' : 'ทำเครื่องหมายว่าเรียนจบ'}
			</button>
		</div>
	);
}
