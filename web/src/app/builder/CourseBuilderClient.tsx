'use client';

import { createCourse, updateCourseBySlug, uploadCourseThumbnail } from '@/lib/api';
import type { Course } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type LessonDraft = {
	id: string;
	title: string;
	slug: string;
	videoUrl: string;
	duration: string;
};

type ModuleDraft = {
	id: string;
	title: string;
	lessons: LessonDraft[];
};

function slugifyLocal(input: string) {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function parseDurationSeconds(value: string) {
	const raw = value.trim();
	if (!raw) return undefined;
	const parts = raw.split(':').map((p) => p.trim());
	if (parts.some((p) => !/^\d+$/.test(p))) return undefined;
	const nums = parts.map((p) => Number(p));
	if (nums.length === 2) return nums[0] * 60 + nums[1];
	if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
	return undefined;
}

function formatDurationSeconds(value?: number) {
	if (!value || !Number.isFinite(value) || value <= 0) return '';
	const total = Math.floor(value);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const seconds = total % 60;
	if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function htmlToPlainText(html?: string) {
	if (!html) return '';
	return String(html)
		.replace(/<\s*br\s*\/?>/gi, '\n')
		.replace(/<\s*\/p\s*>/gi, '\n')
		.replace(/<\s*p\s*>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.trim();
}

type Props = {
	mode?: 'create' | 'edit';
	initialCourse?: Course;
	unlockPassword?: string;
};

export default function CourseBuilderClient({ mode = 'create', initialCourse, unlockPassword }: Props) {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);

	// Basics
	const [title, setTitle] = useState(() => initialCourse?.title || '');
	const [description, setDescription] = useState(() => htmlToPlainText(initialCourse?.descriptionHtml));
	const [level, setLevel] = useState(() => initialCourse?.level || 'All Levels');
	const [categories, setCategories] = useState(() => (initialCourse?.categories || []).join(', '));
	const [pricingModel, setPricingModel] = useState<'free' | 'paid'>(() => (initialCourse?.pricing?.model === 'paid' ? 'paid' : 'free'));
	const [priceAmount, setPriceAmount] = useState(() => String(initialCourse?.pricing?.amount ?? 0));
	const [thumbnailUrl, setThumbnailUrl] = useState(() => initialCourse?.thumbnailUrl || '');
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
	const [thumbnailUploading, setThumbnailUploading] = useState(false);
	const [thumbnailError, setThumbnailError] = useState<string | null>(null);

	const [enableQna, setEnableQna] = useState(() => initialCourse?.settings?.enableQna !== false);

	const [visibilityType, setVisibilityType] = useState<'public' | 'password'>(() => (initialCourse?.visibility?.type === 'password' ? 'password' : 'public'));
	const [password, setPassword] = useState('');

	// Curriculum
	const [modules, setModules] = useState<ModuleDraft[]>(() => {
		if (initialCourse?.modules?.length) {
			return initialCourse.modules.map((m) => ({
				id: m.id,
				title: m.title,
				lessons: (m.lessons || []).map((l) => ({
					id: l.id,
					title: l.title,
					slug: l.slug,
					videoUrl: l.video?.url || '',
					duration: formatDurationSeconds(l.durationSeconds),
				})),
			}));
		}
		return [{ id: crypto.randomUUID(), title: '', lessons: [] }];
	});

	// Additional
	const [tags, setTags] = useState(() => (initialCourse?.tags || []).join(', '));
	const [introVideoUrl, setIntroVideoUrl] = useState(() => initialCourse?.introVideo?.url || '');

	const slugPreview = useMemo(() => slugifyLocal(title || 'course'), [title]);
	const effectiveSlug = mode === 'edit' ? initialCourse?.slug || slugPreview : slugPreview;

	const displayedThumbnail = useMemo(() => {
		return thumbnailPreviewUrl || thumbnailUrl || '';
	}, [thumbnailPreviewUrl, thumbnailUrl]);

	useEffect(() => {
		return () => {
			if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
		};
	}, [thumbnailPreviewUrl]);

	function onPickThumbnail(file: File | null) {
		setThumbnailError(null);
		setThumbnailFile(null);
		if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
		setThumbnailPreviewUrl(null);
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			setThumbnailError('กรุณาเลือกไฟล์รูปภาพ');
			return;
		}
		setThumbnailFile(file);
		setThumbnailPreviewUrl(URL.createObjectURL(file));
	}

	async function onUploadThumbnail() {
		if (!thumbnailFile) {
			setThumbnailError('กรุณาเลือกรูปภาพก่อน');
			return;
		}
		// Clear old URL immediately so the new upload becomes the source of truth.
		setThumbnailUrl('');
		setThumbnailUploading(true);
		setThumbnailError(null);
		try {
			const url = await uploadCourseThumbnail(thumbnailFile);
			if (!url) throw new Error('อัปโหลดสำเร็จแต่ไม่ได้รับลิงก์รูปภาพ');
			setThumbnailUrl(url);
			setThumbnailFile(null);
			if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
			setThumbnailPreviewUrl(null);
		} catch (err) {
			setThumbnailError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
		} finally {
			setThumbnailUploading(false);
		}
	}

	async function onSubmit() {
		const payload = {
			title,
			slug: effectiveSlug,
			descriptionHtml: description ? `<p>${description.replace(/\n/g, '<br/>')}</p>` : '',
			thumbnailUrl,
			level,
			categories,
			tags,
			pricing: { model: pricingModel, amount: pricingModel === 'paid' ? Number(priceAmount || 0) : undefined },
			visibility: { type: visibilityType, password: visibilityType === 'password' ? password : undefined },
			// Compatibility: backend now derives "public" from visibility_type.
			settings: { isPublicCourse: visibilityType === 'public', enableQna },
			introVideo: introVideoUrl ? { provider: 'unknown', url: introVideoUrl } : undefined,
			modules: modules
				.map((m, moduleIndex) => ({
					id: m.id,
					title: m.title || `โมดูล ${moduleIndex + 1}`,
					order: moduleIndex,
					lessons: m.lessons.map((l, lessonIndex) => ({
						id: l.id,
						title: l.title || `บทเรียน ${lessonIndex + 1}`,
						slug: l.slug || slugifyLocal(l.title || `lesson-${lessonIndex + 1}`),
						order: lessonIndex,
						durationSeconds: parseDurationSeconds(l.duration),
						type: 'video',
						video: l.videoUrl ? { provider: 'unknown', url: l.videoUrl } : undefined,
					})),
				}))
				.filter((m) => m.title.trim().length > 0),
		};

		if (mode === 'edit') {
			const updated = await updateCourseBySlug(effectiveSlug, payload, unlockPassword);
			router.push(`/courses/${updated.slug}${unlockPassword ? `?password=${encodeURIComponent(unlockPassword)}` : ''}`);
			return;
		}

		const created = await createCourse(payload);
		router.push(`/courses/${created.slug}`);
	}

	return (
		<div className="mx-auto max-w-5xl p-6">
			<div className="mb-6 flex items-center gap-3">
				<h1 className="text-xl font-semibold">{mode === 'edit' ? 'แก้ไขคอร์ส' : 'ตัวสร้างคอร์ส'}</h1>
				<span className="text-sm text-gray-500">สลัก (slug): {effectiveSlug}</span>
			</div>

			<div className="mb-6 flex gap-2">
				<button
					className={`rounded px-3 py-2 text-sm ${step === 1 ? 'bg-black text-white' : 'border'}`}
					onClick={() => setStep(1)}
					type="button"
				>
					1 ข้อมูลพื้นฐาน
				</button>
				<button
					className={`rounded px-3 py-2 text-sm ${step === 2 ? 'bg-black text-white' : 'border'}`}
					onClick={() => setStep(2)}
					type="button"
				>
					2 เนื้อหา
				</button>
				<button
					className={`rounded px-3 py-2 text-sm ${step === 3 ? 'bg-black text-white' : 'border'}`}
					onClick={() => setStep(3)}
					type="button"
				>
					3 เพิ่มเติม
				</button>
			</div>

			{step === 1 && (
				<div className="grid gap-4">
					<div>
						<label className="mb-1 block text-sm font-medium">ชื่อคอร์ส</label>
						<input className="w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium">คำอธิบาย</label>
						<textarea className="w-full rounded border px-3 py-2" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium">ระดับความยาก</label>
							<select className="w-full rounded border px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)}>
								<option value="All Levels">ทุกระดับ</option>
								<option value="Beginner">เริ่มต้น</option>
								<option value="Intermediate">ระดับกลาง</option>
								<option value="Advanced">ขั้นสูง</option>
							</select>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium">ลิงก์รูปภาพหน้าปก</label>
							<input
								className="w-full rounded border px-3 py-2"
								value={thumbnailUrl}
								onChange={(e) => setThumbnailUrl(e.target.value)}
								placeholder="https://..."
							/>
							<div className="mt-2 grid gap-2">
								<div className="flex flex-wrap items-center gap-2">
									<label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm">
										<span>เลือกรูปภาพ</span>
										<input
											type="file"
											accept="image/*"
											onChange={(e) => onPickThumbnail(e.target.files?.[0] ?? null)}
											className="hidden"
										/>
									</label>
									<button
										type="button"
										disabled={thumbnailUploading || !thumbnailFile}
										className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
										onClick={onUploadThumbnail}
									>
										{thumbnailUploading ? 'กำลังอัปโหลด…' : 'อัปโหลด'}
									</button>
									<button
										type="button"
										disabled={thumbnailUploading || (!thumbnailFile && !thumbnailPreviewUrl)}
										className="rounded border px-3 py-2 text-sm disabled:opacity-50"
										onClick={() => onPickThumbnail(null)}
									>
										ยกเลิก
									</button>
								</div>
								{thumbnailError ? <div className="text-sm text-red-600">{thumbnailError}</div> : null}
								{displayedThumbnail ? (
									// eslint-disable-next-line @next/next/no-img-element
										<img src={displayedThumbnail} alt="ตัวอย่างรูปภาพ" className="h-24 w-auto rounded border object-cover" />
								) : (
										<div className="text-xs text-gray-500">ยังไม่ได้เลือกรูปภาพ</div>
								)}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium">รูปแบบราคา</label>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 text-sm">
									<input type="radio" checked={pricingModel === 'free'} onChange={() => setPricingModel('free')} /> ฟรี
								</label>
								<label className="flex items-center gap-2 text-sm">
									<input type="radio" checked={pricingModel === 'paid'} onChange={() => setPricingModel('paid')} /> เสียเงิน
								</label>
							</div>
							{pricingModel === 'paid' && (
								<div className="mt-2">
									<input className="w-full rounded border px-3 py-2" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} placeholder="จำนวนเงิน" />
								</div>
							)}
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium">หมวดหมู่ (คั่นด้วย ,)</label>
							<input className="w-full rounded border px-3 py-2" value={categories} onChange={(e) => setCategories(e.target.value)} />
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium">การมองเห็น</label>
							<select className="w-full rounded border px-3 py-2" value={visibilityType} onChange={(e) => setVisibilityType(e.target.value as any)}>
								<option value="public">สาธารณะ</option>
								<option value="password">มีรหัสผ่าน</option>
							</select>
							{visibilityType === 'password' && (
								<div className="mt-2">
									<input className="w-full rounded border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'edit' ? 'รหัสผ่านใหม่ (เว้นว่างเพื่อคงเดิม)' : 'รหัสผ่าน'} type="password" autoComplete="off" />
								</div>
							)}
						</div>

						<div className="grid gap-2">
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" checked={enableQna} onChange={(e) => setEnableQna(e.target.checked)} /> Q&A
							</label>
						</div>
					</div>

					<div className="mt-2 flex justify-end">
						<button className="rounded bg-black px-4 py-2 text-white" type="button" onClick={() => setStep(2)}>
							ถัดไป
						</button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="grid gap-4">
					{modules.map((m, moduleIndex) => (
						<div key={m.id} className="rounded border p-4">
							<div className="mb-3 flex items-center justify-between gap-3">
								<input
									className="w-full rounded border px-3 py-2"
									value={m.title}
									onChange={(e) =>
										setModules((prev) =>
											prev.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x))
										)
									}
									placeholder={`ชื่อโมดูล ${moduleIndex + 1}`}
								/>
								<button
									className="rounded border px-3 py-2 text-sm"
									type="button"
									onClick={() =>
										setModules((prev) => prev.filter((x) => x.id !== m.id))
									}
								>
									ลบ
								</button>
							</div>

							<div className="grid gap-2">
								{m.lessons.map((l) => (
									<div key={l.id} className="grid grid-cols-1 gap-2 md:grid-cols-4">
										<input
											className="rounded border px-3 py-2 md:col-span-2"
											value={l.title}
											onChange={(e) =>
											setModules((prev) =>
												prev.map((x) =>
													x.id === m.id
													? {
															...x,
															lessons: x.lessons.map((y) =>
																y.id === l.id
																? { ...y, title: e.target.value, slug: slugifyLocal(e.target.value) }
																: y
															),
														}
														: x
												)
											)
										}
											placeholder="ชื่อบทเรียน"
										/>
										<input
											className="rounded border px-3 py-2"
											value={l.duration}
											onChange={(e) =>
											setModules((prev) =>
												prev.map((x) =>
													x.id === m.id
													? {
															...x,
															lessons: x.lessons.map((y) =>
																y.id === l.id ? { ...y, duration: e.target.value } : y
															),
														}
														: x
												)
											)
										}
											placeholder="mm:ss"
										/>
										<input
											className="rounded border px-3 py-2"
											value={l.videoUrl}
											onChange={(e) =>
											setModules((prev) =>
												prev.map((x) =>
													x.id === m.id
													? {
															...x,
															lessons: x.lessons.map((y) =>
																y.id === l.id ? { ...y, videoUrl: e.target.value } : y
															),
														}
														: x
												)
											)
										}
											placeholder="ลิงก์วิดีโอ"
										/>
										<button
											className="rounded border px-3 py-2 text-sm"
											type="button"
											onClick={() =>
												setModules((prev) =>
													prev.map((x) =>
														x.id === m.id
														? { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) }
														: x
													)
												)
											}
										>
											ลบ
										</button>
									</div>
								))}
							</div>

							<div className="mt-3">
								<button
									className="rounded border px-3 py-2 text-sm"
									type="button"
									onClick={() =>
										setModules((prev) =>
											prev.map((x) =>
												x.id === m.id
												? {
															...x,
															lessons: [
																...x.lessons,
																{
																	id: crypto.randomUUID(),
																	title: '',
																	slug: '',
																	duration: '',
																	videoUrl: '',
																},
															],
														}
														: x
											)
										)
									}
								>
									เพิ่มบทเรียน
								</button>
							</div>
						</div>
					))}

					<button
						className="w-fit rounded border px-3 py-2 text-sm"
						type="button"
						onClick={() => setModules((prev) => [...prev, { id: crypto.randomUUID(), title: '', lessons: [] }])}
					>
						เพิ่มโมดูล
					</button>

					<div className="mt-2 flex justify-between">
						<button className="rounded border px-4 py-2" type="button" onClick={() => setStep(1)}>
							กลับ
						</button>
						<button className="rounded bg-black px-4 py-2 text-white" type="button" onClick={() => setStep(3)}>
							ถัดไป
						</button>
					</div>
				</div>
			)}

			{step === 3 && (
				<div className="grid gap-4">
					<div>
						<label className="mb-1 block text-sm font-medium">แท็ก (คั่นด้วย ,)</label>
						<input className="w-full rounded border px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} />
					</div>
					<div>
						<label className="mb-1 block text-sm font-medium">ลิงก์วิดีโอแนะนำ</label>
						<input className="w-full rounded border px-3 py-2" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} />
					</div>

					<div className="mt-2 flex justify-between">
						<button className="rounded border px-4 py-2" type="button" onClick={() => setStep(2)}>
							กลับ
						</button>
						<button
							className="rounded bg-black px-4 py-2 text-white"
							type="button"
							onClick={async () => {
								await onSubmit();
							}}
						>
							{mode === 'edit' ? 'บันทึก' : 'สร้าง'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
