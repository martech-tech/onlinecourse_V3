'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import ProfileImageUpload from './ProfileImageUpload';
import CourseCardWithProgress from './CourseCardWithProgress';
import {
	getCourses,
	getMyEnrollments,
	getMyShopOrders,
	getOrderTracking,
	type MyEnrollmentCourse,
	type MyShopOrder,
	type OrderTrackingResponse,
	updateMyProfile,
} from '@/lib/api';
import { getShopProducts } from '@/lib/api';
import type { ShopProduct } from '@/lib/shop';
import { formatPrice } from '@/lib/shop';
import { useCart } from '@/context/CartContext';
import type { CourseListItem } from '@/lib/types';

const COURSE_PLACEHOLDER = '/shop/categories/course.svg';

function getCourseDate(course: CourseListItem) {
	return course.updatedAt ? new Date(course.updatedAt).getTime() : 0;
}

function CourseCard({ course }: { course: CourseListItem }) {
	const imageSrc = course.thumbnailUrl || COURSE_PLACEHOLDER;
	const showLockOverlay = course.locked && !course.enrolled;
	return (
		<Link
			href={`/courses/${course.slug}`}
			className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="relative aspect-[4/3] w-full bg-slate-100">
				<img src={imageSrc} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
				{showLockOverlay ? (
					<div className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm">
							<svg
								viewBox="0 0 24 24"
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M17 11V7a5 5 0 0 0-10 0v4" />
								<rect x="5" y="11" width="14" height="10" rx="2" />
							</svg>
						</div>
					</div>
				) : null}
			</div>
			<div className="space-y-2 p-4">
				<div>
					<div className="text-base font-semibold text-slate-900 transition group-hover:text-slate-700">
						{course.title}
					</div>
					{course.categories?.length ? (
						<div className="mt-2 flex flex-wrap gap-2">
							{course.categories.map((category) => (
								<span
									key={`${course.slug}-${category}`}
									className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
								>
									{category}
								</span>
							))}
						</div>
					) : null}
				</div>
			</div>
		</Link>
	);
}

