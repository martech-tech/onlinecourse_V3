/**
 * J&T Express Thailand - Open Platform API Client
 * Demo API: https://demoopenapi.jtexpress.co.th
 *
 * All endpoints use POST with `bizContent` form param (JSON string).
 * Auth: apiAccount header + digest (base64(md5(bizContent + apiKey)))
 *
 * Each endpoint has its own full URL including ?uuid=...&pid=...
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Config (loaded from env)
// ---------------------------------------------------------------------------

function getConfig() {
	const apiAccount = process.env.JT_API_ACCOUNT;
	const apiKey = process.env.JT_API_KEY;
	const customerCode = process.env.JT_CUSTOMER_CODE;

	// Full endpoint URLs (each has unique pid)
	const createOrderUrl = process.env.JT_URL_CREATE_ORDER;
	const cancelOrderUrl = process.env.JT_URL_CANCEL_ORDER;
	const trackingQueryUrl = process.env.JT_URL_TRACKING_QUERY;

	if (!apiAccount || !apiKey || !customerCode) {
		throw new Error('Missing J&T Express env vars: JT_API_ACCOUNT, JT_API_KEY, JT_CUSTOMER_CODE');
	}
	if (!createOrderUrl) {
		throw new Error('Missing JT_URL_CREATE_ORDER env var');
	}

	return {
		apiAccount,
		apiKey,
		customerCode,
		createOrderUrl,
		cancelOrderUrl: cancelOrderUrl || '',
		trackingQueryUrl: trackingQueryUrl || '',
		// Default sender from env (shop's warehouse address)
		sender: {
			name: process.env.JT_SENDER_NAME || '',
			phone: process.env.JT_SENDER_PHONE || '',
			mobile: process.env.JT_SENDER_PHONE || '',
			countryCode: 'THA',
			prov: process.env.JT_SENDER_PROVINCE || '',
			city: process.env.JT_SENDER_CITY || '',
			area: process.env.JT_SENDER_DISTRICT || '',
			address: process.env.JT_SENDER_ADDRESS || '',
			postCode: process.env.JT_SENDER_POST_CODE || '',
		},
	};
}

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

/**
 * Generate digest signature for J&T API
 * digest = base64( md5( bizContent + apiKey ) )
 */
function generateDigest(bizContentJson, apiKey) {
	const raw = bizContentJson + apiKey;
	const md5Hash = crypto.createHash('md5').update(raw, 'utf8').digest();
	return md5Hash.toString('base64');
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

/**
 * Call a J&T API endpoint.
 * @param {string} fullUrl - Complete endpoint URL (including ?uuid=...&pid=...)
 * @param {object} bizContent - The request body object (will be JSON-stringified)
 */
async function callApi(fullUrl, bizContent) {
	const config = getConfig();
	const bizContentJson = JSON.stringify(bizContent);
	const digest = generateDigest(bizContentJson, config.apiKey);
	const timestamp = String(Date.now());

	const params = new URLSearchParams();
	params.append('bizContent', bizContentJson);

	const res = await fetch(fullUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			apiAccount: config.apiAccount,
			digest,
			timestamp,
		},
		body: params.toString(),
	});

	const text = await res.text();
	let json;
	try {
		json = JSON.parse(text);
	} catch {
		throw new Error(`J&T API returned non-JSON (status ${res.status}): ${text.substring(0, 500)}`);
	}

	return json;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Create a shipping order with J&T Express
 *
 * @param {Object} params
 * @param {string} params.txlogisticId  - Our unique order reference
 * @param {Object} params.receiver      - { name, phone, address, province, city, district, postCode }
 * @param {Object[]} params.items       - [{ name, quantity, value }]
 * @param {number} params.weight        - Package weight in kg
 * @param {number} [params.length]      - cm
 * @param {number} [params.width]       - cm
 * @param {number} [params.height]      - cm
 * @param {number} [params.itemsValue]  - Total declared value
 * @param {string} [params.remark]
 *
 * @returns {Promise<{ success: boolean, billCode?: string, sortCode?: string, raw: object }>}
 */
async function createOrder(params) {
	const config = getConfig();

	const bizContent = {
		customerCode: config.customerCode,
		digest: '', // computed at HTTP level by callApi
		network: '',
		txlogisticId: params.txlogisticId,
		expressType: process.env.JT_EXPRESS_TYPE || 'EZ',
		orderType: 1,
		serviceType: 1,
		deliveryType: 1,
		payType: 1, // 1 = sender pays
		sender: config.sender,
		receiver: {
			name: params.receiver.name,
			phone: params.receiver.phone,
			mobile: params.receiver.phone,
			countryCode: 'THA',
			prov: params.receiver.province || '',
			city: params.receiver.city || '',
			area: params.receiver.district || '',
			address: params.receiver.address,
			postCode: params.receiver.postCode || '',
		},
		weight: String(params.weight || 1),
		itemsValue: String(params.itemsValue || 0),
		priceCurrency: 'THB',
		goodsType: 'bm000006',
		length: params.length || 10,
		width: params.width || 10,
		height: params.height || 10,
		totalQuantity: (params.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0) || 1,
		remark: params.remark || '',
		items: (params.items || []).map((item) => ({
			itemName: item.name || 'สินค้า',
			number: item.quantity || 1,
			itemValue: String(item.value || 0),
		})),
	};

	const raw = await callApi(config.createOrderUrl, bizContent);

	// J&T response: { code: "1", msg: "success", data: { txlogisticId, billCode, sortCode, ... } }
	const success = String(raw.code) === '1';
	const data = raw.data || {};

	return {
		success,
		billCode: data.billCode || null,
		sortCode: data.sortCode || null,
		txlogisticId: data.txlogisticId || params.txlogisticId,
		message: raw.msg || '',
		raw,
	};
}

