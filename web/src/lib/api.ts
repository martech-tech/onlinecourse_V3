import type { AdminCourseListItem, Course, CourseListItem, GetCourseResponse } from '@/lib/types';
import type { ShopBanner, ShopProduct } from '@/lib/shop';

export type ShopOrderStatus = 'pending' | 'paid' | 'cancelled' | 'failed';

export type MyShopOrderItem = {
	productId: string;
	name: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
};

export type MyShopOrder = {
	id: string;
	couponCode?: string | null;
	discountTotal?: number;
	total: number;
	currency: string;
	status: ShopOrderStatus;
	shippingStatus?: string | null;
	trackingNumber?: string | null;
	billCode?: string | null;
	gateway: string;
	gatewayReference: string | null;
	gatewayStatusCode: string | null;
	createdAt: string;
	shipping?: {
		receiverName?: string | null;
		email?: string | null;
		phone?: string | null;
		address?: string | null;
	};
	items: MyShopOrderItem[];
};

export type OrderTrackingEvent = {
	scanType: string;
	description: string;
	scanTime: string;
	scanCity: string;
	province: string;
	entrySiteName: string;
};

export type OrderTrackingResponse = {
	shippingStatus: string | null;
	trackingNumber: string | null;
	billCode: string | null;
	events: OrderTrackingEvent[];
	liveTraces: OrderTrackingEvent[];
};

export type EnrollmentStatusResponse =
	| { enrolled: false }
	| {
			enrolled: true;
			enrollment: {
				id: string;
				progressPercent: number;
				completedLessonsCount: number;
				totalLessonsCount: number;
				enrolledAt?: string;
			};
	  };

export type LessonCompletionStatusResponse =
	| { enrolled: false; completed: false }
	| {
			enrolled: true;
			completed: boolean;
			progress: {
				progressPercent: number;
				completedLessonsCount: number;
				totalLessonsCount: number;
			};
	  };

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export async function getCourses(cookieHeader?: string): Promise<CourseListItem[]> {
	const headers = cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined;
	const res = await fetch(`${apiBase()}/courses`, {
		cache: 'no-store',
		credentials: 'include',
		headers,
	});
	if (!res.ok) throw new Error('โหลดคอร์สไม่สำเร็จ');
	const json = (await res.json()) as { courses: CourseListItem[] };
	return json.courses;
}

export async function getAdminCourses(cookieHeader?: string): Promise<AdminCourseListItem[]> {
	const headers = cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined;
	const res = await fetch(`${apiBase()}/courses/admin`, {
		cache: 'no-store',
		credentials: 'include',
		headers,
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดรายการคอร์สแอดมินไม่สำเร็จ');
	const json = (await res.json()) as { courses: AdminCourseListItem[] };
	return Array.isArray(json.courses) ? json.courses : [];
}

export async function getAdminCourseBySlug(slug: string, cookieHeader?: string): Promise<Course> {
	const headers = cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined;
	const res = await fetch(`${apiBase()}/courses/admin/${encodeURIComponent(slug)}`, {
		cache: 'no-store',
		credentials: 'include',
		headers,
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (res.status === 404) throw new Error('NOT_FOUND');
	if (!res.ok) throw new Error('โหลดข้อมูลคอร์สแอดมินไม่สำเร็จ');
	const json = (await res.json()) as { course: Course };
	return json.course;
}

export async function uploadCourseThumbnail(file: File): Promise<string> {
	const form = new FormData();
	form.append('thumbnail', file);

	const res = await fetch(`${apiBase()}/courses/admin/thumbnail`, {
		method: 'POST',
		credentials: 'include',
		body: form,
	});
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(json?.error || 'อัปโหลดรูปปกไม่สำเร็จ');
	}
	const json = (await res.json()) as { thumbnailUrl: string };
	return String(json.thumbnailUrl || '');
}

export async function getShopProducts(): Promise<ShopProduct[]> {
	const res = await fetch(`${apiBase()}/shop/products`, { cache: 'no-store' });
	if (!res.ok) throw new Error('โหลดสินค้าไม่สำเร็จ');
	const json = (await res.json()) as { products: ShopProduct[] };
	return json.products;
}

export async function getShopBanners(): Promise<ShopBanner[]> {
	const res = await fetch(`${apiBase()}/shop/banners`, { cache: 'no-store' });
	if (!res.ok) throw new Error('โหลดแบนเนอร์ไม่สำเร็จ');
	const json = (await res.json()) as { banners: ShopBanner[] };
	return json.banners;
}

export async function getMyShopOrders(): Promise<MyShopOrder[]> {
	const res = await fetch(`${apiBase()}/shop/orders/my`, {
		cache: 'no-store',
		credentials: 'include',
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดรายการสั่งซื้อไม่สำเร็จ');
	const json = (await res.json()) as { orders: MyShopOrder[] };
	return Array.isArray(json.orders) ? json.orders : [];
}

export async function getOrderTracking(orderPublicId: string): Promise<OrderTrackingResponse> {
	const res = await fetch(`${apiBase()}/shop/orders/${encodeURIComponent(orderPublicId)}/tracking`, {
		cache: 'no-store',
		credentials: 'include',
	});
	if (!res.ok) throw new Error('โหลดข้อมูลการจัดส่งไม่สำเร็จ');
	return (await res.json()) as OrderTrackingResponse;
}

export type ValidateShopCouponResponse = {
	ok: true;
	code: string;
	discount: number;
	total: number;
	description: string | null;
};

export async function validateShopCoupon(code: string, subtotal: number): Promise<ValidateShopCouponResponse> {
	const res = await fetch(`${apiBase()}/shop/coupons/validate`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		cache: 'no-store',
		body: JSON.stringify({ code, subtotal }),
	});
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(json?.error || 'คูปองไม่ถูกต้อง');
	}
	return (await res.json()) as ValidateShopCouponResponse;
}

export async function getCourseBySlug(slug: string, password?: string, cookieHeader?: string): Promise<GetCourseResponse> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const headers = cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined;
	const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(slug)}${qs}`, {
		cache: 'no-store',
		headers,
		credentials: 'include',
	});
	if (res.status === 404) throw new Error('NOT_FOUND');
	if (!res.ok) throw new Error('โหลดข้อมูลคอร์สไม่สำเร็จ');
	return (await res.json()) as GetCourseResponse;
}

export async function createCourse(payload: unknown): Promise<Course> {
	const res = await fetch(`${apiBase()}/courses`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || 'สร้างคอร์สไม่สำเร็จ');
	}
	const json = (await res.json()) as { course: Course };
	return json.course;
}

export async function updateCourseBySlug(slug: string, payload: unknown, password?: string): Promise<Course> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(slug)}${qs}`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || 'อัปเดตคอร์สไม่สำเร็จ');
	}
	const json = (await res.json()) as { course: Course };
	return json.course;
}

