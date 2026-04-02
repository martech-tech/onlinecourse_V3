import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl">
			<main className="min-w-0">{children}</main>
		</div>
	);
}