export default function DashboardPage() {
	const router = useRouter();
	const { user, status, updateSession } = useAuth();
	const { items: cartItems, subtotal, totalItems } = useCart();
	const [imageUrl, setImageUrl] = useState<string | null>(user?.image ?? null);
	const [enrollments, setEnrollments] = useState<MyEnrollmentCourse[] | null>(null);
	const [coursesError, setCoursesError] = useState<string | null>(null);
	const [allCourses, setAllCourses] = useState<CourseListItem[] | null>(null);
	const [allCoursesError, setAllCoursesError] = useState<string | null>(null);
	const [campItems, setCampItems] = useState<ShopProduct[] | null>(null);
	const [campError, setCampError] = useState<string | null>(null);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileError, setProfileError] = useState<string | null>(null);
	const [profileSaved, setProfileSaved] = useState(false);
	const [activeSection, setActiveSection] = useState<'profile' | 'courses' | 'camp' | 'payments'>('profile');
	const [orders, setOrders] = useState<MyShopOrder[] | null>(null);
	const [ordersError, setOrdersError] = useState<string | null>(null);
	const [checkingRef, setCheckingRef] = useState<string | null>(null);
	const [checkError, setCheckError] = useState<string | null>(null);
	const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
	const [lastPaymentCheckByOrderId, setLastPaymentCheckByOrderId] = useState<
		Record<string, { pending: boolean; paid: boolean; cancelled: boolean; status: string | null; checkedAt: string }>
	>({});
	const [trackingByOrderId, setTrackingByOrderId] = useState<Record<string, OrderTrackingResponse>>({});
	const [trackingLoadingId, setTrackingLoadingId] = useState<string | null>(null);

	const paidProductIds = useMemo(() => {
		const ids = new Set<string>();
		for (const order of orders ?? []) {
			if (order.status !== 'paid') continue;
			for (const item of order.items ?? []) {
				if (item?.productId) ids.add(item.productId);
			}
		}
		return ids;
	}, [orders]);

	useEffect(() => {
		setImageUrl(user?.image ?? null);
	}, [user?.image]);

	useEffect(() => {
		setFirstName(String(user?.firstName || '').trim());
		setLastName(String(user?.lastName || '').trim());
		setEmail(String(user?.email || '').trim());
		setPhone(String(user?.phoneNumber || '').trim());
		setProfileSaved(false);
		setProfileError(null);
	}, [user?.firstName, user?.lastName, user?.name, user?.email, user?.phoneNumber]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const hash = (window.location.hash || '').replace('#', '');
		const allowed = ['profile', 'courses', 'camp', 'payments'] as const;
		type AllowedSection = (typeof allowed)[number];
		const isAllowedSection = (value: string): value is AllowedSection =>
			(allowed as readonly string[]).includes(value);
		if (isAllowedSection(hash)) setActiveSection(hash);
	}, []);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/login');
		}
	}, [status, router]);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		setCoursesError(null);
		getMyEnrollments()
			.then((items) => {
				if (cancelled) return;
				setEnrollments(items);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setCoursesError(err instanceof Error ? err.message : 'โหลดคอร์สไม่สำเร็จ');
				setEnrollments([]);
			});
		return () => {
			cancelled = true;
		};
	}, [user]);

	useEffect(() => {
		if (!user) return;
		if (activeSection !== 'courses') return;
		let cancelled = false;
		setAllCoursesError(null);
		setAllCourses((prev) => prev ?? null);
		getCourses()
			.then((items) => {
				if (cancelled) return;
				setAllCourses(items);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setAllCoursesError(err instanceof Error ? err.message : 'โหลดคอร์สไม่สำเร็จ');
				setAllCourses([]);
			});

		return () => {
			cancelled = true;
		};
	}, [user, activeSection]);

	const recommendedCourses = useMemo(() => {
		const source = allCourses ?? [];
		const recent = [...source].sort((a, b) => getCourseDate(b) - getCourseDate(a));
		if (!enrollments || enrollments.length === 0) return recent.slice(0, 8);

		const coursesBySlug = new Map<string, CourseListItem>();
		for (const course of source) coursesBySlug.set(course.slug, course);

		const enrolledSlugs = new Set<string>();
		for (const item of enrollments) {
			if (item?.course?.slug) enrolledSlugs.add(item.course.slug);
		}

		const weightByCategory = new Map<string, number>();
		for (const item of enrollments) {
			const slug = item?.course?.slug;
			if (!slug) continue;
			const enrolledCourse = coursesBySlug.get(slug);
			for (const category of enrolledCourse?.categories ?? []) {
				const key = category.trim();
				if (!key) continue;
				weightByCategory.set(key, (weightByCategory.get(key) ?? 0) + 1);
			}
		}

		const candidates = source.filter((course) => !enrolledSlugs.has(course.slug));
		const scored = candidates
			.map((course) => {
				let score = 0;
				for (const category of course.categories ?? []) {
					const key = category.trim();
					if (!key) continue;
					score += weightByCategory.get(key) ?? 0;
				}
				return { course, score, date: getCourseDate(course) };
			})
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score || b.date - a.date)
			.map((item) => item.course);

		const picked = scored.slice(0, 8);
		if (picked.length >= 8) return picked;

		const seen = new Set(picked.map((course) => course.slug));
		const fillers = candidates
			.filter((course) => !seen.has(course.slug))
			.sort((a, b) => getCourseDate(b) - getCourseDate(a))
			.slice(0, 8 - picked.length);

		return [...picked, ...fillers];
	}, [allCourses, enrollments]);

	useEffect(() => {
		let cancelled = false;
		setCampError(null);
		getShopProducts()
			.then((products) => {
				if (cancelled) return;
				setCampItems(products.filter((item) => item.category === 'camp'));
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setCampError(err instanceof Error ? err.message : 'Failed to load camps');
				setCampItems([]);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!user) return;
		if (activeSection !== 'payments') return;
		let cancelled = false;
		setOrdersError(null);
		setOrders((prev) => prev ?? null);
		getMyShopOrders()
			.then((rows) => {
				if (cancelled) return;
				setOrders(rows);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setOrdersError(err instanceof Error ? err.message : 'โหลดประวัติการชำระเงินไม่สำเร็จ');
				setOrders([]);
			});
		return () => {
			cancelled = true;
		};
	}, [user, activeSection]);

	if (status === 'loading') {
		return <div className="p-6 text-sm text-gray-600">กำลังโหลด…</div>;
	}

	if (!user) {
		return <div className="p-6 text-sm text-gray-600">กำลังเปลี่ยนหน้า…</div>;
	}

	const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
	const courseCount = enrollments?.length ?? 0;
	const campCount = campItems?.length ?? 0;

	const currentEmail = String(user.email || '').trim().toLowerCase();
	const currentPhone = String(user.phoneNumber || '').trim();
	const currentFirst = String(user.firstName || '').trim();
	const currentLast = String(user.lastName || '').trim();

	const nextEmailTrimmed = email.trim().toLowerCase();
	const nextPhoneTrimmed = phone.trim();

	const hasProfileChanged =
		firstName.trim() !== currentFirst ||
		lastName.trim() !== currentLast ||
		nextEmailTrimmed !== currentEmail ||
		nextPhoneTrimmed !== currentPhone;
	const canSaveProfile =
		nextEmailTrimmed.length > 0 &&
		nextPhoneTrimmed.length > 0 &&
		hasProfileChanged &&
		!profileSaving;

	async function onSaveProfile() {
		function readStringProp(obj: unknown, key: string) {
			if (!obj || typeof obj !== 'object') return undefined;
			const rec = obj as Record<string, unknown>;
			const val = rec[key];
			return typeof val === 'string' ? val : undefined;
		}

		const nextFirstName = firstName.trim();
		const nextLastName = lastName.trim();
		const nextEmail = email.trim().toLowerCase();
		const nextPhone = phone.trim();

		if (!nextEmail || !nextEmail.includes('@')) {
			setProfileError('กรุณากรอก Gmail ให้ถูกต้อง');
			return;
		}
		if (!nextPhone) {
			setProfileError('กรุณากรอกเบอร์โทร');
			return;
		}

		setProfileSaving(true);
		setProfileError(null);
		setProfileSaved(false);
		try {
			const res = await updateMyProfile({ firstName: nextFirstName, lastName: nextLastName, email: nextEmail, phone: nextPhone });
			if (res.user) {
				const newUser = res.user;
				const newFirst = (newUser.firstName ?? nextFirstName ?? user?.firstName ?? '') as string;
				const newLast = (newUser.lastName ?? nextLastName ?? user?.lastName ?? '') as string;
				const newName = (`${newFirst || ''} ${newLast || ''}`.trim() || newUser.name || user?.name || '') as string;
				const newEmail = (newUser.email ?? nextEmail ?? user?.email ?? '') as string;
				const newPhone =
					(newUser.phoneNumber ??
						readStringProp(newUser as unknown, 'phone') ??
						readStringProp(newUser as unknown, 'phoneNumber') ??
						nextPhone ??
						(currentPhone || null)) as string | null;
				const newUserUnknown: unknown = newUser;
				const newImage =
					newUser.profileImage ??
					readStringProp(newUserUnknown, 'profileImageUrl') ??
					readStringProp(newUserUnknown, 'image') ??
					user?.image ??
					null;

				// Update client session if update function available
				if (typeof updateSession === 'function') {
					try {
						await updateSession({
							user: {
								name: newName,
								firstName: newFirst,
								lastName: newLast,
								email: newEmail,
								phoneNumber: newPhone,
								image: newImage,
							},
						});
					} catch {
						// ignore session update errors but continue
					}
				}

				// Reflect changes locally
				setFirstName(newFirst || '');
				setLastName(newLast || '');
				setEmail(newEmail || '');
				setPhone(newPhone ? String(newPhone) : '');
				if (newImage) setImageUrl(newImage);
				setProfileSaved(true);
			}
		} catch (err) {
			setProfileError(err instanceof Error ? err.message : 'อัปเดตโปรไฟล์ไม่สำเร็จ');
		} finally {
			setProfileSaving(false);
		}
	}

	function handleNavClick(section: 'profile' | 'courses' | 'camp' | 'payments') {
		setActiveSection(section);
		if (typeof window !== 'undefined' && window.innerWidth < 1024) {
			const el = document.getElementById(section);
			if (el) {
				setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
			}
		}
	}

	function formatOrderDate(value: unknown) {
		try {
			const d = new Date(String(value));
			if (Number.isNaN(d.getTime())) return '';
			return d.toLocaleString();
		} catch {
			return '';
		}
	}

	function referenceNoFromGatewayReference(value: string | null) {
		if (!value) return '';
		if (value.startsWith('trxn-')) return value.slice('trxn-'.length);
		return value;
	}

	async function onViewTracking(order: MyShopOrder) {
		if (trackingByOrderId[order.id]) {
			// Toggle: clear if already loaded
			setTrackingByOrderId((prev) => {
				const next = { ...prev };
				delete next[order.id];
				return next;
			});
			return;
		}
		setTrackingLoadingId(order.id);
		try {
			const data = await getOrderTracking(order.id);
			setTrackingByOrderId((prev) => ({ ...prev, [order.id]: data }));
		} catch {
			// silently ignore
		} finally {
			setTrackingLoadingId(null);
		}
	}

	async function onCheckPayment(order: MyShopOrder) {
		setCheckError(null);
		const referenceNo = referenceNoFromGatewayReference(order.gatewayReference);
		if (!referenceNo) {
			setCheckError('Missing payment reference');
			return;
		}
		setCheckingRef(referenceNo);
		try {
			const productDetail = order.items.map((it) => it.name).filter(Boolean).join(', ').slice(0, 200) || 'Order';
			const res = await fetch('/api/paysolutions/request-subscription', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ referenceNo, productDetail }),
			});
			if (!res.ok) {
				const text = await res.text().catch(() => '');
				throw new Error(text || 'Failed to check payment');
			}
			const checkJson = (await res.json()) as {
				status?: string | null;
				paid: boolean;
				pending: boolean;
				cancelled: boolean;
			};
			setLastPaymentCheckByOrderId((prev) => ({
				...prev,
				[order.id]: {
					pending: Boolean(checkJson.pending),
					paid: Boolean(checkJson.paid),
					cancelled: Boolean(checkJson.cancelled),
					status: typeof checkJson.status === 'string' ? checkJson.status : null,
					checkedAt: new Date().toISOString(),
				},
			}));
			// Refresh list (the API route also best-effort updates backend order status)
			const rows = await getMyShopOrders();
			setOrders(rows);
		} catch (err) {
			setCheckError(err instanceof Error ? err.message : 'Failed to check payment');
		} finally {
			setCheckingRef(null);
		}
	}

	async function onPayAgain(order: MyShopOrder) {
		setCheckError(null);
		setOrdersError(null);
		if (order.status === 'paid') {
			setCheckError('This order is already paid.');
			return;
		}

		const itemProductIds = new Set(order.items.map((it) => it.productId).filter(Boolean));
		const alreadyPaid = [...itemProductIds].filter((id) => paidProductIds.has(id));
		if (alreadyPaid.length) {
			setCheckError(`มีสินค้าบางรายการถูกชำระเงินแล้ว: ${alreadyPaid.join(', ')}`);
			return;
		}

		const shipping = {
			receiverName: String(order.shipping?.receiverName ?? '').trim(),
			email: String(order.shipping?.email ?? '').trim(),
			phone: String(order.shipping?.phone ?? '').trim(),
			address: String(order.shipping?.address ?? '').trim(),
		};
		if (!shipping.receiverName) return setCheckError('Missing receiver name for this order.');
		if (!shipping.email) return setCheckError('Missing email for this order.');
		if (!shipping.phone) return setCheckError('Missing phone for this order.');
		if (!shipping.address) return setCheckError('Missing address for this order.');

		const amount = Number(order.total) || 0;
		if (!(amount > 0)) {
			setCheckError('Invalid order total.');
			return;
		}
		if (!order.items.length) {
			setCheckError('This order has no items.');
			return;
		}

		setPayingOrderId(order.id);
		try {
			const res = await fetch('/api/paysolutions/create-subscript', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					amount,
					items: order.items.map((it) => ({
						id: it.productId,
						name: it.name,
						quantity: it.quantity,
						price: it.unitPrice,
					})),
					customer: { email: shipping.email, phone: shipping.phone },
					shipping,
				}),
			});

			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as { error?: string; productIds?: string[] } | null;
				const msg = json?.error || 'Failed to create payment reference';
				throw new Error(msg);
			}

			const json = (await res.json()) as {
				reference: string;
				referenceNo: string;
				productDetail: string;
				orderPublicId: string | null;
				merchantId: string;
				paymentUrl: string;
				total: number;
			};

			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(
					'jk-pending-order',
					JSON.stringify({
						orderPublicId: json.orderPublicId,
						reference: json.reference,
						createdAt: new Date().toISOString(),
						items: order.items,
						shipping,
						amount,
					})
				);
			}

			const form = document.createElement('form');
			form.method = 'post';
			form.action = json.paymentUrl;

			const fields: Record<string, string> = {
				refno: json.referenceNo,
				merchantid: json.merchantId,
				customeremail: shipping.email,
				cc: '00',
				productdetail: json.productDetail,
				total: String(json.total),
			};

			for (const [name, value] of Object.entries(fields)) {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = name;
				input.value = value;
				form.appendChild(input);
			}

			document.body.appendChild(form);
			form.submit();
		} catch (err) {
			setCheckError(err instanceof Error ? err.message : 'เริ่มชำระเงินใหม่ไม่สำเร็จ');
			setPayingOrderId(null);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
			<div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-slate-900">แดชบอร์ด</h1>
						<p className="text-sm text-slate-500">ยินดีต้อนรับกลับ, {fullName || user.name || 'นักเรียน'}.</p>
					</div>
					<div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm">
						<span className="font-semibold text-slate-900">{courseCount}</span> คอร์ส
						<span className="text-slate-300">•</span>
						<span className="font-semibold text-slate-900">{campCount}</span> แคมป์
						<span className="text-slate-300">•</span>
						<span className="font-semibold text-slate-900">{totalItems}</span> รายการในตะกร้า
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
					<aside className="w-full flex flex-col gap-4 lg:w-72">
						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">โปรไฟล์</p>
							<div className="mt-3 flex items-center gap-3">
								{imageUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										alt="โปรไฟล์"
										src={imageUrl}
										className="h-12 w-12 rounded-full border border-slate-200 object-cover"
									/>
								) : (
									<div className="h-12 w-12 rounded-full border border-slate-200 bg-slate-100" />
								)}
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-slate-900">{fullName || user.name || 'นักเรียน'}</p>
									<p className="truncate text-xs text-slate-500">บัญชีนักเรียน</p>
								</div>
							</div>
							<div className="mt-4 grid gap-2 text-sm">
								<button
									type="button"
									aria-pressed={activeSection === 'profile'}
									onClick={() => handleNavClick('profile')}
									className={`rounded-lg border px-3 py-2 text-sm ${activeSection === 'profile' ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
									แก้ไขโปรไฟล์
								</button>
								<button
									type="button"
									aria-pressed={activeSection === 'courses'}
									onClick={() => handleNavClick('courses')}
									className={`rounded-lg border px-3 py-2 text-sm ${activeSection === 'courses' ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
									คอร์สเรียน
								</button>
								<button
									type="button"
									aria-pressed={activeSection === 'camp'}
									onClick={() => handleNavClick('camp')}
									className={`rounded-lg border px-3 py-2 text-sm ${activeSection === 'camp' ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
									เช็กอินแคมป์
								</button>
								<button
									type="button"
									aria-pressed={activeSection === 'payments'}
									onClick={() => handleNavClick('payments')}
									className={`rounded-lg border px-3 py-2 text-sm ${activeSection === 'payments' ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
									ประวัติการสั่งซื้อ
								</button>
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ลิงก์ด่วน</p>
							<div className="mt-3 grid gap-2">
								<Link className="rounded-lg bg-black px-3 py-2 text-center text-xs font-semibold text-white" href="/courses">
									ดูคอร์สเรียน
								</Link>
								{/* <Link className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700" href="/shop">
									ไปที่ร้านค้า
								</Link> */}
								{/* <Link className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700" href="/cart">
									ดูตะกร้า
								</Link> */}
							</div>
						</div>
					</aside>

					<section className="flex min-w-0 flex-1 flex-col gap-6">
						<section id="profile" className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${activeSection === 'profile' ? '' : 'hidden'}`}>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">โปรไฟล์</h2>
									<p className="text-sm text-slate-500">อัปเดตชื่อผู้ใช้และรูปโปรไฟล์</p>
								</div>
								<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
									{user.role ? `บัญชี ${user.role}` : 'สมาชิก'}
								</span>
							</div>

							<div className="mt-6 grid gap-6 lg:grid-cols-[1fr,280px]">
								<div className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-slate-700" htmlFor="dashboard-first-name">
												ชื่อ
											</label>
											<input
												id="dashboard-first-name"
												value={firstName}
												onChange={(event) => {
													setFirstName(event.target.value);
													setProfileSaved(false);
													setProfileError(null);
												}}
												className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
												placeholder="ชื่อ"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700" htmlFor="dashboard-last-name">
												นามสกุล
											</label>
											<input
												id="dashboard-last-name"
												value={lastName}
												onChange={(event) => {
													setLastName(event.target.value);
													setProfileSaved(false);
													setProfileError(null);
												}}
												className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
												placeholder="นามสกุล"
											/>
										</div>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-slate-700" htmlFor="dashboard-email">
												Gmail
											</label>
											<input
												id="dashboard-email"
												type="email"
												value={email}
												onChange={(event) => {
													setEmail(event.target.value);
													setProfileSaved(false);
													setProfileError(null);
												}}
												className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
												placeholder="example@gmail.com"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700" htmlFor="dashboard-phone">
												เบอร์โทร
											</label>
											<input
												id="dashboard-phone"
												type="tel"
												value={phone}
												onChange={(event) => {
													setPhone(event.target.value);
													setProfileSaved(false);
													setProfileError(null);
												}}
												className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
												placeholder="0xxxxxxxxx"
											/>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-3">
										<button
											type="button"
											onClick={onSaveProfile}
											disabled={!canSaveProfile}
											className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
										>
											{profileSaving ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}
										</button>
										{profileSaved ? <span className="text-xs font-semibold text-green-700">บันทึกแล้ว</span> : null}
										{profileError ? <span className="text-xs font-semibold text-red-600">{profileError}</span> : null}
									</div>
								</div>

								<div className="rounded-xl border border-slate-200 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">รูปโปรไฟล์</p>
									<div className="mt-4">
										<ProfileImageUpload
											currentImageUrl={imageUrl}
											onUploaded={(newUrl) => setImageUrl(newUrl)}
										/>
									</div>
								</div>
							</div>
						</section>

						<section id="courses" className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${activeSection === 'courses' ? '' : 'hidden'}`}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">คอร์สที่ลงทะเบียนแล้ว</h2>
								</div>
								<Link className="text-xs font-semibold text-slate-700 hover:text-slate-900" href="/courses">
									ดูคอร์สทั้งหมด
								</Link>
							</div>

							{coursesError ? <p className="mt-4 text-sm text-red-600">{coursesError}</p> : null}
							{enrollments == null ? (
								<p className="mt-4 text-sm text-slate-500">กำลังโหลด…</p>
							) : enrollments.length === 0 ? (
								<p className="mt-4 text-sm text-slate-500">เมื่อคุณลงทะเบียนคอร์สแล้ว คอร์สจะแสดงที่นี่</p>
							) : (
								<div className="mt-6 grid grid-cols-1 justify-items-center gap-4 md:grid-cols-3">
									{enrollments.map((item) => (
										<div key={item.enrollmentId} className="w-[168px] sm:w-[220px]">
											<CourseCardWithProgress
												title={item.course.title}
												slug={item.course.slug}
												thumbnailUrl={item.course.thumbnailUrl}
												percentCompleted={item.progress?.percent ?? 0}
												continueLessonSlug={item.continueLessonSlug ?? null}
											/>
										</div>
									))}
								</div>
							)}

							<div className="mt-10">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<h3 className="text-lg font-semibold text-slate-900">คอร์สแนะนำ</h3>
								</div>

								{allCoursesError ? <p className="mt-4 text-sm text-red-600">{allCoursesError}</p> : null}
								{allCourses == null ? (
									<p className="mt-4 text-sm text-slate-500">กำลังโหลด…</p>
								) : recommendedCourses.length === 0 ? null : (
									<div className="mt-6 grid grid-cols-1 justify-items-center gap-4 md:grid-cols-3">
										{recommendedCourses.map((course) => (
											<div key={`${course.slug}-recommended`} className="w-[168px] sm:w-[220px]">
												<CourseCard course={course} />
											</div>
										))}
									</div>
								)}
							</div>
						</section>

						<section id="camp" className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${activeSection === 'camp' ? '' : 'hidden'}`}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">เช็กอินแคมป์</h2>
									<p className="text-sm text-slate-500">แคมป์และเวิร์กช็อปที่กำลังจะมาถึงจากร้านค้า</p>
								</div>
								<Link className="text-xs font-semibold text-slate-700 hover:text-slate-900" href="/shop">
									ดูแคมป์ทั้งหมด
								</Link>
							</div>

							{campError ? <p className="mt-4 text-sm text-red-600">{campError}</p> : null}
							{campItems == null ? (
								<p className="mt-4 text-sm text-slate-500">กำลังโหลด…</p>
							) : campItems.length === 0 ? (
								<p className="mt-4 text-sm text-slate-500">ขณะนี้ยังไม่มีแคมป์</p>
							) : (
								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									{campItems.slice(0, 4).map((item) => (
										<div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												alt={item.name}
												src={item.images?.[0] ?? '/shop/categories/camp.svg'}
												className="h-16 w-16 rounded-xl border border-slate-100 object-cover"
											/>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
												<p className="mt-1 text-xs text-slate-500">{item.description}</p>
												<p className="mt-2 text-xs font-semibold text-slate-800">{formatPrice(item.price)}</p>
											</div>
										</div>
									))}
								</div>
							)}
						</section>

						<section id="payments" className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${activeSection === 'payments' ? '' : 'hidden'}`}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">ประวัติการชำระเงินและติดตามการสั่งซื้อ</h2>
									<p className="text-sm text-slate-500">ติดตามการสั่งซื้อจากร้านค้าและรายการในตะกร้า</p>
								</div>
								<Link className="text-xs font-semibold text-slate-700 hover:text-slate-900" href="/cart">
									ไปที่ตะกร้า
								</Link>
							</div>

							<div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr,1fr]">
								<div className="rounded-2xl border border-slate-200 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">รายการในตะกร้าล่าสุด</p>
									{cartItems.length === 0 ? (
										<p className="mt-3 text-sm text-slate-500">ตะกร้าของคุณว่างอยู่</p>
									) : (
										<div className="mt-3 space-y-3">
											{cartItems.slice(0, 3).map((item) => (
												<div key={item.product.id} className="flex items-center justify-between gap-3">
													<p className="truncate text-sm text-slate-700">{item.product.name}</p>
													<p className="text-xs font-semibold text-slate-800">{formatPrice(item.product.price * item.quantity)}</p>
												</div>
											))}
											<div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
												<span className="text-slate-500">ยอดรวม</span>
												<span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
											</div>
										</div>
									)}
								</div>

								<div className="rounded-2xl border border-slate-200 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ประวัติการชำระเงิน</p>
									{ordersError ? <p className="mt-3 text-sm text-red-600">{ordersError}</p> : null}
									{checkError ? <p className="mt-3 text-sm text-red-600">{checkError}</p> : null}
									{orders == null ? (
										<p className="mt-3 text-sm text-slate-500">กำลังโหลดประวัติการชำระเงิน…</p>
									) : orders.length === 0 ? (
										<p className="mt-3 text-sm text-slate-500">ยังไม่มีรายการสั่งซื้อ</p>
									) : (
										<div className="mt-3 space-y-3">
											{orders.slice(0, 6).map((order) => {
												const refNo = referenceNoFromGatewayReference(order.gatewayReference);
												const canCheck = order.gateway === 'paysolutions' && order.status === 'pending' && Boolean(refNo);
												const lastCheck = lastPaymentCheckByOrderId[order.id];
												const canPayAgainPending = order.status === 'pending' && Boolean(lastCheck?.pending);
												const canPayAgain =
													order.gateway === 'paysolutions' &&
													(order.status === 'cancelled' || order.status === 'failed' || canPayAgainPending) &&
													order.items.every((it) => !paidProductIds.has(it.productId));
												return (
													<div key={order.id} className="rounded-xl border border-slate-200 p-3">
														<div className="flex items-start justify-between gap-3">
															<div className="min-w-0">
																<p className="truncate text-sm font-semibold text-slate-900">
																	คำสั่งซื้อ {order.id}
																</p>
																<p className="mt-1 text-xs text-slate-500">{formatOrderDate(order.createdAt) || ''}</p>
															</div>
															<div className="text-right">
																<p className="text-xs font-semibold text-slate-900">{formatPrice(order.total)}</p>
																{(order.discountTotal ?? 0) > 0 ? (
																	<p className="mt-1 text-[11px] text-slate-500">
																		คูปอง {order.couponCode || '-'} (-{formatPrice(order.discountTotal ?? 0)})
																	</p>
																) : null}
																<p className={`mt-1 text-[11px] font-semibold ${order.status === 'paid' ? 'text-green-700' : order.status === 'pending' ? 'text-amber-700' : 'text-slate-500'}`}>
																	{order.status.toUpperCase()}
																</p>
															</div>
														</div>

														{order.items.length ? (
															<p className="mt-2 text-xs text-slate-600">
																{order.items
																	.slice(0, 2)
																	.map((it) => it.name)
																	.join(', ')}
																{order.items.length > 2 ? '…' : ''}
															</p>
														) : null}

														{/* Shipping status badge + tracking number */}
														{order.status === 'paid' && (order.shippingStatus || order.trackingNumber) ? (
															<div className="mt-2 flex flex-wrap items-center gap-2">
																{order.shippingStatus ? (
																	<span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
																		order.shippingStatus === 'shipped' ? 'bg-orange-100 text-orange-700' :
																		order.shippingStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
																		order.shippingStatus === 'delivered' ? 'bg-green-100 text-green-700' :
																		'bg-yellow-100 text-yellow-700'
																	}`}>
																		{order.shippingStatus === 'pending' ? 'รอจัดส่ง' :
																		 order.shippingStatus === 'processing' ? 'จัดส่งให้ขนส่งแล้ว' :
																		 order.shippingStatus === 'shipped' ? 'จัดส่งแล้ว' :
																		 order.shippingStatus === 'delivered' ? 'ได้รับแล้ว' :
																		 order.shippingStatus === 'in_transit' ? 'กำลังจัดส่ง' :
																		 order.shippingStatus}
																	</span>
																) : null}
																{order.trackingNumber ? (
																	<span className="font-mono text-[10px] text-orange-600">{order.trackingNumber}</span>
																) : null}
															</div>
														) : null}

														<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
															{order.gatewayReference ? (
																<p className="text-[11px] text-slate-500">อ้างอิง: {order.gatewayReference}</p>
															) : (
																<p className="text-[11px] text-slate-500">อ้างอิง: -</p>
															)}
															<div className="flex items-center gap-2">
																{canCheck ? (
																	<button
																		type="button"
																		onClick={() => onCheckPayment(order)}
																		disabled={checkingRef === refNo}
																		className="rounded-lg bg-black px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
																	>
																		{checkingRef === refNo ? 'กำลังตรวจสอบ…' : 'ตรวจสอบการชำระเงิน'}
																	</button>
																) : null}
																{canPayAgain ? (
																	<button
																		type="button"
																		onClick={() => onPayAgain(order)}
																		disabled={payingOrderId === order.id}
																		className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
																	>
																		{payingOrderId === order.id ? 'กำลังเริ่ม…' : 'ชำระเงินอีกครั้ง'}
																	</button>
																) : null}
																{order.status === 'paid' && (order.trackingNumber || order.billCode) ? (
																	<button
																		type="button"
																		onClick={() => onViewTracking(order)}
																		disabled={trackingLoadingId === order.id}
																		className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
																	>
																		{trackingLoadingId === order.id ? 'กำลังโหลด…' : trackingByOrderId[order.id] ? 'ซ่อน' : 'ติดตามพัสดุ'}
																	</button>
																) : null}
															</div>
														</div>

														{/* Tracking timeline */}
														{trackingByOrderId[order.id] ? (() => {
															const tracking = trackingByOrderId[order.id];
															const allEvents = tracking.liveTraces.length > 0 ? tracking.liveTraces : tracking.events;
															return (
																<div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
																	<p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">ติดตามการจัดส่ง</p>
																	{tracking.billCode ? (
																		<p className="text-[11px] text-slate-600 mb-2">เลขพัสดุ: <span className="font-mono font-semibold text-slate-900">{tracking.billCode}</span></p>
																	) : null}
																	{allEvents.length === 0 ? (
																		<p className="text-[11px] text-slate-400">ยังไม่มีข้อมูลการเคลื่อนไหว</p>
																	) : (
																		<div className="space-y-2 max-h-48 overflow-y-auto">
																			{allEvents.slice(0, 10).map((ev, idx) => (
																				<div key={idx} className="flex gap-2 text-[11px]">
																					<div className="flex flex-col items-center">
																						<div className={`h-2 w-2 rounded-full mt-1 ${idx === 0 ? 'bg-orange-500' : 'bg-slate-300'}`} />
																						{idx < allEvents.slice(0, 10).length - 1 ? <div className="w-px flex-1 bg-slate-200" /> : null}
																					</div>
																					<div className="pb-2">
																						<p className={`font-semibold ${idx === 0 ? 'text-orange-700' : 'text-slate-700'}`}>
																							{ev.description || ev.scanType}
																						</p>
																						<p className="text-slate-400">
																							{ev.scanTime ? new Date(ev.scanTime).toLocaleString('th-TH') : ''}
																							{ev.scanCity || ev.province ? ` · ${ev.scanCity} ${ev.province}`.trim() : ''}
																						</p>
																					</div>
																				</div>
																			))}
																		</div>
																	)}
																</div>
															);
														})() : null}
													</div>
												);
											})}
											<div className="pt-2">
												<Link className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" href="/shop">
															เริ่มเลือกซื้อสินค้า
												</Link>
											</div>
										</div>
									)}
								</div>
							</div>
						</section>
					</section>
				</div>
			</div>
		</div>
	);
}
