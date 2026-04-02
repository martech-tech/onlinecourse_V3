import { NextResponse, type NextRequest } from "next/server";

type RequestSubscriptionBody = {
	referenceNo: string;
	productDetail?: string;
};

type PaySolutionsOrderDetailRow = {
	Status?: string;
	[key: string]: unknown;
};

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`Missing ${name}`);
	return value;
}

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as Partial<RequestSubscriptionBody>;
		const referenceNo = String(body.referenceNo || "").trim();
		if (!referenceNo) {
			return NextResponse.json({ error: "Missing referenceNo" }, { status: 400 });
		}

		const isDevMode = process.env.NEXT_PUBLIC_PAYSOLUTIONS_DEV_MODE === "true";

		// Dev mode: order was already confirmed as paid in create-subscript,
		// just return paid status without calling PaySolutions API
		if (isDevMode) {
			return NextResponse.json({
				status: "DEV_PAID",
				paid: true,
				pending: false,
				cancelled: false,
				raw: { devMode: true, referenceNo },
			});
		}

		const url =
			process.env.PAYSOLUTIONS_ORDER_DETAIL_URL ||
			"https://apis.paysolutions.asia/order/orderdetailpost";

		const merchantId = requiredEnv("PAYSOLUTIONS_MERCHANT_ID");
		const merchantSecretKey = requiredEnv("PAYSOLUTIONS_MERCHANT_SECRET_KEY");
		const apiKey = requiredEnv("PAYSOLUTIONS_API_KEY");
		const orderNo = process.env.PAYSOLUTIONS_ORDER_NO || "x";

		const payload = {
			merchantId,
			orderNo,
			refNo: referenceNo,
			productDetail: body.productDetail || "Order",
		};

		const upstream = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				merchantId,
				merchantSecretKey,
				apikey: apiKey,
			},
			body: JSON.stringify(payload),
			cache: "no-store",
		});

		if (!upstream.ok) {
			const text = await upstream.text().catch(() => "");
			return NextResponse.json(
				{ error: text || "PaySolutions request failed" },
				{ status: 502 }
			);
		}

		const json = (await upstream.json()) as unknown;
		const rows = Array.isArray(json) ? (json as PaySolutionsOrderDetailRow[]) : [];
		const status = rows[0]?.Status;

		const paid = status === "TC" || status === "CP" || status === "Y";
		const pending = status === "N";
		const cancelled = status === "C";

		// Best-effort: persist payment status to backend DB
		try {
			await fetch(`${apiBase()}/shop/orders/confirm`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					gatewayReference: `trxn-${referenceNo}`,
					gatewayStatusCode: status ?? null,
					paid,
					cancelled,
					raw: rows[0] ?? null,
				}),
				cache: "no-store",
			});
		} catch {
			// ignore
		}

		return NextResponse.json({
			status: status ?? null,
			paid,
			pending,
			cancelled,
			raw: rows[0] ?? null,
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
