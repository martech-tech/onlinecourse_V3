import { headers } from 'next/headers';
import { requireAdminServer } from '@/lib/adminApi';
import ImportWordpressClient from '@/app/import/ImportWordpressClient';

export default async function ImportWordpressPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, '/import');
	return <ImportWordpressClient />;
}
