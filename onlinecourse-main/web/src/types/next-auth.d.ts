import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
	interface Session {
		user?: {
			id?: string;
			email?: string | null;
			name?: string | null;
			firstName?: string | null;
			lastName?: string | null;
			phoneNumber?: string | null;
			image?: string | null;
			role?: string;
		};
	}

	interface User {
		role?: string;
		firstName?: string | null;
		lastName?: string | null;
		phoneNumber?: string | null;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role?: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
	}
}
