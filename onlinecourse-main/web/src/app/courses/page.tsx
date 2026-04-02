import { headers } from 'next/headers';
import { getCourses } from '@/lib/api';
import CoursesClientContent from '@/app/courses/CoursesClientContent';

export default async function CoursesPage() {
	const cookieHeader = (await headers()).get('cookie') ?? '';
	const courses = await getCourses(cookieHeader);

	return <CoursesClientContent courses={courses} />;
}
