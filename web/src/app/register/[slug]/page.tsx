'use client';

import { useParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

function apiBase() {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!base) throw new Error('ไม่พบ NEXT_PUBLIC_API_BASE_URL');
	return base.replace(/\/$/, '');
}

function readCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

type CheckKey =
	| 'medicine'
	| 'dentistry'
	| 'veterinarians'
	| 'pharmacy'
	| 'medical_technology'
	| 'nursing'
	| 'engineering'
	| 'architecture'
	| 'science'
	| 'business_administration'
	| 'humanities'
	| 'literature'
	| 'social_sciences'
	| 'law'
	| 'education'
	| 'chula'
	| 'thammasat'
	| 'mahidol'
	| 'chiangmai'
	| 'knonkaen'
	| 'songkhla'
	| 'ubon'
	| 'kingmongkut_north'
	| 'sarakham'
	| 'walailak'
	| 'maejo'
	| 'kingmongkut_ladkrabang';

const facultyChecks: Array<{ key: CheckKey; label: string }> = [
	{ key: 'medicine', label: 'แพทย์ศาสตร์' },
	{ key: 'dentistry', label: 'ทันตแพทย์' },
	{ key: 'veterinarians', label: 'สัตวแพทย์' },
	{ key: 'pharmacy', label: 'เภสัชศาสตร์' },
	{ key: 'medical_technology', label: 'เทคนิคการแพทย์' },
	{ key: 'nursing', label: 'พยาบาล' },
	{ key: 'engineering', label: 'วิศวกรรมศาสตร์' },
	{ key: 'architecture', label: 'สถาปัตยกรรม' },
	{ key: 'science', label: 'วิทยาศาสตร์' },
	{ key: 'business_administration', label: 'บริหารธุรกิจ' },
	{ key: 'humanities', label: 'มนุษยศาสตร์' },
	{ key: 'literature', label: 'อักษรศาสตร์' },
	{ key: 'social_sciences', label: 'สังคมศาสตร์' },
	{ key: 'law', label: 'นิติศาสตร์' },
	{ key: 'education', label: 'ครุศาสตร์/ศึกษาศาตร์' },
];

