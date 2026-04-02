import { redirect } from 'next/navigation';

type AdminMeResponse = { admin: { id: string; email?: string; role: 'admin' } };

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	let returnBase = base.replace(/\/$/, '');

	// Next.js Server Side fetch requires an absolute URL.
	if (typeof window === 'undefined' && returnBase.startsWith('/')) {
		if (process.env.VERCEL_URL) {
			returnBase = `https://${process.env.VERCEL_URL}${returnBase}`;
		} else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
			returnBase = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}${returnBase}`;
		} else {
			returnBase = `http://localhost:${process.env.PORT || 3000}${returnBase}`;
		}
	}

	return returnBase;
}

export async function getAdminMeServer(cookieHeader: string): Promise<AdminMeResponse['admin'] | null> {
	const res = await fetch(`${apiBase()}/admin/me`, {
		cache: 'no-store',
		credentials: 'include',
		headers: cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined,
	});
	if (res.status === 401) return null;
	if (!res.ok) return null;
	const json = (await res.json()) as AdminMeResponse;
	return json.admin || null;
}

export async function requireAdminServer(cookieHeader: string, nextPath?: string) {
	const admin = await getAdminMeServer(cookieHeader);
	if (!admin) {
		const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : '';
		redirect(`/admin/login${next}`);
	}
	return admin;
}
