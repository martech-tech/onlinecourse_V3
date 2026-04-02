'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
	const { data, status, update } = useSession();
	return {
		user: data?.user ?? null,
		status,
		updateSession: update,
	};
}
