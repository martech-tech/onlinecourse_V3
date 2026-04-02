import { headers } from 'next/headers';
import { requireAdminServer } from '@/lib/adminApi';
import { getAdminCourses } from '@/lib/api';
import AdminCoursesClient from './AdminCoursesClient';

export default async function AdminCoursesPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, '/admin/courses');
	const courses = await getAdminCourses(cookieHeader);
	return <AdminCoursesClient courses={courses} />;
}