const universityChecks: Array<{ key: CheckKey; label: string }> = [
	{ key: 'chula', label: 'จุฬาลงกรณ์มหาวิทยาลัย' },
	{ key: 'thammasat', label: 'มหาวิทยาลัยธรรมศาสตร์' },
	{ key: 'mahidol', label: 'มหาวิทยาลัยมหิดล' },
	{ key: 'chiangmai', label: 'มหาวิทยาลัยเชียงใหม่' },
	{ key: 'knonkaen', label: 'มหาวิทยาลัยขอนแก่น' },
	{ key: 'songkhla', label: 'มหาวิทยาลัยสงขลานครินทร์' },
	{ key: 'ubon', label: 'มหาวิทยาลัยอุบลราชธานี' },
	{ key: 'kingmongkut_north', label: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ' },
	{ key: 'sarakham', label: 'มหาวิทยาลัยมหาสารคาม' },
	{ key: 'walailak', label: 'มหาวิทยาลัยวลัยลักษณ์' },
	{ key: 'maejo', label: 'มหาวิทยาลัยแม่โจ้' },
	{ key: 'kingmongkut_ladkrabang', label: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง' },
];

const gradeOptions = ['ม.6', 'ม.5', 'ม.4', 'อื่นๆ'] as const;

const qualificationOptions = ['ป.ตรี', 'ป.โท', 'ป.เอก', 'ปวส', 'ปวช', 'ม.6', 'อื่นๆ'] as const;

const provinceOptions: Array<{ value: string; label: string }> = [
	{ value: 'Bangkok', label: 'กรุงเทพมหานคร' },
	{ value: 'Krabi', label: 'กระบี่' },
	{ value: 'Kanchanaburi', label: 'กาญจนบุรี' },
	{ value: 'Kalasin', label: 'กาฬสินธุ์' },
	{ value: 'Kamphaeng Phet', label: 'กำแพงเพชร' },
	{ value: 'Khon Kaen', label: 'ขอนแก่น' },
	{ value: 'Chanthaburi', label: 'จันทบุรี' },
	{ value: 'Chachoengsao', label: 'ฉะเชิงเทรา' },
	{ value: 'Chonburi', label: 'ชลบุรี' },
	{ value: 'Chai Nat', label: 'ชัยนาท' },
	{ value: 'Chaiyaphum', label: 'ชัยภูมิ' },
	{ value: 'Chumphon', label: 'ชุมพร' },
	{ value: 'Chiang Rai', label: 'เชียงราย' },
	{ value: 'Chiang Mai', label: 'เชียงใหม่' },
	{ value: 'Trang', label: 'ตรัง' },
	{ value: 'Trat', label: 'ตราด' },
	{ value: 'Tak', label: 'ตาก' },
	{ value: 'Nakhon Nayok', label: 'นครนายก' },
	{ value: 'Nakhon Pathom', label: 'นครปฐม' },
	{ value: 'Nakhon Phanom', label: 'นครพนม' },
	{ value: 'Nakhon Ratchasima', label: 'นครราชสีมา' },
	{ value: 'Nakhon Si Thammarat', label: 'นครศรีธรรมราช' },
	{ value: 'Nakhon Sawan', label: 'นครสวรรค์' },
	{ value: 'Nonthaburi', label: 'นนทบุรี' },
	{ value: 'Narathiwat', label: 'นราธิวาส' },
	{ value: 'Nan', label: 'น่าน' },
	{ value: 'Bueng Kan', label: 'บึงกาฬ' },
	{ value: 'Buriram', label: 'บุรีรัมย์' },
	{ value: 'Pathum Thani', label: 'ปทุมธานี' },
	{ value: 'Prachuap Khiri Khan', label: 'ประจวบคีรีขันธ์' },
	{ value: 'Prachinburi', label: 'ปราจีนบุรี' },
	{ value: 'Pattani', label: 'ปัตตานี' },
	{ value: 'Phra Nakhon Si Ayutthaya', label: 'พระนครศรีอยุธยา' },
	{ value: 'Phang Nga', label: 'พังงา' },
	{ value: 'Phatthalung', label: 'พัทลุง' },
	{ value: 'Phichit', label: 'พิจิตร' },
	{ value: 'Phitsanulok', label: 'พิษณุโลก' },
	{ value: 'Phetchaburi', label: 'เพชรบุรี' },
	{ value: 'Phetchabun', label: 'เพชรบูรณ์' },
	{ value: 'Phrae', label: 'แพร่' },
	{ value: 'Phayao', label: 'พะเยา' },
	{ value: 'Phuket', label: 'ภูเก็ต' },
	{ value: 'Maha Sarakham', label: 'มหาสารคาม' },
	{ value: 'Mukdahan', label: 'มุกดาหาร' },
	{ value: 'Mae Hong Son', label: 'แม่ฮ่องสอน' },
	{ value: 'Yasothon', label: 'ยโสธร' },
	{ value: 'Yala', label: 'ยะลา' },
	{ value: 'Roi Et', label: 'ร้อยเอ็ด' },
	{ value: 'Ranong', label: 'ระนอง' },
	{ value: 'Rayong', label: 'ระยอง' },
	{ value: 'Ratchaburi', label: 'ราชบุรี' },
	{ value: 'Lopburi', label: 'ลพบุรี' },
	{ value: 'Lampang', label: 'ลำปาง' },
	{ value: 'Lamphun', label: 'ลำพูน' },
	{ value: 'Loei', label: 'เลย' },
	{ value: 'Si Sa Ket', label: 'ศรีสะเกษ' },
	{ value: 'Sakon Nakhon', label: 'สกลนคร' },
	{ value: 'Songkhla', label: 'สงขลา' },
	{ value: 'Satun', label: 'สตูล' },
	{ value: 'Samut Prakan', label: 'สมุทรปราการ' },
	{ value: 'Samut Songkhram', label: 'สมุทรสงคราม' },
	{ value: 'Samut Sakhon', label: 'สมุทรสาคร' },
	{ value: 'Sa Kaeo', label: 'สระแก้ว' },
	{ value: 'Saraburi', label: 'สระบุรี' },
	{ value: 'Sing Buri', label: 'สิงห์บุรี' },
	{ value: 'Sukhothai', label: 'สุโขทัย' },
	{ value: 'Suphan Buri', label: 'สุพรรณบุรี' },
	{ value: 'Surat Thani', label: 'สุราษฎร์ธานี' },
	{ value: 'Surin', label: 'สุรินทร์' },
	{ value: 'Nong Khai', label: 'หนองคาย' },
	{ value: 'Nong Bua Lamphu', label: 'หนองบัวลำภู' },
	{ value: 'Ang Thong', label: 'อ่างทอง' },
	{ value: 'Udon Thani', label: 'อุดรธานี' },
	{ value: 'Uttaradit', label: 'อุตรดิตถ์' },
	{ value: 'Uthai Thani', label: 'อุทัยธานี' },
	{ value: 'Ubon Ratchathani', label: 'อุบลราชธานี' },
	{ value: 'Amnat Charoen', label: 'อำนาจเจริญ' },
];

function inputClassName() {
	return 'mt-1 w-full rounded border px-3 py-2 font-sans focus:outline-none focus:ring-2';
}

function normalizePhoneInput(value: string) {
	let raw = String(value || '').trim();
	if (!raw) return '';
	raw = raw.replace(/[^0-9+]/g, '');
	if (raw.startsWith('+')) raw = raw.slice(1);
	if (raw.startsWith('66') && raw.length >= 11) raw = `0${raw.slice(2)}`;
	raw = raw.replace(/\D/g, '');
	return raw;
}

function isThaiPhone10Digits(value: string) {
	return /^0\d{9}$/.test(String(value || ''));
}

function formatThaiPhoneDisplay(value: string) {
	const digits = normalizePhoneInput(value).slice(0, 10);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function looksLikeEmail(value: string) {
	const v = String(value || '').trim().toLowerCase();
	return v.length >= 3 && v.includes('@') && v.includes('.');
}

export default function CourseRegisterPage() {
	const router = useRouter();
	const params = useParams<{ slug?: string | string[] }>();
	const registerCode = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
	const isQualificationRegisterCode =
		registerCode === '2ac6e9b386b315dd' || registerCode === 'b441a172a04ef9a7' || registerCode === 'e40606c32407e22a';
	const [courseTitle, setCourseTitle] = useState<string | null>(null);
	const [courseSlug, setCourseSlug] = useState<string | null>(null);
	const [courseThumbnailUrl, setCourseThumbnailUrl] = useState<string | null>(null);
	const [courseError, setCourseError] = useState<string | null>(null);
	const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [step, setStep] = useState<1 | 2>(1);
	const [identifier, setIdentifier] = useState('');
	const [identifierMode, setIdentifierMode] = useState<'phone_otp' | 'email_phone' | 'phone_email' | null>(null);
	const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
	const [identifierError, setIdentifierError] = useState<string | null>(null);
	const [emailPhone, setEmailPhone] = useState('');
	const [emailPhoneChecking, setEmailPhoneChecking] = useState(false);
	const [otpPhone, setOtpPhone] = useState('');
	const [otpToken, setOtpToken] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState('');
	const [otpSending, setOtpSending] = useState(false);
	const [otpVerifying, setOtpVerifying] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [otpAuthorized, setOtpAuthorized] = useState(false);
	const [emailPhoneAuthorized, setEmailPhoneAuthorized] = useState(false);
	const [isExistingMember, setIsExistingMember] = useState<boolean | null>(null);

	const [gender, setGender] = useState('');
	const [name, setName] = useState('');
	const [tel, setTel] = useState('');
	const [telError, setTelError] = useState<string | null>(null);
	const [usermail, setUsermail] = useState('');
	const [grade, setGrade] = useState('');
	const [schoolprovince, setSchoolprovince] = useState('');
	const [otherFaculty, setOtherFaculty] = useState('');
	const [otherUniversity, setOtherUniversity] = useState('');
	const [city, setCity] = useState('');
	const [postal, setPostal] = useState('');
	const [consent, setConsent] = useState(false);

	const [checks, setChecks] = useState<Record<CheckKey, boolean>>(() => {
		const initial = {} as Record<CheckKey, boolean>;
		for (const x of [...facultyChecks, ...universityChecks]) initial[x.key] = false;
		return initial;
	});

	const [loadingCourse, setLoadingCourse] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const provinceAnyToValue = useMemo(() => {
		const map = new Map<string, string>();
		for (const p of provinceOptions) {
			map.set(p.label, p.value);
			map.set(p.value, p.value);
		}
		return map;
	}, []);

	const tracking = useMemo(() => {
		return {
			protocol: typeof window !== 'undefined' ? window.location.protocol.replace(':', '') : null,
			agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
			fbp: readCookie('_fbp'),
			fbc: readCookie('_fbc'),
		};
	}, []);

	function normalizePrefillGrade(raw: string) {
		const v = String(raw || '').trim();
		if (!v) return '';
		if (isQualificationRegisterCode) {
			const normalized = v === 'ปวส.' ? 'ปวส' : v === 'ปวช.' ? 'ปวช' : v;
			return (qualificationOptions as readonly string[]).includes(normalized) ? normalized : '';
		}
		return (gradeOptions as readonly string[]).includes(v) ? v : '';
	}

	function normalizePrefillGender(raw: string) {
		const v = String(raw || '').trim();
		if (v === 'นาย' || v === 'นาง' || v === 'นางสาว') return v;
		return '';
	}

	useEffect(() => {
		return () => {
			if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
		};
	}, []);

	// Auto-detect existing auth session (e.g. returning from LINE Login)
	// and skip step 1 identity verification when user is already logged in.
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(`${apiBase()}/auth/me`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				});
				if (!res.ok || cancelled) return;
				const json = (await res.json()) as {
					user?: {
						email?: string;
						phoneNumber?: string;
						firstName?: string;
						lastName?: string;
						name?: string;
					};
				};
				const u = json?.user;
				if (!u || cancelled) return;

				// Mark auth as resolved & prefill available fields
				setEmailPhoneAuthorized(true);
				setIsExistingMember(true);
				if (u.email) setUsermail(u.email);
				if (u.phoneNumber) setTel(normalizePhoneInput(u.phoneNumber));
				setTelError(null);
				const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '';
				if (fullName) setName(fullName);
				setStep(2);
			} catch {
				// Not logged in – normal flow
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!registerCode) {
				setCourseTitle(null);
				setCourseSlug(null);
				setCourseError('ไม่พบคอร์สนี้');
				setLoadingCourse(false);
				router.replace('/');
				return;
			}
			setLoadingCourse(true);
			setCourseError(null);
			try {
				const res = await fetch(`${apiBase()}/courses/register-code/${encodeURIComponent(registerCode)}`, {
					cache: 'no-store',
					credentials: 'include',
				});
				if (res.status === 404) throw new Error('NOT_FOUND');
				if (!res.ok) throw new Error('โหลดข้อมูลคอร์สไม่สำเร็จ');
				const json = (await res.json()) as { course?: { title?: string; slug?: string; thumbnailUrl?: string } };
				const title = String(json?.course?.title || '').trim();
				const resolvedSlug = String(json?.course?.slug || '').trim();
				if (!resolvedSlug) throw new Error('NOT_FOUND');
				if (cancelled) return;
				setCourseSlug(resolvedSlug);
				setCourseTitle(title || resolvedSlug);
				setCourseThumbnailUrl(json?.course?.thumbnailUrl || null);
			} catch (err) {
				if (cancelled) return;
				setCourseSlug(null);
				if (err instanceof Error && err.message === 'NOT_FOUND') {
					setCourseError('ไม่พบคอร์สนี้');
					router.replace('/');
				} else {
					setCourseError('โหลดข้อมูลคอร์สไม่สำเร็จ');
				}
			} finally {
				if (!cancelled) setLoadingCourse(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [registerCode, router]);

	function toggleCheck(key: CheckKey, next: boolean) {
		setChecks((prev) => ({ ...prev, [key]: next }));
	}

	async function getFirstLessonSlug(nextCourseSlug: string): Promise<string | null> {
		try {
			const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(nextCourseSlug)}`, {
				method: 'GET',
				credentials: 'include',
				cache: 'no-store',
			});
			if (!res.ok) return null;

			const json = (await res.json().catch(() => null)) as
				| { locked?: boolean; course?: { modules?: Array<{ lessons?: Array<{ slug?: string | null }> }> } }
				| null;
			if (!json || json.locked) return null;

			const modules = Array.isArray(json.course?.modules) ? json.course.modules : [];
			for (const moduleItem of modules) {
				const lessons = Array.isArray(moduleItem?.lessons) ? moduleItem.lessons : [];
				for (const lesson of lessons) {
					const slug = typeof lesson?.slug === 'string' ? lesson.slug.trim() : '';
					if (slug) return slug;
				}
			}
			return null;
		} catch {
			return null; 
		}
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setFormError(null);
		setSuccess(false);

		if (!courseSlug) {
			setFormError('ไม่พบคอร์สนี้');
			return;
		}

		if (!otpAuthorized && !emailPhoneAuthorized) {
			setFormError('กรุณายืนยันตัวตนก่อน');
			setStep(1);
			return;
		}

		const lockedPhone = otpAuthorized
			? normalizePhoneInput(otpPhone)
			: normalizePhoneInput(tel);
		if (!gender.trim() || !name.trim() || !lockedPhone || !usermail.trim() || !grade.trim() || !schoolprovince.trim()) {
			setFormError('กรุณากรอกข้อมูลให้ครบ');
			return;
		}
		if (!consent) {
			setFormError('กรุณายอมรับข้อตกลงก่อนส่งข้อมูล');
			return;
		}
		if (!isThaiPhone10Digits(normalizePhoneInput(lockedPhone))) {
			setFormError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}

		setSubmitting(true);
		try {
			const normalizedProvince = provinceAnyToValue.get(schoolprovince.trim()) ?? schoolprovince.trim();
			const payload: Record<string, unknown> = {
				gender,
				name,
				tel: lockedPhone,
				usermail,
				grade,
				schoolprovince: normalizedProvince,
				other_faculty: otherFaculty,
				other_university: otherUniversity,
				protocol: tracking.protocol,
				agent: tracking.agent,
				fbp: tracking.fbp,
				fbc: tracking.fbc,
				city,
				postal,
			};
			if (emailPhoneAuthorized && !otpAuthorized) {
				payload.auth_mode = 'email_phone';
			}
			for (const [k, v] of Object.entries(checks)) payload[k] = v ? 'on' : '';

			const res = await fetch(`${apiBase()}/courses/${encodeURIComponent(courseSlug)}/register`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as { error?: string } | null;
				throw new Error(json?.error || 'ส่งข้อมูลไม่สำเร็จ');
			}

			setSuccess(true);
			try {
				const nextAuth = await signIn('server-cookie', { redirect: false });
				if (!nextAuth || nextAuth.error) throw new Error('สร้างเซสชันไม่สำเร็จ');
			} catch {
				// ignore; cookie login still exists on server
			}
			if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
			if (courseSlug) {
				const firstLessonSlug = await getFirstLessonSlug(courseSlug);
				if (firstLessonSlug) {
					router.replace(
						`/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(firstLessonSlug)}`
					);
				} else {
					router.replace(`/courses/${encodeURIComponent(courseSlug)}`);
				}
				router.refresh();
			}
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'ส่งข้อมูลไม่สำเร็จ');
		} finally {
			setSubmitting(false);
		}
	}

	function resetStep1Auth() {
		setIdentifierMode(null);
		setIdentifierError(null);
		setEmailPhone('');
		setEmailPhoneAuthorized(false);
		setOtpAuthorized(false);
		setOtpToken(null);
		setOtpCode('');
		setOtpError(null);
		setTelError(null);
		setIsExistingMember(null);
		setFormError(null);
	}

	async function continueWithIdentifier() {
		setIdentifierError(null);
		setOtpError(null);
		setFormError(null);
		setIsExistingMember(null);
		setEmailPhoneAuthorized(false);
		setOtpAuthorized(false);
		setOtpToken(null);
		setOtpCode('');

		const raw = identifier.trim();
		if (!raw) {
			setIdentifierError('กรุณากรอกเบอร์โทรศัพท์ หรืออีเมล');
			return;
		}

		const normalizedPhone = normalizePhoneInput(raw);
		if (isThaiPhone10Digits(normalizedPhone) && !looksLikeEmail(raw)) {
			setPhoneCheckLoading(true);
			try {
				const res = await fetch(`${apiBase()}/auth/check-phone`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ phone_number: normalizedPhone }),
				});
				const json = (await res.json().catch(() => null)) as any;
				if (res.ok && json?.found) {
					// Phone exists in DB — skip OTP, just ask for email
					setIdentifierMode('phone_email');
					setOtpPhone(normalizedPhone);
					setTel(normalizedPhone);
					setIsExistingMember(Boolean(json?.existingUser));
					const prefill = json?.prefill;
					if (prefill) {
						if (typeof prefill.gender === 'string') setGender(normalizePrefillGender(prefill.gender));
						if (typeof prefill.name === 'string') setName(prefill.name);
						if (typeof prefill.usermail === 'string') setUsermail(prefill.usermail);
						if (typeof prefill.grade === 'string') setGrade(normalizePrefillGrade(prefill.grade));
						if (typeof prefill.schoolprovince === 'string') {
							const rawProvince = prefill.schoolprovince.trim();
							setSchoolprovince(provinceAnyToValue.get(rawProvince) ?? '');
						}
						if (typeof prefill.other_faculty === 'string') setOtherFaculty(prefill.other_faculty);
						if (typeof prefill.other_university === 'string') setOtherUniversity(prefill.other_university);
						if (prefill.checks && typeof prefill.checks === 'object') {
							setChecks((prev) => ({ ...prev, ...(prefill.checks as Record<CheckKey, boolean>) }));
						}
					}
					return;
				}
			} catch {
				// If check fails, fall through to OTP flow
			} finally {
				setPhoneCheckLoading(false);
			}

			// Phone not found in DB — proceed with OTP
			setIdentifierMode('phone_otp');
			setOtpPhone(normalizedPhone);
			return;
		}

		if (looksLikeEmail(raw)) {
			setIdentifierMode('email_phone');
			setUsermail(raw.toLowerCase());
			return;
		}

		setIdentifierError('รูปแบบไม่ถูกต้อง: เบอร์ต้อง 10 หลักขึ้นต้นด้วย 0 หรือเป็นอีเมลที่ถูกต้อง');
	}

	async function checkEmailPhoneAndContinue() {
		setIdentifierError(null);
		setOtpError(null);
		setFormError(null);
		const email = usermail.trim().toLowerCase();
		const phone = normalizePhoneInput(emailPhone);
		if (!email || !looksLikeEmail(email)) {
			setIdentifierError('กรุณากรอกอีเมลให้ถูกต้อง');
			return;
		}
		if (!isThaiPhone10Digits(phone)) {
			setIdentifierError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}

		setEmailPhoneChecking(true);
		try {
			const res = await fetch(`${apiBase()}/auth/course-register/resolve`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, phone_number: phone }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok || !json?.ok) {
				const err = typeof json?.error === 'string' ? json.error : null;
				if (res.status === 409 && err === 'phone_already_used') {
					throw new Error('เบอร์นี้ถูกใช้กับอีเมลอื่นแล้ว');
				}
				if (res.status === 401 && err === 'invalid credentials') {
					throw new Error('อีเมลหรือเบอร์ไม่ถูกต้อง');
				}
				if (res.status === 403 && err === 'phone_not_set') {
					throw new Error('บัญชีนี้ยังไม่มีเบอร์โทรในระบบ กรุณาใช้เบอร์โทรเข้าใช้งานก่อน');
				}
				throw new Error(err || 'ตรวจสอบข้อมูลไม่สำเร็จ');
			}

			setEmailPhoneAuthorized(true);
			setIsExistingMember(Boolean(json?.existingUser));
			setTel(phone);
			setTelError(null);
			setUsermail(email);
			setStep(2);
			const prefill = json?.prefill;
			if (prefill) {
				if (typeof prefill.gender === 'string') setGender(normalizePrefillGender(prefill.gender));
				if (typeof prefill.name === 'string') setName(prefill.name);
				if (typeof prefill.usermail === 'string') setUsermail(prefill.usermail);
				if (typeof prefill.grade === 'string') setGrade(normalizePrefillGrade(prefill.grade));
				if (typeof prefill.schoolprovince === 'string') {
					const rawProvince = prefill.schoolprovince.trim();
					setSchoolprovince(provinceAnyToValue.get(rawProvince) ?? '');
				}
				if (typeof prefill.other_faculty === 'string') setOtherFaculty(prefill.other_faculty);
				if (typeof prefill.other_university === 'string') setOtherUniversity(prefill.other_university);
				if (prefill.checks && typeof prefill.checks === 'object') {
					setChecks((prev) => ({ ...prev, ...(prefill.checks as Record<CheckKey, boolean>) }));
				}
			}
		} catch (err) {
			setIdentifierError(err instanceof Error ? err.message : 'ตรวจสอบข้อมูลไม่สำเร็จ');
		} finally {
			setEmailPhoneChecking(false);
		}
	}

	async function checkPhoneEmailAndContinue() {
		setIdentifierError(null);
		setFormError(null);
		const phone = normalizePhoneInput(otpPhone);
		const email = usermail.trim().toLowerCase();
		if (!email || !looksLikeEmail(email)) {
			setIdentifierError('กรุณากรอกอีเมลให้ถูกต้อง');
			return;
		}

		setEmailPhoneChecking(true);
		try {
			const res = await fetch(`${apiBase()}/auth/course-register/resolve`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, phone_number: phone }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok || !json?.ok) {
				const err = typeof json?.error === 'string' ? json.error : null;
				if (res.status === 409 && err === 'phone_already_used') {
					throw new Error('เบอร์นี้ถูกใช้กับอีเมลอื่นแล้ว');
				}
				if (res.status === 401 && err === 'invalid credentials') {
					throw new Error('อีเมลหรือเบอร์ไม่ถูกต้อง');
				}
				if (res.status === 403 && err === 'phone_not_set') {
					throw new Error('บัญชีนี้ยังไม่มีเบอร์โทรในระบบ กรุณาใช้เบอร์โทรเข้าใช้งานก่อน');
				}
				throw new Error(err || 'ตรวจสอบข้อมูลไม่สำเร็จ');
			}

			setEmailPhoneAuthorized(true);
			setIsExistingMember(Boolean(json?.existingUser));
			setTel(phone);
			setTelError(null);
			setUsermail(email);
			setStep(2);
			const prefill = json?.prefill;
			if (prefill) {
				if (typeof prefill.gender === 'string') setGender(normalizePrefillGender(prefill.gender));
				if (typeof prefill.name === 'string') setName(prefill.name);
				if (typeof prefill.usermail === 'string') setUsermail(prefill.usermail);
				if (typeof prefill.grade === 'string') setGrade(normalizePrefillGrade(prefill.grade));
				if (typeof prefill.schoolprovince === 'string') {
					const rawProvince = prefill.schoolprovince.trim();
					setSchoolprovince(provinceAnyToValue.get(rawProvince) ?? '');
				}
				if (typeof prefill.other_faculty === 'string') setOtherFaculty(prefill.other_faculty);
				if (typeof prefill.other_university === 'string') setOtherUniversity(prefill.other_university);
				if (prefill.checks && typeof prefill.checks === 'object') {
					setChecks((prev) => ({ ...prev, ...(prefill.checks as Record<CheckKey, boolean>) }));
				}
			}
		} catch (err) {
			setIdentifierError(err instanceof Error ? err.message : 'ตรวจสอบข้อมูลไม่สำเร็จ');
		} finally {
			setEmailPhoneChecking(false);
		}
	}

	async function requestOtp() {
		setOtpError(null);
		setOtpToken(null);
		setOtpAuthorized(false);
		setEmailPhoneAuthorized(false);
		setIsExistingMember(null);
		const phone = normalizePhoneInput(otpPhone);
		if (!phone) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return;
		}
		if (!isThaiPhone10Digits(phone)) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}
		setOtpPhone(phone);

		setOtpSending(true);
		try {
			const res = await fetch(`${apiBase()}/auth/request-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phone }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok) throw new Error(json?.error || 'ส่ง OTP ไม่สำเร็จ');
			const token = String(json?.token || '').trim();
			if (!token) throw new Error('OTP token ไม่ถูกต้อง');
			setOtpToken(token);
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'ส่ง OTP ไม่สำเร็จ');
		} finally {
			setOtpSending(false);
		}
	}

	async function verifyOtp() {
		setOtpError(null);
		const phone = normalizePhoneInput(otpPhone);
		const code = otpCode.trim();
		if (!phone) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์');
			return;
		}
		if (!isThaiPhone10Digits(phone)) {
			setOtpError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
			return;
		}
		setOtpPhone(phone);
		if (!otpToken) {
			setOtpError('กรุณากดส่ง OTP ก่อน');
			return;
		}
		if (!code) {
			setOtpError('กรุณากรอกรหัส OTP');
			return;
		}

		setOtpVerifying(true);
		try {
			const res = await fetch(`${apiBase()}/auth/verify-otp`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ phone_number: phone, token: otpToken, otp_code: code }),
			});
			const json = (await res.json().catch(() => null)) as any;
			if (!res.ok) throw new Error(json?.error || 'ยืนยัน OTP ไม่สำเร็จ');
			if (!json?.ok) throw new Error('ยืนยัน OTP ไม่สำเร็จ');

			setOtpAuthorized(true);
			setEmailPhoneAuthorized(false);
			setIsExistingMember(Boolean(json?.existingUser));

			// Move to step 2 and prefill when available
			setStep(2);
			setTel(phone);
			setTelError(null);
			if (!usermail.trim() && typeof json?.prefill?.usermail === 'string') {
				setUsermail(json.prefill.usermail);
			}
			const prefill = json?.prefill;
			if (prefill) {
				if (typeof prefill.gender === 'string') setGender(normalizePrefillGender(prefill.gender));
				if (typeof prefill.name === 'string') setName(prefill.name);
				if (typeof prefill.usermail === 'string') setUsermail(prefill.usermail);
				if (typeof prefill.grade === 'string') setGrade(normalizePrefillGrade(prefill.grade));
				if (typeof prefill.schoolprovince === 'string') {
					const rawProvince = prefill.schoolprovince.trim();
					setSchoolprovince(provinceAnyToValue.get(rawProvince) ?? '');
				}
				if (typeof prefill.other_faculty === 'string') setOtherFaculty(prefill.other_faculty);
				if (typeof prefill.other_university === 'string') setOtherUniversity(prefill.other_university);
				if (prefill.checks && typeof prefill.checks === 'object') {
					setChecks((prev) => ({ ...prev, ...(prefill.checks as Record<CheckKey, boolean>) }));
				}
			}
		} catch (err) {
			setOtpError(err instanceof Error ? err.message : 'ยืนยัน OTP ไม่สำเร็จ');
		} finally {
			setOtpVerifying(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center gap-4 px-4 py-6 font-sans sm:gap-5 sm:px-6 md:gap-6 md:py-10">
			<div className="flex flex-col items-center gap-3 sm:gap-4">
				{courseThumbnailUrl ? (
					<img
						src={courseThumbnailUrl}
						alt={courseTitle || 'คอร์ส'}
						className="w-full max-w-md rounded-2xl object-cover shadow-sm sm:max-w-lg md:max-w-xl"
					/>
				) : loadingCourse ? (
					<div className="aspect-video w-full max-w-md animate-pulse rounded-2xl bg-slate-100 sm:max-w-lg md:max-w-xl" />
				) : null}
				<h1 className="text-center text-xl font-semibold sm:text-2xl" style={{ color: '#0abb51' }}>
					{loadingCourse ? 'กำลังโหลด…' : courseTitle ? `เริ่มต้นเรียนคอร์ส: ${courseTitle}` : 'ลงทะเบียนรับคอร์ส'}
				</h1>
			</div>

			<div className="rounded border p-4 text-sm">
				<div className="flex items-center justify-between gap-3">
					<div className="font-medium">ขั้นตอน {step}/2</div>
					{step === 2 ? (
						<button
							type="button"
							className="text-sm underline"
							onClick={() => {
								setStep(1);
								resetStep1Auth();
							}}
						>
							เปลี่ยนข้อมูลยืนยันตัวตน
						</button>
					) : null}
				</div>
				{step === 2 && isExistingMember != null ? (
					<div className="mt-1 text-xs text-gray-600">
						{isExistingMember ? 'พบข้อมูลสมาชิกเดิม ระบบกรอกให้อัตโนมัติ (แก้ไขได้)' : 'ไม่พบสมาชิกเดิม กรุณากรอกข้อมูลให้ครบ'}
					</div>
				) : null}
			</div>

			{courseError ? (
				<div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{courseError}</div>
			) : null}

			{success ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
					<div className="w-full max-w-md rounded border bg-white p-6 text-center text-sm font-medium">
						ส่งข้อมูลสำเร็จ ระบบกำลังพาไปหน้าคอร์ส…
					</div>
				</div>
			) : null}

			{courseError ? null : step === 1 ? (
				<div className="rounded border p-4">
					<h2 className="text-base font-semibold">ยืนยันตัวตน</h2>
					<div className="mt-3 mb-3">
						<a
							href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/auth/line/start?returnPath=${encodeURIComponent(`/register/${registerCode || ''}`)}`}
							className="flex w-full items-center justify-center gap-2 rounded bg-[#06C755] px-4 py-2.5 text-white font-medium hover:bg-[#05b34d] transition-colors"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.21 3.74 7.74 8.79 8.4.34.07.81.23.93.52.1.27.07.68.03.95l-.15.91c-.05.27-.22 1.07.93.58 1.16-.49 6.24-3.67 8.52-6.29C22.94 13.38 22 11.03 22 10.5 22 5.82 17.52 2 12 2z" />
							</svg>
							ยืนยันตัวตนด้วย LINE
						</a>
						<div className="relative my-3 flex items-center">
							<div className="flex-grow border-t" />
							<span className="mx-3 text-xs text-gray-400">หรือ</span>
							<div className="flex-grow border-t" />
						</div>
					</div>
					<form
						className="mt-3"
						onSubmit={async (e) => {
							e.preventDefault();
							await continueWithIdentifier();
						}}
					>
						<label className="text-sm">
							อีเมลหรือ เบอร์โทรศัพท์ *
							<input
								className={inputClassName()}
								type="text"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								autoComplete="username"
								required
							/>
						</label>
						<button
							type="submit"
							disabled={loadingCourse || submitting || phoneCheckLoading}
							className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
						>
							{phoneCheckLoading ? 'กำลังตรวจสอบ…' : 'ถัดไป'}
						</button>
					</form>

					{identifierMode === 'email_phone' ? (
						<form
							className="mt-4"
							onSubmit={async (e) => {
								e.preventDefault();
								await checkEmailPhoneAndContinue();
							}}
						>
							<p className="text-sm text-gray-700">
								กรณีเข้าใช้งานด้วยอีเมล ระบบจะให้กรอกเบอร์โทรศัพท์ (ใช้แทนรหัสผ่าน)
							</p>
							<label className="mt-3 block text-sm">
								อีเมล
								<input className={inputClassName()} type="email" value={usermail} readOnly disabled />
							</label>
							<label className="mt-3 block text-sm">
								เบอร์โทรศัพท์ (ใช้แทนรหัสผ่าน) *
								<input
									className={inputClassName()}
									type="tel"
									value={emailPhone}
									onChange={(e) => setEmailPhone(e.target.value)}
									autoComplete="tel"
									required
								/>
							</label>
							<button
								type="submit"
								disabled={emailPhoneChecking || loadingCourse}
								className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
							>
								{emailPhoneChecking ? 'กำลังตรวจสอบ…' : 'ตรวจสอบและไปขั้นตอนถัดไป'}
							</button>
						</form>
					) : null}

					{identifierMode === 'phone_email' ? (
						<form
							className="mt-4"
							onSubmit={async (e) => {
								e.preventDefault();
								await checkPhoneEmailAndContinue();
							}}
						>
							<p className="text-sm text-gray-700">
								พบเบอร์โทรศัพท์ในระบบแล้ว กรุณากรอกอีเมลเพื่อยืนยันตัวตน
							</p>
							<label className="mt-3 block text-sm">
								เบอร์โทรศัพท์
								<input className={inputClassName()} type="tel" value={formatThaiPhoneDisplay(otpPhone)} readOnly disabled />
							</label>
							<label className="mt-3 block text-sm">
								อีเมล *
								<input
									className={inputClassName()}
									type="email"
									value={usermail}
									onChange={(e) => setUsermail(e.target.value)}
									autoComplete="email"
									required
								/>
							</label>
							<button
								type="submit"
								disabled={emailPhoneChecking || loadingCourse}
								className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
							>
								{emailPhoneChecking ? 'กำลังตรวจสอบ…' : 'ตรวจสอบและไปขั้นตอนถัดไป'}
							</button>
						</form>
					) : null}

					{identifierMode === 'phone_otp' ? (
						<>
							<div className="mt-4 rounded border p-4">
								<h3 className="text-base font-semibold">ยืนยันเบอร์โทรศัพท์ด้วย OTP</h3>
								<p className="mt-1 text-sm text-gray-700">เบอร์โทร: {otpPhone}</p>
								<button
									type="button"
									disabled={otpSending || loadingCourse}
									className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
									onClick={async () => {
									await requestOtp();
								}}
								>
									{otpSending ? 'กำลังส่ง…' : 'ส่ง OTP'}
								</button>

								{otpToken ? (
									<form
										className="mt-3"
										onSubmit={async (e) => {
											e.preventDefault();
											await verifyOtp();
										}}
									>
										<label className="text-sm">
											รหัส OTP *
											<input
												className={inputClassName()}
												type="text"
												inputMode="numeric"
												value={otpCode}
												onChange={(e) => setOtpCode(e.target.value)}
												autoComplete="one-time-code"
												required
											/>
										</label>
										<button
											type="submit"
											disabled={otpVerifying || loadingCourse}
											className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
										>
											{otpVerifying ? 'กำลังตรวจสอบ…' : 'ยืนยัน OTP'}
										</button>
									</form>
								) : null}

								{otpError ? <p className="mt-3 text-sm text-red-600">{otpError}</p> : null}
							</div>
						</>
					) : null}

					{identifierError ? <p className="mt-3 text-sm text-red-600">{identifierError}</p> : null}
				</div>
			) : (
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="text-sm">
							คำนำหน้า *
							<select className={inputClassName()} value={gender} onChange={(e) => setGender(e.target.value)} required>
								<option value="">เลือก</option>
								<option value="นาย">นาย</option>
								<option value="นาง">นาง</option>
								<option value="นางสาว">นางสาว</option>
							</select>
						</label>
						<label className="text-sm">
							ชื่อ-นามสกุล *
							<input className={inputClassName()} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
						</label>
						<label className="text-sm">
							เบอร์โทรศัพท์  (ไม่มีขีด)*
							<input
								className={inputClassName()}
								type="tel"
								value={formatThaiPhoneDisplay(tel)}
								onChange={(e) => {
									const next = normalizePhoneInput(e.target.value).slice(0, 10);
									setTel(next);
									if (!next || isThaiPhone10Digits(next)) {
										setTelError(null);
									} else {
										setTelError('รูปแบบเบอร์ไม่ถูกต้อง (ตัวอย่าง 081-234-5678)');
									}
								}}
								onBlur={() => {
									const normalized = normalizePhoneInput(tel).slice(0, 10);
									setTel(normalized);
									if (!normalized || isThaiPhone10Digits(normalized)) {
										setTelError(null);
										return;
									}
									setTelError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)');
								}}
								placeholder="081-234-5678"
								autoComplete="tel"
								required
								readOnly={otpAuthorized}
								disabled={otpAuthorized}
							/>
							{telError ? <p className="mt-1 text-xs text-red-600">{telError}</p> : null}
						</label>
						<label className="text-sm">
							อีเมล *
							<input
								className={inputClassName()}
								type="email"
								value={usermail}
								onChange={(e) => setUsermail(e.target.value)}
								required
							/>
						</label>
						<label className="text-sm">
							{isQualificationRegisterCode ? 'วุฒิการศึกษา *' : 'ระดับชั้น *'}
							{isQualificationRegisterCode ? (
								<select className={inputClassName()} value={grade} onChange={(e) => setGrade(e.target.value)} required>
									<option value="">เลือก</option>
									{qualificationOptions.map((x) => (
										<option key={x} value={x}>
											{x === 'ปวส' ? 'ปวส.' : x === 'ปวช' ? 'ปวช.' : x}
										</option>
									))}
								</select>
							) : (
								<select className={inputClassName()} value={grade} onChange={(e) => setGrade(e.target.value)} required>
									<option value="">เลือก</option>
									{gradeOptions.map((x) => (
										<option key={x} value={x}>
											{x}
										</option>
									))}
								</select>
							)}
						</label>
						<label className="text-sm">
							{isQualificationRegisterCode ? 'จังหวัด *' : 'โรงเรียนอยู่ในจังหวัด *'}
							<select
								className={inputClassName()}
								value={schoolprovince}
								onChange={(e) => setSchoolprovince(e.target.value)}
								required
							>
								<option value="">เลือก</option>
								{provinceOptions.map((p) => (
									<option key={p.value} value={p.value}>
										{p.label}
									</option>
								))}
							</select>
						</label>
					</div>
					{isQualificationRegisterCode ? (<></>) : (
								<>
									<div className="rounded border p-4">
										<h2 className="text-base font-semibold">คณะที่สนใจ</h2>
										<div className="mt-3 grid gap-2 sm:grid-cols-2">
											{facultyChecks.map((x) => (
												<label key={x.key} className="flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={checks[x.key]}
														onChange={(e) => toggleCheck(x.key, e.target.checked)}
													/>
													{x.label}
												</label>
											))}
										</div>
										<label className="mt-3 block text-sm">
											คณะอื่นๆ
											<input className={inputClassName()} type="text" value={otherFaculty} onChange={(e) => setOtherFaculty(e.target.value)} />
										</label>
									</div>

									<div className="rounded border p-4">
										<h2 className="text-base font-semibold">มหาวิทยาลัยที่สนใจ</h2>
										<div className="mt-3 grid gap-2 sm:grid-cols-2">
											{universityChecks.map((x) => (
												<label key={x.key} className="flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={checks[x.key]}
														onChange={(e) => toggleCheck(x.key, e.target.checked)}
													/>
													{x.label}
												</label>
											))}
										</div>
										<label className="mt-3 block text-sm">
											มหาวิทยาลัยอื่นๆ
											<input className={inputClassName()} type="text" value={otherUniversity} onChange={(e) => setOtherUniversity(e.target.value)} />
										</label>
									</div>
									</>
									)}
					<div className="rounded border p-4">
						<h2 className="text-base font-semibold">การยินยอม</h2>
						{/* <div className="mt-3 grid gap-3 sm:grid-cols-2">
							<label className="text-sm">
								city
								<input className={inputClassName()} type="text" value={city} onChange={(e) => setCity(e.target.value)} />
							</label>
							<label className="text-sm">
								postal
								<input className={inputClassName()} type="text" value={postal} onChange={(e) => setPostal(e.target.value)} />
							</label>
						</div> */}
						<label className="mt-3 flex items-start gap-2 text-sm">
							<input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
							<span>ยินยอมให้ใช้ข้อมูลเพื่อการติดต่อ/ส่งคอร์สให้ (PDPA)</span>
						</label>
					</div>

					{formError ? <p className="text-sm text-red-600">{formError}</p> : null}
					<button
						type="submit"
						disabled={submitting || loadingCourse}
						className="inline-flex items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					>
						{submitting ? (
							<>
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
								กำลังส่ง…
							</>
						) : (
							'ส่งข้อมูล'
						)}
					</button>
				</form>
			)}
		</div>
	);
}
