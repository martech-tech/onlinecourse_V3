import { headers } from 'next/headers';
import { requireAdminServer } from '@/lib/adminApi';
import AdminShippingClient from './AdminShippingClient';

export default async function AdminShippingPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, '/admin/shipping');
	return <AdminShippingClient />;
}
