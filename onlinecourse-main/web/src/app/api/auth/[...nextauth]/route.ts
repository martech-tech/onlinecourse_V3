import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

type LoginResponse = {
	user: {
		id: string;
		email: string;
		role: 'student' | 'admin';
		profileImage: string | null;
		name?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		phoneNumber?: string | null;
	};
};

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

function getCookieHeader(req: unknown): string {
	const maybeHeaders = (req as { headers?: unknown } | null | undefined)?.headers;
	const headers = maybeHeaders as (Record<string, unknown> & { get?: (name: string) => string | null }) | null;
	if (!headers) return '';
	if (typeof headers.get === 'function') return String(headers.get('cookie') || '');
	const cookieProp = (headers as { cookie?: unknown }).cookie;
	if (typeof cookieProp === 'string') return cookieProp;
	if (Array.isArray(cookieProp)) return cookieProp.map(String).join('; ');
	const cookieHeader = headers['cookie'];
	if (typeof cookieHeader === 'string') return cookieHeader;
	return '';
}

const handler = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
	jwt: { maxAge: 60 * 60 * 24 * 30 },
	providers: [
		Credentials({
			id: 'server-cookie',
			name: 'Server Cookie',
			credentials: {},
			authorize: async (_credentials, req) => {
				const cookie = getCookieHeader(req);
				const res = await fetch(`${apiBase()}/auth/me`, {
					method: 'GET',
					headers: cookie ? { cookie } : undefined,
					cache: 'no-store',
				});
				if (!res.ok) return null;
				const json = (await res.json()) as LoginResponse;
				return {
					id: json.user.id,
					email: json.user.email,
					role: json.user.role,
					name: json.user.name ?? undefined,
					firstName: json.user.firstName ?? undefined,
					lastName: json.user.lastName ?? undefined,
					phoneNumber: json.user.phoneNumber ?? undefined,
					image: json.user.profileImage ?? undefined,
				};
			},
		}),
		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			authorize: async (credentials) => {
				const email = String(credentials?.email || '').trim();
				const password = String(credentials?.password || '');
				if (!email || !password) return null;

				const res = await fetch(`${apiBase()}/auth/login`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ email, password }),
					cache: 'no-store',
				});
				if (!res.ok) return null;
				const json = (await res.json()) as LoginResponse;
				return {
					id: json.user.id,
					email: json.user.email,
					role: json.user.role,
					name: json.user.name ?? undefined,
					firstName: json.user.firstName ?? undefined,
					lastName: json.user.lastName ?? undefined,
					phoneNumber: json.user.phoneNumber ?? undefined,
					image: json.user.profileImage ?? undefined,
				};
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user, trigger, session }) => {
			if (user) {
				token.role = (user as { role?: string }).role;
				const uEmail = (user as { email?: unknown }).email;
				if (typeof uEmail === 'string' && uEmail.length > 0) token.email = uEmail;
				const n = (user as { name?: unknown }).name;
				if (typeof n === 'string') token.name = n;
				const fn = (user as { firstName?: unknown }).firstName;
				const ln = (user as { lastName?: unknown }).lastName;
				if (typeof fn === 'string') (token as unknown as { firstName?: string }).firstName = fn;
				if (typeof ln === 'string') (token as unknown as { lastName?: string }).lastName = ln;
				const pn = (user as { phoneNumber?: unknown }).phoneNumber;
				if (typeof pn === 'string') (token as unknown as { phoneNumber?: string }).phoneNumber = pn;
				const img = (user as { image?: string | null }).image;
				if (typeof img === 'string' && img.length > 0) {
					token.picture = img;
				}
			}

			// Allow client-side `useSession().update({ user: { ... } })` to persist.
			if (trigger === 'update') {
				const sUser = (session as { user?: Record<string, unknown> } | null | undefined)?.user;
				const maybeImage = sUser?.image;
				if (typeof maybeImage === 'string') token.picture = maybeImage;
				const maybeName = sUser?.name;
				if (typeof maybeName === 'string') token.name = maybeName;
				const maybeFirstName = sUser?.firstName;
				if (typeof maybeFirstName === 'string') (token as unknown as { firstName?: string }).firstName = maybeFirstName;
				const maybeLastName = sUser?.lastName;
				if (typeof maybeLastName === 'string') (token as unknown as { lastName?: string }).lastName = maybeLastName;
				const maybeEmail = sUser?.email;
				if (typeof maybeEmail === 'string' && maybeEmail.length > 0) token.email = maybeEmail;
				const maybePhone = sUser?.phoneNumber;
				if (typeof maybePhone === 'string') (token as unknown as { phoneNumber?: string }).phoneNumber = maybePhone;
			}
			return token;
		},
		session: async ({ session, token }) => {
			if (session.user) {
				(session.user as { role?: string }).role = token.role as string | undefined;
				(session.user as { email?: string | null }).email =
					typeof token.email === 'string' ? token.email : (session.user as { email?: string | null }).email;
				(session.user as { image?: string | null }).image =
					typeof token.picture === 'string' ? token.picture : session.user.image;
				(session.user as { name?: string | null }).name =
					typeof token.name === 'string' ? token.name : session.user.name;
				(session.user as { firstName?: string | null }).firstName =
					typeof (token as unknown as { firstName?: unknown }).firstName === 'string'
						? ((token as unknown as { firstName?: string }).firstName as string)
						: (session.user as { firstName?: string | null }).firstName;
				(session.user as { lastName?: string | null }).lastName =
					typeof (token as unknown as { lastName?: unknown }).lastName === 'string'
						? ((token as unknown as { lastName?: string }).lastName as string)
						: (session.user as { lastName?: string | null }).lastName;
				(session.user as { phoneNumber?: string | null }).phoneNumber =
					typeof (token as unknown as { phoneNumber?: unknown }).phoneNumber === 'string'
						? ((token as unknown as { phoneNumber?: string }).phoneNumber as string)
						: (session.user as { phoneNumber?: string | null }).phoneNumber;
			}
			return session;
		},
	},
});

export { handler as GET, handler as POST };
