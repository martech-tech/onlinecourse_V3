import { getCourseBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import UnlockForm from '../UnlockForm';
import CourseBuilderClient from '@/app/builder/CourseBuilderClient';
import { requireAdminServer } from '@/lib/adminApi';
import { headers } from 'next/headers';

export default async function CourseEditPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ password?: string }>;
}) {
	const { slug } = await params;
	const { password } = await searchParams;

	const cookieHeaderForAdmin = (await headers()).get('cookie') ?? '';
	await requireAdminServer(cookieHeaderForAdmin, `/courses/${encodeURIComponent(slug)}/edit`);

	const cookieStore = await cookies();
	type CookieEntry = { name: string; value: string };
	const cookieHeader = cookieStore
		.getAll()
		.map((c: CookieEntry) => `${c.name}=${c.value}`)
		.join('; ');

	let data;
	try {
		data = await getCourseBySlug(slug, password, cookieHeader);
	} catch (e: any) {
		if (String(e?.message) === 'NOT_FOUND') return notFound();
		throw e;
	}

	if (data.locked) {
		return (
			<div className="mx-auto max-w-3xl p-6">
				<h1 className="text-xl font-semibold">แก้ไข: {data.course.title}</h1>
				<p className="mt-2 text-sm text-gray-600">คอร์สนี้มีรหัสผ่าน กรุณาปลดล็อกเพื่อแก้ไข</p>
				<UnlockForm />
			</div>
		);
	}

	return (
		<CourseBuilderClient mode="edit" initialCourse={data.course} unlockPassword={password} />
	);
}
