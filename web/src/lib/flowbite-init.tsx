'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initFlowbite } from 'flowbite';

export default function FlowbiteInit() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const routeKey = `${pathname}?${searchParams.toString()}`;

	useEffect(() => {
		initFlowbite();

		const onPopState = () => initFlowbite();
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [routeKey]);

	return null;
}
