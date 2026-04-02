"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider basePath="/api/nextauth">
			<CartProvider>{children}</CartProvider>
		</SessionProvider>
	);
}
