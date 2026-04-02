import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CourseCardWithProgressProps = {
	title: string;
	slug: string;
	thumbnailUrl?: string | null;
	percentCompleted: number;
	continueLessonSlug?: string | null;
};

function clampPercent(value: number) {
	if (!Number.isFinite(value)) return 0;
	return Math.min(100, Math.max(0, Math.round(value)));
}

export default function CourseCardWithProgress({
	title,
	slug,
	thumbnailUrl,
	percentCompleted,
	continueLessonSlug,
}: CourseCardWithProgressProps) {
	const router = useRouter();
	const pct = clampPercent(percentCompleted);
	const continueHref = continueLessonSlug
		? `/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(continueLessonSlug)}`
		: `/courses/${encodeURIComponent(slug)}`;

	return (
		<div
			role="link"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter') router.push(`/courses/${encodeURIComponent(slug)}`);
			}}
			onClick={() => router.push(`/courses/${encodeURIComponent(slug)}`)}
			className="group block h-full cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="relative aspect-[4/3] w-full bg-slate-100">
				{thumbnailUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img alt={title} src={thumbnailUrl} className="h-full w-full object-cover" />
				) : null}
			</div>

			<div className="space-y-2 p-3 md:p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm md:text-base font-semibold text-slate-900 transition group-hover:text-slate-700 truncate">{title}</h3>
					<p className="text-xs text-gray-500">{pct}%</p>
				</div>

				<div className="h-2 w-full rounded bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="ความคืบหน้าคอร์ส">
					<div className="h-2 rounded bg-black" style={{ width: `${pct}%` }} />
				</div>

				<div className="mt-3">
					<Link
						href={continueHref}
						className="block w-full rounded-xl bg-black px-3 py-2 text-xs md:text-sm text-center text-white"
						onClick={(e) => e.stopPropagation()}
					>
						เรียนต่อ
					</Link>
				</div>
			</div>
		</div>
	);
}
