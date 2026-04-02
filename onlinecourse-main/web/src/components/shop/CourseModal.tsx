import { formatPrice, type ShopProduct } from "@/lib/shop";

type Props = {
	product: ShopProduct;
	onClose: () => void;
};

export default function CourseModal({ product, onClose }: Props) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-sm font-semibold text-orange-500">รายละเอียดคอร์ส</p>
						<h3 className="text-2xl font-bold text-slate-900">{product.name}</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
					>
						ปิด
					</button>
				</div>
				<p className="mt-4 text-sm text-slate-600">{product.description}</p>
				{product.details ? (
					<p className="mt-2 text-sm text-slate-500">{product.details}</p>
				) : null}
				<div className="mt-6 flex items-center justify-between">
					<div>
						<p className="text-xs text-slate-400 line-through">
							{formatPrice(product.compareAtPrice)}
						</p>
						<p className="text-2xl font-bold text-orange-600">
							{formatPrice(product.price)}
						</p>
					</div>
					<button
						type="button"
						className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
					>
						ซื้อคอร์ส
					</button>
				</div>
			</div>
		</div>
	);
}
