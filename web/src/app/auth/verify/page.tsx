import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export default function VerifyPage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-6 p-8">
					<h1 className="text-2xl font-semibold">ยืนยันอีเมล</h1>
					<div className="flex items-center gap-3 text-sm text-gray-700">
						<span
							className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent"
							aria-hidden="true"
						/>
						กำลังโหลด…
					</div>
				</div>
			}
		>
			<VerifyClient />
		</Suspense>
	);
}