/**
 * Cancel a shipping order
 *
 * @param {Object} params
 * @param {string} params.txlogisticId
 * @param {string} [params.reason]
 *
 * @returns {Promise<{ success: boolean, message: string, raw: object }>}
 */
async function cancelOrder(params) {
	const config = getConfig();
	if (!config.cancelOrderUrl) throw new Error('JT_URL_CANCEL_ORDER not configured');

	const bizContent = {
		customerCode: config.customerCode,
		digest: '',
		orderType: 1,
		txlogisticId: params.txlogisticId,
		reason: params.reason || 'ยกเลิกคำสั่งซื้อ',
	};

	const raw = await callApi(config.cancelOrderUrl, bizContent);
	const success = String(raw.code) === '1';

	return {
		success,
		message: raw.msg || '',
		raw,
	};
}

/**
 * Query tracking information for one or more bill codes
 *
 * @param {string|string[]} billCodes - Single or array of tracking numbers
 * @returns {Promise<{ success: boolean, traces: object[], raw: object }>}
 */
async function queryTracking(billCodes) {
	const config = getConfig();
	if (!config.trackingQueryUrl) throw new Error('JT_URL_TRACKING_QUERY not configured');

	const codes = Array.isArray(billCodes) ? billCodes.join(',') : billCodes;

	const bizContent = {
		billCodes: codes,
		lang: 'th',
	};

	const raw = await callApi(config.trackingQueryUrl, bizContent);
	const success = String(raw.code) === '1';
	const data = raw.data || [];

	// data is an array of { billCode, details: [{ scanTime, scanType, city, province, ... }] }
	return {
		success,
		traces: Array.isArray(data) ? data : [],
		message: raw.msg || '',
		raw,
	};
}

// ---------------------------------------------------------------------------
// Callback / Webhook helpers
// ---------------------------------------------------------------------------

/**
 * Verify the digest from J&T callback webhook.
 * J&T sends callbacks with a digest header: base64(md5(body + apiKey)).
 */
function verifyCallbackDigest(bodyString, receivedDigest) {
	const config = getConfig();
	const expected = generateDigest(bodyString, config.apiKey);
	return expected === receivedDigest;
}

/**
 * Map J&T scanType from callback to our shipping status.
 *
 * Real callback scanType values:
 *   "Picked Up"           → picked_up
 *   "Departure"           → in_transit
 *   "Arrival"             → in_transit
 *   "On Delivery"         → out_for_delivery
 *   "Signature"           → delivered
 *   "Problematic"         → failed
 *   "Return Confirmation" → failed
 *   "Return Signature"    → failed
 *   "waybill closed"      → delivered
 */
function mapScanTypeToStatus(scanType) {
	const type = String(scanType || '').toLowerCase().trim();
	const mapping = {
		'picked up': 'picked_up',
		'departure': 'in_transit',
		'arrival': 'in_transit',
		'on delivery': 'out_for_delivery',
		'signature': 'delivered',
		'problematic': 'failed',
		'return confirmation': 'failed',
		'return signature': 'failed',
		'waybill closed': 'delivered',
	};
	return mapping[type] || null;
}

/**
 * Get a Thai-language label for a scanType
 */
function scanTypeLabel(scanType) {
	const type = String(scanType || '').toLowerCase().trim();
	const labels = {
		'picked up': 'รับพัสดุแล้ว',
		'departure': 'สแกนนำส่งพัสดุ',
		'arrival': 'พัสดุถึงศูนย์คัดแยก',
		'on delivery': 'กำลังนำจ่ายพัสดุ',
		'signature': 'เซ็นรับพัสดุแล้ว',
		'problematic': 'พัสดุมีปัญหา',
		'return confirmation': 'พัสดุตีกลับ',
		'return signature': 'เซ็นรับพัสดุตีกลับ',
		'waybill closed': 'ปิดงานพัสดุ',
	};
	return labels[type] || scanType;
}

module.exports = {
	getConfig,
	generateDigest,
	callApi,
	createOrder,
	cancelOrder,
	queryTracking,
	verifyCallbackDigest,
	mapScanTypeToStatus,
	scanTypeLabel,
};
