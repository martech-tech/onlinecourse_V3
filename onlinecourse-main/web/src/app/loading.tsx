"use client";

import { useEffect, useState } from "react";

export default function Loading() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let raf = 0;
		let start = 0;
		const duration = 1800;

		const tick = (timestamp: number) => {
			if (!start) start = timestamp;
			const elapsed = timestamp - start;
			const eased = Math.min(elapsed / duration, 1);
			const next = Math.floor(eased * 92);
			setProgress((prev) => (next > prev ? next : prev));
			if (eased < 1) {
				raf = window.requestAnimationFrame(tick);
			}
		};

		raf = window.requestAnimationFrame(tick);
		return () => window.cancelAnimationFrame(raf);
	}, []);

	const ringStyle = {
		background: `conic-gradient(#f97316 ${progress * 3.6}deg, #e2e8f0 0deg)`,
	} as const;

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
			<div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
				<div className="mx-auto flex h-28 w-28 items-center justify-center">
					<div className="relative h-24 w-24 rounded-full p-1" style={ringStyle}>
						<div className="flex h-full w-full items-center justify-center rounded-full bg-white">
							<span className="text-xl font-semibold text-slate-900">{progress}%</span>
						</div>
					</div>
				</div>
				<h2 className="mt-4 text-lg font-semibold text-slate-900">กำลังโหลด</h2>
				<p className="mt-1 text-sm text-slate-600">กำลังเตรียมเนื้อหา…</p>
			</div>
		</div>
	);
}
