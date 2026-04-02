import CourseBuilderClient from './CourseBuilderClient';
import { headers } from 'next/headers';
import { requireAdminServer } from '@/lib/adminApi';

export default async function BuilderPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, '/builder');
	return <CourseBuilderClient />;
}