export async function importWordpressExport(payload: unknown, overwrite?: boolean): Promise<{ title: string; slug: string; locked: boolean }> {
	const qs = overwrite ? '?overwrite=1' : '';
	const res = await fetch(`${apiBase()}/imports/wordpress${qs}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || 'นำเข้าไฟล์ส่งออก WordPress ไม่สำเร็จ');
	}
	const json = (await res.json()) as { course: { title: string; slug: string; locked: boolean } };
	return json.course;
}

export async function getEnrollmentStatus(slug: string, password?: string): Promise<EnrollmentStatusResponse> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(slug)}/enrollment${qs}`, {
		cache: 'no-store',
		credentials: 'include',
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดสถานะการลงทะเบียนไม่สำเร็จ');
	return (await res.json()) as EnrollmentStatusResponse;
}

export async function getEnrollmentStatusServer(
	slug: string,
	password?: string,
	cookieHeader?: string
): Promise<EnrollmentStatusResponse> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const headers = cookieHeader ? ({ cookie: cookieHeader } as Record<string, string>) : undefined;
	const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(slug)}/enrollment${qs}`, {
		cache: 'no-store',
		headers,
		credentials: 'include',
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (res.status === 403) throw new Error('LOCKED');
	if (res.status === 404) throw new Error('NOT_FOUND');
	if (!res.ok) throw new Error('โหลดสถานะการลงทะเบียนไม่สำเร็จ');
	return (await res.json()) as EnrollmentStatusResponse;
}

export async function enrollInCourse(slug: string, password?: string): Promise<EnrollmentStatusResponse> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(slug)}/enroll${qs}`, {
		method: 'POST',
		credentials: 'include',
		cache: 'no-store',
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(text || 'ลงทะเบียนเรียนไม่สำเร็จ');
	}
	return (await res.json()) as EnrollmentStatusResponse;
}

export async function getLessonCompletionStatus(
	slug: string,
	lessonSlug: string,
	password?: string
): Promise<LessonCompletionStatusResponse> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const res = await fetch(
		`${apiBase()}/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/completion${qs}`,
		{
			cache: 'no-store',
			credentials: 'include',
		}
	);
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดสถานะการเรียนไม่สำเร็จ');
	return (await res.json()) as LessonCompletionStatusResponse;
}

export async function completeLesson(slug: string, lessonSlug: string, password?: string): Promise<{ ok: true; progress: { progressPercent: number; completedLessonsCount: number; totalLessonsCount: number } }> {
	const qs = password ? `?password=${encodeURIComponent(password)}` : '';
	const res = await fetch(
		`${apiBase()}/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/complete${qs}`,
		{
			method: 'POST',
			credentials: 'include',
			cache: 'no-store',
		}
	);
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (res.status === 409) throw new Error('NOT_ENROLLED');
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(text || 'บันทึกการเรียนจบบทเรียนไม่สำเร็จ');
	}
	return (await res.json()) as { ok: true; progress: { progressPercent: number; completedLessonsCount: number; totalLessonsCount: number } };
}

export type MyEnrollmentCourse = {
	enrollmentId: string;
	course: {
		id: string;
		title: string;
		slug: string;
		thumbnailUrl?: string;
		categories: string[];
		level?: string;
		visibility?: { type: 'public' | 'password' };
	};
	continueLessonSlug?: string | null;
	progress: { percent: number };
	enrolledAt?: string;
};

export type UpdateProfilePayload = {
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	bio?: string;
};

export type UpdateProfileResponse = {
	user?: {
		id?: string;
		email?: string | null;
		role?: string;
		name?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		phoneNumber?: string | null;
		isVerified?: boolean;
		bio?: string | null;
		profileImage?: string | null;
	};
};

export async function getMyEnrollments(): Promise<MyEnrollmentCourse[]> {
	const res = await fetch(`${apiBase()}/user/enrollments`, {
		cache: 'no-store',
		credentials: 'include',
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดรายการคอร์สที่ลงทะเบียนไม่สำเร็จ');
	const json = (await res.json()) as { enrollments: MyEnrollmentCourse[] };
	return Array.isArray(json.enrollments) ? json.enrollments : [];
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
	const res = await fetch(`${apiBase()}/user/profile`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(json?.error || 'อัปเดตโปรไฟล์ไม่สำเร็จ');
	}
	return (await res.json()) as UpdateProfileResponse;
}
