'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/lib/useAuth';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

type ProfileImageUploadProps = {
	currentImageUrl?: string | null;
	onUploaded?: (newImageUrl: string | null) => void;
};

type UpdateProfileResponse = {
	user?: {
		profileImage?: string | null;
		profileImageUrl?: string | null;
		image?: string | null;
	};
	profileImage?: string | null;
	profileImageUrl?: string | null;
};

export default function ProfileImageUpload({ currentImageUrl, onUploaded }: ProfileImageUploadProps) {
	const { user, updateSession } = useAuth();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	type SaveStatus = 'idle' | 'saved';
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

	const displayedImageUrl = useMemo(
		() => previewUrl || currentImageUrl || user?.image || null,
		[previewUrl, currentImageUrl, user?.image]
	);

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	function onPickFile(file: File | null) {
		setError(null);
		setSaveStatus('idle');
		setSelectedFile(null);

		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);

		if (!file) return;
		if (!file.type.startsWith('image/')) {
			setError('กรุณาเลือกไฟล์รูปภาพ');
			return;
		}

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	}

	async function onSave() {
		if (!selectedFile) {
			setError('กรุณาเลือกรูปก่อน');
			return;
		}

		setSaving(true);
		setError(null);
		setSaveStatus('idle');
		try {
			const form = new FormData();
			// Backend should read this field via multer (e.g. upload.single('profileImage')).
			form.append('profileImage', selectedFile);

			const res = await fetch(`${apiBase()}/user/profile`, {
				method: 'PUT',
				credentials: 'include',
				body: form,
			});

			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as { error?: string } | null;
				throw new Error(json?.error || 'อัปเดตรูปโปรไฟล์ไม่สำเร็จ');
			}

			const json = (await res.json().catch(() => null)) as UpdateProfileResponse | null;
			const newUrl =
				json?.user?.profileImage ??
				json?.user?.profileImageUrl ??
				json?.user?.image ??
				json?.profileImage ??
				json?.profileImageUrl ??
				null;

			const cacheBustedUrl = newUrl
				? `${newUrl}${newUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
				: null;

			onUploaded?.(cacheBustedUrl);
			if (updateSession) {
				await updateSession({ user: { image: cacheBustedUrl } });
			}
			setSaveStatus('saved');
			setSelectedFile(null);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-4">
				{displayedImageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						alt="โปรไฟล์"
						src={displayedImageUrl}
						className="h-16 w-16 rounded-full border object-cover"
					/>
				) : (
					<div className="h-16 w-16 rounded-full border bg-gray-100" />
				)}

				<div className="flex flex-col gap-2">
					<label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer w-fit">
						<span className="sr-only">เลือกรูปโปรไฟล์</span>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-4 w-4 text-slate-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<span>อัปโหลดรูป</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
							className="sr-only"
						/>
					</label>

					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={saving || !selectedFile}
							onClick={onSave}
							className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
						>
							{saving ? 'กำลังบันทึก…' : 'บันทึก'}
						</button>
						<button
							type="button"
							disabled={saving || (!selectedFile && !previewUrl)}
							onClick={() => onPickFile(null)}
							className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
						>
							ยกเลิก
						</button>
						{saveStatus === 'saved' ? (
							<span className="text-sm text-green-700">บันทึกแล้ว</span>
						) : null}
					</div>
				</div>
			</div>

			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			<p className="text-xs text-gray-600">แนะนำไฟล์ PNG/JPG ตัวอย่างจะแสดงก่อนกดบันทึก</p>
		</div>
	);
}
