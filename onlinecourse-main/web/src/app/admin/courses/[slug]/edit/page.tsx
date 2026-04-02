import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { requireAdminServer } from '@/lib/adminApi';
import { getAdminCourseBySlug } from '@/lib/api';
import CourseBuilderClient from '@/app/builder/CourseBuilderClient';

export default async function AdminCourseEditPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, never>>;
}) {
	const { slug } = await params;
	void (await searchParams);

	const cookieHeader = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeader, `/admin/courses/${encodeURIComponent(slug)}/edit`);

	const cookieStore = await cookies();
	type CookieEntry = { name: string; value: string };
	const userCookieHeader = cookieStore
		.getAll()
		.map((c: CookieEntry) => `${c.name}=${c.value}`)
		.join('; ');

	let data;
	try {
		data = await getAdminCourseBySlug(slug, userCookieHeader);
	} catch (e: any) {
		if (String(e?.message) === 'NOT_FOUND') return notFound();
		throw e;
	}

	return <CourseBuilderClient mode="edit" initialCourse={data} />;
}
