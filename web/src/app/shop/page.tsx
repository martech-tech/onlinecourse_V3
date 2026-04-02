import React from "react";
import ShopClientContent from "./ShopClientContent";

export default function ShopPage() {
	return (
		<React.Suspense fallback={<div className="p-6 text-sm text-slate-600">กำลังโหลด…</div>}>
			<ShopClientContent />
		</React.Suspense>
	);
}
