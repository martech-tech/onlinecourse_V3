import { headers } from 'next/headers';
import AdminDashboardClient from '@/app/admin/AdminDashboardClient';
import { requireAdminServer } from '@/lib/adminApi';

export default async function AdminPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	const admin = await requireAdminServer(cookieHeader, '/admin');
	return <AdminDashboardClient email={admin.email} />;
}
