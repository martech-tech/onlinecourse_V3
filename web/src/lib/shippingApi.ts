/**
 * Shipping API functions - J&T Express Integration
 *
 * These functions call the server's /shipping endpoints.
 * Import into your checkout/tracking pages.
 */

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShippingAddress = {
	receiverName: string;
	receiverPhone: string;
	receiverAddress: string;
	receiverProvince: string;
	receiverCity: string;
	receiverDistrict: string;
	receiverPostCode: string;
};

export type ShippingStatus =
	| 'pending'
	| 'submitted'
	| 'picked_up'
	| 'in_transit'
	| 'out_for_delivery'
	| 'delivered'
	| 'cancelled'
	| 'failed';

export type TrackingEvent = {
	scanType: string;
	description: string;
	scanTime: string;
	scanCity: string;
	province?: string;
	entrySiteName?: string;
	sigPicUrl?: string | null;
	remark?: string | null;
};

export type TrackingInfo = {
	shipping: {
		orderPublicId: string;
		billCode: string | null;
		txlogisticId: string;
		status: ShippingStatus;
		receiver: {
			name: string;
			phone: string;
			address: string;
			province: string;
			city: string;
			district: string;
			postCode: string;
		};
		createdAt: string;
		updatedAt: string;
	};
	events: TrackingEvent[];
	liveTraces: TrackingEvent[];
};

export type CreateShipmentResult = {
	ok: boolean;
	billCode: string;
	sortCode: string;
	txlogisticId: string;
	message: string;
};

// ---------------------------------------------------------------------------
// Status display helpers
// ---------------------------------------------------------------------------

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
	pending: 'รอดำเนินการ',
	submitted: 'สร้างเลขพัสดุแล้ว',
	picked_up: 'รับพัสดุแล้ว',
	in_transit: 'กำลังขนส่ง',
	out_for_delivery: 'กำลังนำจ่าย',
	delivered: 'จัดส่งสำเร็จ',
	cancelled: 'ยกเลิก',
	failed: 'จัดส่งไม่สำเร็จ',
};

export const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
	pending: 'bg-gray-100 text-gray-700',
	submitted: 'bg-blue-100 text-blue-700',
	picked_up: 'bg-indigo-100 text-indigo-700',
	in_transit: 'bg-yellow-100 text-yellow-700',
	out_for_delivery: 'bg-orange-100 text-orange-700',
	delivered: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-700',
	failed: 'bg-red-100 text-red-700',
};

/**
 * Map J&T scanType to Thai label for timeline display
 */
export const SCAN_TYPE_LABELS: Record<string, string> = {
	'Picked Up': 'รับพัสดุแล้ว',
	'Departure': 'สแกนนำส่งพัสดุ',
	'Arrival': 'พัสดุถึงศูนย์คัดแยก',
	'On Delivery': 'กำลังนำจ่ายพัสดุ',
	'Signature': 'เซ็นรับพัสดุแล้ว',
	'Problematic': 'พัสดุมีปัญหา',
	'Return Confirmation': 'พัสดุตีกลับ',
	'Return Signature': 'เซ็นรับพัสดุตีกลับ',
	'waybill closed': 'ปิดงานพัสดุ',
};

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Save shipping address for an order (pre-payment step)
 */
export async function saveShippingAddress(orderPublicId: string, address: ShippingAddress): Promise<{ ok: boolean; message: string }> {
	const res = await fetch(`${apiBase()}/shipping/address`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ orderPublicId, ...address }),
	});
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(json?.error || 'บันทึกที่อยู่จัดส่งไม่สำเร็จ');
	}
	return (await res.json()) as { ok: boolean; message: string };
}

/**
 * Get tracking info for an order (requires auth)
 */
export async function getOrderTracking(orderPublicId: string): Promise<TrackingInfo> {
	const res = await fetch(`${apiBase()}/shipping/tracking/${encodeURIComponent(orderPublicId)}`, {
		cache: 'no-store',
		credentials: 'include',
	});
	if (res.status === 404) throw new Error('NOT_FOUND');
	if (res.status === 401) throw new Error('UNAUTHORIZED');
	if (!res.ok) throw new Error('โหลดข้อมูลการจัดส่งไม่สำเร็จ');
	return (await res.json()) as TrackingInfo;
}

/**
 * Get tracking by bill code (public, no auth needed)
 */
export async function getTrackingByBillCode(billCode: string): Promise<TrackingInfo> {
	const res = await fetch(`${apiBase()}/shipping/track?billCode=${encodeURIComponent(billCode)}`, {
		cache: 'no-store',
	});
	if (res.status === 404) throw new Error('NOT_FOUND');
	if (!res.ok) throw new Error('โหลดข้อมูลการจัดส่งไม่สำเร็จ');
	return (await res.json()) as TrackingInfo;
}

/**
 * Create J&T shipment for an order (admin only)
 */
export async function createShipment(orderPublicId: string): Promise<CreateShipmentResult> {
	const res = await fetch(`${apiBase()}/shipping/shipment`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ orderPublicId }),
	});
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string; jtMessage?: string } | null;
		throw new Error(json?.error || 'สร้างเลขพัสดุไม่สำเร็จ');
	}
	return (await res.json()) as CreateShipmentResult;
}

/**
 * Cancel shipment (admin only)
 */
export async function cancelShipment(orderPublicId: string, reason?: string): Promise<{ ok: boolean; message: string }> {
	const res = await fetch(`${apiBase()}/shipping/cancel`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ orderPublicId, reason }),
	});
	if (!res.ok) {
		const json = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(json?.error || 'ยกเลิกการจัดส่งไม่สำเร็จ');
	}
	return (await res.json()) as { ok: boolean; message: string };
}

// ---------------------------------------------------------------------------
// Thailand provinces list (for address form dropdown)
// ---------------------------------------------------------------------------

export const THAI_PROVINCES = [
	'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
	'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
	'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
	'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
	'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
	'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
	'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
	'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
	'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
	'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
	'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
	'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
	'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
	'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
	'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
	'อุทัยธานี', 'อุบลราชธานี',
];
