"use client";

import { useState, useEffect, useCallback } from "react";
import {
	saveShippingAddress,
	THAI_PROVINCES,
	type ShippingAddress,
} from "@/lib/shippingApi";

const STORAGE_KEY = "jk-shipping-address";

type Props = {
	orderPublicId: string;
	/** Called after address is saved successfully */
	onSaved?: (address: ShippingAddress) => void;
	/** Pre-fill from user profile */
	defaultValues?: Partial<ShippingAddress>;
	/** If true, shows a compact view without the save button (auto-saves) */
	inline?: boolean;
};

function readFromStorage(): Partial<ShippingAddress> {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function writeToStorage(addr: ShippingAddress) {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(addr));
}

export default function ShippingAddressForm({
	orderPublicId,
	onSaved,
	defaultValues,
	inline,
}: Props) {
	const [form, setForm] = useState<ShippingAddress>({
		receiverName: "",
		receiverPhone: "",
		receiverAddress: "",
		receiverProvince: "",
		receiverCity: "",
		receiverDistrict: "",
		receiverPostCode: "",
	});

	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Initialize from storage / defaults
	useEffect(() => {
		const stored = readFromStorage();
		setForm((prev) => ({
			receiverName: stored.receiverName || defaultValues?.receiverName || prev.receiverName,
			receiverPhone: stored.receiverPhone || defaultValues?.receiverPhone || prev.receiverPhone,
			receiverAddress: stored.receiverAddress || defaultValues?.receiverAddress || prev.receiverAddress,
			receiverProvince: stored.receiverProvince || defaultValues?.receiverProvince || prev.receiverProvince,
			receiverCity: stored.receiverCity || defaultValues?.receiverCity || prev.receiverCity,
			receiverDistrict: stored.receiverDistrict || defaultValues?.receiverDistrict || prev.receiverDistrict,
			receiverPostCode: stored.receiverPostCode || defaultValues?.receiverPostCode || prev.receiverPostCode,
		}));
	}, [defaultValues?.receiverName, defaultValues?.receiverPhone, defaultValues?.receiverAddress, defaultValues?.receiverProvince, defaultValues?.receiverCity, defaultValues?.receiverDistrict, defaultValues?.receiverPostCode]);

	// Persist to session storage on change
	useEffect(() => {
		writeToStorage(form);
	}, [form]);

	const update = useCallback(
		(field: keyof ShippingAddress, value: string) => {
			setForm((prev) => ({ ...prev, [field]: value }));
			setSaved(false);
			setError(null);
		},
		[]
	);

	async function handleSave() {
		setError(null);
		if (!form.receiverName.trim()) return setError("กรุณากรอกชื่อผู้รับ");
		if (!form.receiverPhone.trim()) return setError("กรุณากรอกเบอร์โทรศัพท์");
		if (!form.receiverAddress.trim()) return setError("กรุณากรอกที่อยู่");
		if (!form.receiverProvince) return setError("กรุณาเลือกจังหวัด");
		if (!form.receiverDistrict.trim()) return setError("กรุณากรอกอำเภอ/เขต");
		if (!form.receiverPostCode.trim()) return setError("กรุณากรอกรหัสไปรษณีย์");

		setSaving(true);
		try {
			await saveShippingAddress(orderPublicId, form);
			setSaved(true);
			onSaved?.(form);
		} catch (e) {
			setError(e instanceof Error ? e.message : "บันทึกที่อยู่ไม่สำเร็จ");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-semibold text-slate-900">
					ที่อยู่จัดส่ง (J&T Express)
				</h3>
				<p className="mt-0.5 text-xs text-slate-500">
					กรุณากรอกข้อมูลให้ครบถ้วนเพื่อการจัดส่งที่ถูกต้อง
				</p>
			</div>

			{/* Receiver name */}
			<div>
				<label className="text-xs font-semibold text-slate-600">
					ชื่อผู้รับ <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={form.receiverName}
					onChange={(e) => update("receiverName", e.target.value)}
					className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
					placeholder="ชื่อ-นามสกุล"
				/>
			</div>

			{/* Phone */}
			<div>
				<label className="text-xs font-semibold text-slate-600">
					เบอร์โทรศัพท์ <span className="text-red-500">*</span>
				</label>
				<input
					type="tel"
					value={form.receiverPhone}
					onChange={(e) => update("receiverPhone", e.target.value)}
					className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
					placeholder="0812345678"
				/>
			</div>

			{/* Province */}
			<div>
				<label className="text-xs font-semibold text-slate-600">
					จังหวัด <span className="text-red-500">*</span>
				</label>
				<select
					value={form.receiverProvince}
					onChange={(e) => update("receiverProvince", e.target.value)}
					className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
				>
					<option value="">-- เลือกจังหวัด --</option>
					{THAI_PROVINCES.map((prov) => (
						<option key={prov} value={prov}>
							{prov}
						</option>
					))}
				</select>
			</div>

			{/* City & District */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className="text-xs font-semibold text-slate-600">
						อำเภอ/เขต <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						value={form.receiverDistrict}
						onChange={(e) => update("receiverDistrict", e.target.value)}
						className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
						placeholder="อำเภอ/เขต"
					/>
				</div>
				<div>
					<label className="text-xs font-semibold text-slate-600">
						ตำบล/แขวง
					</label>
					<input
						type="text"
						value={form.receiverCity}
						onChange={(e) => update("receiverCity", e.target.value)}
						className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
						placeholder="ตำบล/แขวง"
					/>
				</div>
			</div>

			{/* Address */}
			<div>
				<label className="text-xs font-semibold text-slate-600">
					ที่อยู่ (บ้านเลขที่ ซอย ถนน) <span className="text-red-500">*</span>
				</label>
				<textarea
					value={form.receiverAddress}
					onChange={(e) => update("receiverAddress", e.target.value)}
					className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
					placeholder="บ้านเลขที่ หมู่ ซอย ถนน"
				/>
			</div>

			{/* Post code */}
			<div className="w-40">
				<label className="text-xs font-semibold text-slate-600">
					รหัสไปรษณีย์ <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={form.receiverPostCode}
					onChange={(e) => update("receiverPostCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
					className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
					placeholder="10240"
					maxLength={5}
				/>
			</div>

			{/* Error */}
			{error && (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{error}
				</div>
			)}

			{/* Success */}
			{saved && !error && (
				<div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
					บันทึกที่อยู่จัดส่งสำเร็จ
				</div>
			)}

			{/* Save button */}
			{!inline && (
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{saving ? "กำลังบันทึก..." : "บันทึกที่อยู่จัดส่ง"}
				</button>
			)}
		</div>
	);
}
