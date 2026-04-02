import { NextResponse, type NextRequest } from "next/server";

type CreateSubscriptRequest = {
	amount?: number;
	items: Array<{ id: string; name: string; quantity: number; price: number }>;
	couponCode?: string;
	customer?: { email?: string; phone?: string };
	shipping?: { receiverName?: string; firstName?: string; lastName?: string; email?: string; phone?: string; address?: string };
};

function random12Digits() {
	return String(Math.floor(Math.random() * 900_000_000_000) + 100_000_000_000);
}

function buildProductDetail(items: CreateSubscriptRequest["items"]) {
	const names = items.map((item) => item.name).filter(Boolean);
	const joined = names.join(", ");
	const prefix = "Order ";
	const value = prefix + joined;
	return value.length > 200 ? value.slice(0, 197) + "…" : value;
}

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
	try {
		const cookieHeader = req.headers.get('cookie');
		const body = (await req.json()) as CreateSubscriptRequest;
		const amount = Number(body.amount) || 0;
		const items = Array.isArray(body.items) ? body.items : [];
		const isDevMode = process.env.NEXT_PUBLIC_PAYSOLUTIONS_DEV_MODE === "true";

		if (items.length === 0) {
			return NextResponse.json({ error: "No items" }, { status: 400 });
		}

		const merchantId = process.env.PAYSOLUTIONS_MERCHANT_ID;
		const paymentUrl = process.env.PAYSOLUTIONS_PAYMENT_URL || "https://www.thaiepay.com/epaylink/payment.aspx";

		if (!isDevMode && !merchantId) {
			return NextResponse.json({ error: "Missing PAYSOLUTIONS_MERCHANT_ID" }, { status: 500 });
		}

		// Mirrors demo_project backend: generate a unique-ish reference.
		const referenceNo = random12Digits();
		const reference = `trxn-${referenceNo}`;

		const productDetail = buildProductDetail(items);

		// Persist order + shipping info in backend DB (server app)
		let orderPublicId: string | null = null;
		let orderTotal: number | null = null;
		try {
			const orderRes = await fetch(`${apiBase()}/shop/orders`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...(cookieHeader ? { cookie: cookieHeader } : {}),
				},
				body: JSON.stringify({
					items,
					currency: "THB",
					couponCode: body.couponCode,
					customerEmail: body.customer?.email,
					customerPhone: body.customer?.phone,
					shipping: body.shipping,
					gatewayReference: reference,
				}),
				cache: "no-store",
			});

			if (!orderRes.ok) {
				const json = (await orderRes.json().catch(() => null)) as { error?: string; productIds?: string[] } | null;
				const msg = json?.error || "Failed to create order";
				return NextResponse.json(
					{ error: msg, productIds: Array.isArray(json?.productIds) ? json?.productIds : undefined },
					{ status: orderRes.status }
				);
			}

			const orderJson = (await orderRes.json()) as { orderPublicId?: string; total?: number };
			orderPublicId = typeof orderJson.orderPublicId === "string" ? orderJson.orderPublicId : null;
			orderTotal = typeof orderJson.total === "number" && Number.isFinite(orderJson.total) ? orderJson.total : null;
			if (!orderPublicId) {
				return NextResponse.json({ error: "Order created but missing orderPublicId" }, { status: 502 });
			}
		} catch {
			return NextResponse.json({ error: "Order service unavailable" }, { status: 502 });
		}

		// Note: demo_project stores to MySQL; this route just generates reference for redirect.
		const finalTotal = orderTotal ?? amount;
		if (!(finalTotal > 0)) {
			return NextResponse.json({ error: "Invalid total" }, { status: 400 });
		}

		// Dev mode: skip PaySolutions, immediately confirm order as paid
		if (isDevMode) {
			try {
				await fetch(`${apiBase()}/shop/orders/confirm`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						gatewayReference: reference,
						gatewayStatusCode: "DEV_PAID",
						paid: true,
						cancelled: false,
						raw: { devMode: true, simulatedAt: new Date().toISOString() },
					}),
					cache: "no-store",
				});
			} catch {
				return NextResponse.json({ error: "Dev mode: failed to confirm order" }, { status: 502 });
			}

			return NextResponse.json({
				devMode: true,
				reference,
				referenceNo,
				productDetail,
				orderPublicId,
				merchantId: merchantId || "DEV_MODE",
				paymentUrl: "",
				total: finalTotal,
			});
		}

		return NextResponse.json({
			reference,
			referenceNo,
			productDetail,
			orderPublicId,
			merchantId,
			paymentUrl,
			total: finalTotal,
		});
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
