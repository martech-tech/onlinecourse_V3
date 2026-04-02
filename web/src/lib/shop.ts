export type Category = "course" | "book" | "camp" | "other";

export type ShopProduct = {
	id: string;
	name: string;
	category: Category;
	description: string;
	details?: string;
	tags?: string[];
	price: number;
	compareAtPrice: number;
	images: string[];
	stockLeft: number;
	soldCount: string;
	externalUrl?: string;
	badge?: string;
};

export type ShopBanner = {
	title: string;
	subtitle: string;
	image: string;
};

export const SHOP_CATEGORIES: { key: Category | "all"; label: string }[] = [
	{ key: "all", label: "ทั้งหมด" },
	{ key: "course", label: "คอร์สออนไลน์" },
	{ key: "book", label: "หนังสือ" },
	{ key: "camp", label: "แคมป์/เวิร์กช็อป" },
	{ key: "other", label: "สินค้าอื่นๆ" },
];

export function formatPrice(value: number) {
	return `${value.toFixed(2)}฿`;
}
