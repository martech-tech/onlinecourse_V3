"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ShopProduct } from "@/lib/shop";

export type CartItem = {
	product: ShopProduct;
	quantity: number;
};

type CartContextValue = {
	items: CartItem[];
	addItem: (product: ShopProduct, quantity?: number) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	removeItem: (productId: string) => void;
	clearCart: () => void;
	totalItems: number;
	subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "jk-cart";

function readCartFromSession(): CartItem[] {
	if (typeof window === "undefined") return [];
	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as CartItem[];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item) => item && item.product && typeof item.quantity === "number");
	} catch {
		return [];
	}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const hasLoadedRef = useRef(false);

	useEffect(() => {
		const stored = readCartFromSession();
		setItems(stored);
		hasLoadedRef.current = true;
	}, []);

	useEffect(() => {
		if (!hasLoadedRef.current) return;
		if (typeof window === "undefined") return;
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}, [items]);

	const addItem = useCallback((product: ShopProduct, quantity: number = 1) => {
		setItems((prev) => {
			const existing = prev.find((item) => item.product.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + quantity }
						: item
				);
			}
			return [...prev, { product, quantity }];
		});
	}, []);

	const updateQuantity = useCallback((productId: string, quantity: number) => {
		setItems((prev) => {
			if (quantity <= 0) return prev.filter((item) => item.product.id !== productId);
			return prev.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item
			);
		});
	}, []);

	const removeItem = useCallback((productId: string) => {
		setItems((prev) => prev.filter((item) => item.product.id !== productId));
	}, []);

	const clearCart = useCallback(() => {
		setItems([]);
	}, []);

	const totalItems = useMemo(
		() => items.reduce((total, item) => total + item.quantity, 0),
		[items]
	);

	const subtotal = useMemo(
		() => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
		[items]
	);

	const value = useMemo(
		() => ({ items, addItem, updateQuantity, removeItem, clearCart, totalItems, subtotal }),
		[items, addItem, updateQuantity, removeItem, clearCart, totalItems, subtotal]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) throw new Error("useCart must be used within CartProvider");
	return context;
}