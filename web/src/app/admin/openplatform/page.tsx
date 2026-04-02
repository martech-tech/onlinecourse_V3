import { headers } from 'next/headers';
import { requireAdminServer } from '@/lib/adminApi';
import AdminJTClient from './AdminJTClient';

export default async function AdminOpenPlatformPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, '/admin/openplatform');
	return <AdminJTClient />;
}
