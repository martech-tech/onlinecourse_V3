export type CourseListItem = {
	title: string;
	slug: string;
	thumbnailUrl?: string;
	categories: string[];
	level?: string;
	pricing?: { model: 'free' | 'paid'; amount?: number; compareAt?: number; currency?: string };
	locked: boolean;
	enrolled?: boolean;
	updatedAt?: string;
};

export type AdminCourseListItem = {
	id: string;
	title: string;
	slug: string;
	thumbnailUrl?: string;
	categories: string[];
	level?: string;
	pricing?: { model: 'free' | 'paid'; amount?: number; compareAt?: number; currency?: string };
	visibilityType: 'public' | 'password';
	status: 'draft' | 'published';
	moduleCount: number;
	lessonCount: number;
	createdAt?: string;
	updatedAt?: string;
};

export type LinkedBook = {
	id: string;
	name: string;
	description: string;
	details?: string;
	tags: string[];
	price: number;
	compareAtPrice: number;
	images: string[];
	stockLeft: number;
	soldCount: string;
	externalUrl?: string;
	badge?: string;
};

export type Lesson = {
	id: string;
	title: string;
	slug: string;
	order?: number;
	durationSeconds?: number;
	type?: 'video' | 'text';
	video?: { provider?: string; url?: string; embedUrl?: string };
	contentHtml?: string;
};

export type Module = {
	id: string;
	title: string;
	order?: number;
	lessons: Lesson[];
};

export type Course = {
	_id: string;
	title: string;
	slug: string;
	descriptionHtml?: string;
	thumbnailUrl?: string;
	introVideo?: { provider?: string; url?: string; embedUrl?: string };
	level?: string;
	categories: string[];
	tags: string[];
	pricing?: { model: 'free' | 'paid'; amount?: number; compareAt?: number; currency?: string };
	linkedBook?: LinkedBook;
	visibility?: { type: 'public' | 'password' };
	settings?: { isPublicCourse?: boolean; enableQna?: boolean };
	modules: Module[];
	status?: 'draft' | 'published';
	createdAt?: string;
	updatedAt?: string;
};

export type GetCourseResponse =
	| { locked: true; course: Omit<Course, 'modules' | 'tags' | 'descriptionHtml'> }
	| { locked: false; course: Course };
