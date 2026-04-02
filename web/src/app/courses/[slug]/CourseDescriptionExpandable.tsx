'use client';

import { useEffect, useRef, useState } from 'react';

export default function CourseDescriptionExpandable({ html }: { html: string }) {
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [canToggle, setCanToggle] = useState(false);

	useEffect(() => {
		const el = contentRef.current;
		if (!el) return;

		const measure = () => {
			if (!contentRef.current) return;
			const node = contentRef.current;
			const isOverflowing = node.scrollHeight > node.clientHeight + 4;
			setCanToggle(isOverflowing);
		};

		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [html, expanded]);

	const Icon = ({ type }: { type: 'plus' | 'minus' }) => (
		<svg
			aria-hidden="true"
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth="2"
		>
			{type === 'plus' ? (
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
			) : (
				<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
			)}
		</svg>
	);

	return (
		<div>
			<div
				ref={contentRef}
				className={expanded ? 'prose mt-3 max-w-none' : 'prose mt-3 max-h-48 overflow-hidden max-w-none'}
				dangerouslySetInnerHTML={{ __html: html || '' }}
			/>

			{canToggle ? (
				<button
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="mt-3 inline-flex items-center gap-2 text-sm font-medium underline"
				>
					{expanded ? (
						<>
							<Icon type="minus" />
							<span>แสดงน้อยลง</span>
						</>
					) : (
						<>
							<Icon type="plus" />
							<span>แสดงเพิ่มเติม</span>
						</>
					)}
				</button>
			) : null}
		</div>
	);
}
