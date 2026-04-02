'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

export default function Header() {
	const router = useRouter();
	const pathname = usePathname();
	const { user, status } = useAuth();
	const { totalItems } = useCart();
	const [admin, setAdmin] = useState<null | { id: string; email?: string; role: 'admin' } | undefined>(undefined);
	const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
	const isAdmin = !!admin;

	const shouldHideAuthLinks = (() => {
		const rawPath = String(pathname || '');
		const normalized = rawPath.replace(/\/+$/, '') || '/';
		if (normalized === '/register') return true;
		if (normalized.startsWith('/register/')) return true;
		return false;
	})();

	useEffect(() => {
		let cancelled = false;

		async function loadAdmin() {
			try {
				const res = await fetch(`${apiBase()}/admin/me`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				});
				if (!res.ok) {
					if (!cancelled) setAdmin(null);
					return;
				}
				const json = (await res.json()) as { admin?: { id: string; email?: string; role: 'admin' } };
				if (!cancelled) setAdmin(json.admin ?? null);
			} catch {
				if (!cancelled) setAdmin(null);
			}
		}

		loadAdmin();
		return () => {
			cancelled = true;
		};
	}, []);

	async function onLogout() {
		try {
			await fetch(`${apiBase()}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			await signOut({ redirect: false });
			router.push('/');
			router.refresh();
		}
	}

	async function onAdminLogout() {
		try {
			await fetch(`${apiBase()}/admin/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			setAdmin(null);
			router.push('/admin/login');
			router.refresh();
		}
	}

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
				<div className="flex items-center gap-4">
					<Link href="/" className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900">
						<span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white">
							<Image
								src="/jlogo.webp"
								alt="โลโก้ J Knowledge Tutor"
								width={40}
								height={40}
								className="h-10 w-10 rounded-xl object-contain"
								priority
							/>
						</span>
						<span className="hidden sm:inline">J Knowledge Tutor</span>
					</Link>

					<nav className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-slate-200 md:flex">
						<Link href="/courses" className="rounded-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
							Courses
						</Link>
						<Link href="/shop" className="rounded-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
							Shop
						</Link>
						{user ? (
							<Link
								href="/dashboard"
								className="rounded-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
							>
								Dashboard
							</Link>
						) : null}
					</nav>
				</div>

				<div className="flex items-center gap-3">
					{isAdmin ? (
						<>
							<Link href="/admin" className="flex items-center gap-2">
								<span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br text-sm font-extrabold text-white">
									A
								</span>
								<span className="hidden text-sm font-semibold text-slate-700 sm:inline">แอดมิน</span>
							</Link>
							<button
								type="button"
								onClick={onAdminLogout}
								className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
							>
								ออกจากระบบแอดมิน
							</button>
						</>
					) : status === 'loading' ? null : !user ? (
						shouldHideAuthLinks ? null : (
							<>
								<Link
									className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
									href="/login"
								>
									เข้าสู่ระบบ
								</Link>
								{/* <Link
									className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-amber-500"
									href="/register"
								>
									สมัครสมาชิก
								</Link> */}
							</>
						)
					) : (
						<>
							<Link href="/dashboard" className="flex items-center gap-2">
								{user.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										alt="รูปผู้ใช้"
										src={user.image}
										className="h-8 w-8 max-h-8 max-w-8 rounded-full object-cover ring-1 ring-slate-200"
									/>
								) : (
									<div className="h-8 w-8 rounded-full bg-slate-200" />
								)}
								<span className="hidden text-sm font-semibold text-slate-700 sm:inline">
									{fullName || user.name || user.email}
								</span>
							</Link>
							<Link
								href="/cart"
								className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600"
							>
								<ShoppingCart className="h-4 w-4" />
								<span className="rounded-full bg-orange-500 px-2 text-white">{totalItems}</span>
							</Link>
							<button
								type="button"
								onClick={onLogout}
								className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
							>
								ออกจากระบบ
							</button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
