'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
	src: string;
	title: string;
};

function withRetryParam(src: string, retry: number) {
	try {
		const u = new URL(src);
		u.searchParams.set('__embed_retry', String(retry));
		return u.toString();
	} catch {
		return src;
	}
}

export default function LessonVideoFrame({ src, title }: Props) {
	const [phase, setPhase] = useState<'checking' | 'ready' | 'failed'>('checking');
	const [retry, setRetry] = useState(0);
	const [renderKey, setRenderKey] = useState(0);

	const trimmedSrc = src.trim();
	if (!trimmedSrc) {
		return (
			<div className="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">
				ไม่สามารถแสดงวิดีโอได้เนื่องจากไม่มี URL ของวิดีโอที่ถูกต้อง
			</div>
		);
	}

	const probeSrc = useMemo(() => withRetryParam(trimmedSrc, retry), [trimmedSrc, retry]);

	useEffect(() => {
		setPhase('checking');
		setRetry(0);
		setRenderKey((k) => k + 1);
	}, [trimmedSrc]);

	useEffect(() => {
		if (phase !== 'checking') return;
		const timer = window.setTimeout(() => {
			if (retry < 1) {
				setRetry((r) => r + 1);
				setRenderKey((k) => k + 1);
				return;
			}
			setPhase('failed');
		}, 7000);
		return () => window.clearTimeout(timer);
	}, [phase, retry]);

	const handleRetryInPage = () => {
		setPhase('checking');
		setRetry(0);
		setRenderKey((k) => k + 1);
	};

	const openInNewTabButton = (
		<div className="mt-3 flex justify-center">
			<a
				href={trimmedSrc}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
			>
				เปิดวิดีโอในแท็บใหม่
			</a>
		</div>
	);

	return (
		<>
			{phase === 'checking' ? (
				<>
					<div className="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" style={{ paddingTop: '56.25%' }}>
						<div className="absolute inset-0 z-10 grid place-items-center px-4 text-center text-sm text-slate-600">
							กำลังเตรียมวิดีโอ...
						</div>
						<iframe
							key={`main-${renderKey}`}
							className="absolute inset-0 h-full w-full border-0"
							src={probeSrc}
							title={title}
							allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
							allowFullScreen
							loading="eager"
							// referrerPolicy="strict-origin-when-cross-origin"
							onLoad={() => {
								setPhase('ready');
							}}
							onError={() => {
								setPhase('failed');
							}}
						/>
					</div>
					{openInNewTabButton}
				</>
			) : null}

			{phase === 'ready' ? (
				<>
					<div className="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" style={{ paddingTop: '56.25%' }}>
						<iframe
							key={`main-${renderKey}`}
							className="absolute inset-0 h-full w-full border-0"
							src={probeSrc}
							title={title}
							allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
							allowFullScreen
							loading="eager"
							// referrerPolicy="strict-origin-when-cross-origin"
							onError={() => {
								setPhase('failed');
							}}
						/>
					</div>
					{openInNewTabButton}
				</>
			) : null}

			{phase === 'failed' ? (
				<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
					<div className="font-medium">Safari ยังไม่สามารถโหลดวิดีโอในหน้านี้ได้</div>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={handleRetryInPage}
							className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
						>
							ลองโหลดวิดีโอใหม่ในหน้านี้
						</button>
						<a href={trimmedSrc} target="_blank" rel="noopener noreferrer" className="text-sm underline">
							เปิดวิดีโอในแท็บใหม่
						</a>
					</div>
				</div>
			) : null}
		</>
	);
}
