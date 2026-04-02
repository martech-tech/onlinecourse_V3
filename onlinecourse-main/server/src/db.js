const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

function getPool() {
	if (!pool) {
		throw new Error('DB pool not initialized. Call connectDb() first.');
	}
	return pool;
}

async function connectDb() {
	const host = process.env.MYSQL_HOST;
	const port = Number(process.env.MYSQL_PORT || 3306);
	const user = process.env.MYSQL_USER;
	const password = process.env.MYSQL_PASSWORD;
	const database = process.env.MYSQL_DATABASE;

	if (!host || !user || !database) {
		throw new Error('Missing MYSQL_* env vars (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE)');
	}

	pool = mysql.createPool({
		host,
		port,
		user,
		password,
		database,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
		charset: 'utf8mb4',
	});

	// Smoke test connection
	const conn = await pool.getConnection();
	try {
		await conn.ping();
	} finally {
		conn.release();
	}

	await initSchema();

	// eslint-disable-next-line no-console
	console.log('Connected to MySQL');
}

async function initSchema() {
	const db = getPool();
	// New-install schema bootstrap. For production, prefer running mysql/init.sql explicitly.
	await db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			email VARCHAR(255) NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role ENUM('student','admin') NOT NULL DEFAULT 'student',
			profile_image_url TEXT NULL,
			phone_change_token_hash VARCHAR(255) NULL,
			phone_change_token_expires_at DATETIME(3) NULL,
			first_name VARCHAR(255) NULL,
			last_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NULL,
			is_verified TINYINT(1) NOT NULL DEFAULT 0,
			verification_token_hash VARCHAR(255) NULL,
			verification_token_expires_at DATETIME(3) NULL,
			bio TEXT NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_users_email (email),
			KEY idx_users_role (role)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	// Backward-compat: add columns for existing DBs
	try {
		await db.query('ALTER TABLE users ADD COLUMN phone_change_token_hash VARCHAR(255) NULL');
	} catch (err) {
		if (!(err && typeof err === 'object' && err.code === 'ER_DUP_FIELDNAME')) throw err;
	}
	try {
		await db.query('ALTER TABLE users ADD COLUMN phone_change_token_expires_at DATETIME(3) NULL');
	} catch (err) {
		if (!(err && typeof err === 'object' && err.code === 'ER_DUP_FIELDNAME')) throw err;
	}

	await db.query(`
		CREATE TABLE IF NOT EXISTS admin_users (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			email VARCHAR(255) NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			last_login_at DATETIME(3) NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_admin_users_email (email),
			KEY idx_admin_users_active (is_active)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS otp_request_rate_limits (
			phone_number VARCHAR(50) NOT NULL,
			attempts INT UNSIGNED NOT NULL DEFAULT 0,
			next_allowed_at_ms BIGINT UNSIGNED NOT NULL DEFAULT 0,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (phone_number)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS login_otp_requests (
			token VARCHAR(64) NOT NULL,
			phone_number VARCHAR(50) NOT NULL,
			provider_token VARCHAR(128) NULL,
			is_dummy TINYINT(1) NOT NULL DEFAULT 0,
			expires_at DATETIME(3) NOT NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (token),
			KEY idx_login_otp_requests_phone_created (phone_number, created_at),
			KEY idx_login_otp_requests_expires (expires_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	// Optional: seed an initial admin user on fresh installs.
	// Set ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD to enable.
	const seedEmail = process.env.ADMIN_SEED_EMAIL ? String(process.env.ADMIN_SEED_EMAIL).trim().toLowerCase() : '';
	const seedPassword = process.env.ADMIN_SEED_PASSWORD ? String(process.env.ADMIN_SEED_PASSWORD) : '';
	if (seedEmail && seedPassword && seedPassword.length >= 8) {
		const [countRows] = await db.query('SELECT COUNT(*) AS c FROM admin_users');
		const existingCount = Array.isArray(countRows) && countRows.length ? Number(countRows[0].c) : 0;
		if (existingCount === 0) {
			const passwordHash = await bcrypt.hash(seedPassword, 12);
			await db.query('INSERT INTO admin_users (email, password_hash, is_active) VALUES (?, ?, 1)', [seedEmail, passwordHash]);
			// eslint-disable-next-line no-console
			console.log('Seeded admin user:', seedEmail);
		}
	}

	await db.query(`
		CREATE TABLE IF NOT EXISTS courses (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			title VARCHAR(255) NOT NULL,
			slug VARCHAR(255) NOT NULL,
			description_html MEDIUMTEXT NULL,
			thumbnail_url TEXT NULL,
			intro_video_url TEXT NULL,
			intro_video_provider VARCHAR(50) NULL,
			level VARCHAR(100) NULL,
			categories_json JSON NULL,
			tags_json JSON NULL,
			pricing_model ENUM('free','paid') NOT NULL DEFAULT 'free',
			pricing_amount DECIMAL(10,2) NULL,
			compare_at_price DECIMAL(10,2) NULL,
			pricing_currency VARCHAR(10) NOT NULL DEFAULT 'THB',
			book_product_id BIGINT UNSIGNED NULL,
			visibility_type ENUM('public','password') NOT NULL DEFAULT 'public',
			password_hash VARCHAR(255) NULL,
			enable_qna TINYINT(1) NOT NULL DEFAULT 1,
			status ENUM('draft','published') NOT NULL DEFAULT 'draft',
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_courses_slug (slug),
			KEY idx_courses_status (status),
			KEY idx_courses_visibility (visibility_type),
			KEY idx_courses_book_product (book_product_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS modules (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			course_id BIGINT UNSIGNED NOT NULL,
			public_id VARCHAR(64) NOT NULL,
			title VARCHAR(255) NOT NULL,
			module_order INT NOT NULL DEFAULT 0,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_modules_public_id (public_id),
			UNIQUE KEY uniq_modules_course_order (course_id, module_order),
			KEY idx_modules_course (course_id),
			CONSTRAINT fk_modules_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS lessons (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			module_id BIGINT UNSIGNED NOT NULL,
			public_id VARCHAR(64) NOT NULL,
			title VARCHAR(255) NOT NULL,
			slug VARCHAR(255) NOT NULL,
			lesson_order INT NOT NULL DEFAULT 0,
			duration_seconds INT UNSIGNED NULL,
			type VARCHAR(20) NULL,
			video_url TEXT NULL,
			video_provider VARCHAR(50) NULL,
			content_html MEDIUMTEXT NULL,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_lessons_public_id (public_id),
			UNIQUE KEY uniq_lessons_module_slug (module_id, slug),
			KEY idx_lessons_module_order (module_id, lesson_order),
			KEY idx_lessons_module_active (module_id, is_active),
			CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS enrollments (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL,
			course_id BIGINT UNSIGNED NOT NULL,
			progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
			completed_lessons_count INT UNSIGNED NOT NULL DEFAULT 0,
			total_lessons_count INT UNSIGNED NOT NULL DEFAULT 0,
			enrolled_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_enrollments_user_course (user_id, course_id),
			KEY idx_enrollments_course (course_id),
			KEY idx_enrollments_user_enrolled_at (user_id, enrolled_at, id),
			CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS course_registrations (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			course_id BIGINT UNSIGNED NOT NULL,
			user_id BIGINT UNSIGNED NULL,
			prefix VARCHAR(50) NULL,
			full_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NOT NULL,
			email VARCHAR(255) NULL,
			grade VARCHAR(100) NULL,
			school_province VARCHAR(100) NULL,

			faculty_medicine TINYINT(1) NOT NULL DEFAULT 0,
			faculty_dentistry TINYINT(1) NOT NULL DEFAULT 0,
			faculty_veterinarians TINYINT(1) NOT NULL DEFAULT 0,
			faculty_pharmacy TINYINT(1) NOT NULL DEFAULT 0,
			faculty_medical_technology TINYINT(1) NOT NULL DEFAULT 0,
			faculty_nursing TINYINT(1) NOT NULL DEFAULT 0,
			faculty_engineering TINYINT(1) NOT NULL DEFAULT 0,
			faculty_architecture TINYINT(1) NOT NULL DEFAULT 0,
			faculty_science TINYINT(1) NOT NULL DEFAULT 0,
			faculty_business_administration TINYINT(1) NOT NULL DEFAULT 0,
			faculty_humanities TINYINT(1) NOT NULL DEFAULT 0,
			faculty_literature TINYINT(1) NOT NULL DEFAULT 0,
			faculty_social_sciences TINYINT(1) NOT NULL DEFAULT 0,
			faculty_law TINYINT(1) NOT NULL DEFAULT 0,
			faculty_education TINYINT(1) NOT NULL DEFAULT 0,
			faculty_other_text VARCHAR(255) NULL,

			university_chula TINYINT(1) NOT NULL DEFAULT 0,
			university_thammasat TINYINT(1) NOT NULL DEFAULT 0,
			university_mahidol TINYINT(1) NOT NULL DEFAULT 0,
			university_chiangmai TINYINT(1) NOT NULL DEFAULT 0,
			university_knonkaen TINYINT(1) NOT NULL DEFAULT 0,
			university_songkhla TINYINT(1) NOT NULL DEFAULT 0,
			university_ubon TINYINT(1) NOT NULL DEFAULT 0,
			university_kingmongkut_north TINYINT(1) NOT NULL DEFAULT 0,
			university_sarakham TINYINT(1) NOT NULL DEFAULT 0,
			university_walailak TINYINT(1) NOT NULL DEFAULT 0,
			university_maejo TINYINT(1) NOT NULL DEFAULT 0,
			university_kingmongkut_ladkrabang TINYINT(1) NOT NULL DEFAULT 0,
			university_other_text VARCHAR(255) NULL,

			protocol VARCHAR(50) NULL,
			agent TEXT NULL,
			fbp VARCHAR(255) NULL,
			fbc VARCHAR(255) NULL,
			city VARCHAR(100) NULL,
			postal VARCHAR(30) NULL,

			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			KEY idx_course_registrations_course_created (course_id, created_at, id),
			KEY idx_course_registrations_phone (phone_number),
			CONSTRAINT fk_course_registrations_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
			CONSTRAINT fk_course_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS module_access (
			enrollment_id BIGINT UNSIGNED NOT NULL,
			module_id BIGINT UNSIGNED NOT NULL,
			unlocked_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (enrollment_id, module_id),
			KEY idx_module_access_module (module_id),
			CONSTRAINT fk_module_access_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
			CONSTRAINT fk_module_access_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS lesson_completions (
			enrollment_id BIGINT UNSIGNED NOT NULL,
			lesson_id BIGINT UNSIGNED NOT NULL,
			completed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (enrollment_id, lesson_id),
			KEY idx_lesson_completions_lesson (lesson_id),
			KEY idx_lesson_completions_enrollment_completed (enrollment_id, completed_at),
			CONSTRAINT fk_lesson_completions_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
			CONSTRAINT fk_lesson_completions_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_products (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			public_id VARCHAR(64) NOT NULL,
			name VARCHAR(255) NOT NULL,
			category ENUM('course','book','camp','other') NOT NULL,
			description TEXT NULL,
			details TEXT NULL,
			tags_json JSON NULL,
			price DECIMAL(10,2) NOT NULL,
			compare_at_price DECIMAL(10,2) NULL,
			stock_left INT UNSIGNED NOT NULL DEFAULT 0,
			sold_count INT UNSIGNED NOT NULL DEFAULT 0,
			external_url TEXT NULL,
			badge VARCHAR(50) NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_shop_products_public_id (public_id),
			KEY idx_shop_products_category (category),
			KEY idx_shop_products_active (is_active, sort_order, id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_product_images (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			product_id BIGINT UNSIGNED NOT NULL,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			KEY idx_shop_product_images_product (product_id, sort_order, id),
			CONSTRAINT fk_shop_product_images_product
				FOREIGN KEY (product_id) REFERENCES shop_products(id)
				ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_banners (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			title VARCHAR(255) NOT NULL,
			subtitle VARCHAR(255) NULL,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			KEY idx_shop_banners_active (is_active, sort_order, id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_orders (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			public_id VARCHAR(64) NOT NULL,
			user_id BIGINT UNSIGNED NULL,
			receiver_name VARCHAR(255) NULL,
			customer_email VARCHAR(255) NULL,
			customer_phone VARCHAR(50) NULL,
			shipping_address TEXT NULL,
			currency VARCHAR(10) NOT NULL DEFAULT 'THB',
			coupon_code VARCHAR(64) NULL,
			subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
			discount_total DECIMAL(10,2) NOT NULL DEFAULT 0,
			total DECIMAL(10,2) NOT NULL DEFAULT 0,
			status ENUM('pending','paid','cancelled','failed') NOT NULL DEFAULT 'pending',
			gateway ENUM('paysolutions') NOT NULL DEFAULT 'paysolutions',
			gateway_reference VARCHAR(128) NULL,
			gateway_status_code VARCHAR(32) NULL,
			gateway_raw_json JSON NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_shop_orders_public_id (public_id),
			UNIQUE KEY uniq_shop_orders_gateway_ref (gateway, gateway_reference),
			KEY idx_shop_orders_user (user_id, created_at, id),
			KEY idx_shop_orders_status (status, created_at, id),
			CONSTRAINT fk_shop_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_coupons (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			code VARCHAR(64) NOT NULL,
			description VARCHAR(255) NULL,
			type ENUM('percent','fixed') NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			min_subtotal DECIMAL(10,2) NULL,
			max_uses INT UNSIGNED NULL,
			uses_count INT UNSIGNED NOT NULL DEFAULT 0,
			max_uses_per_user INT UNSIGNED NULL,
			starts_at DATETIME(3) NULL,
			ends_at DATETIME(3) NULL,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_shop_coupons_code (code),
			KEY idx_shop_coupons_active (is_active, starts_at, ends_at, id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_coupon_redemptions (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			coupon_id BIGINT UNSIGNED NOT NULL,
			order_id BIGINT UNSIGNED NOT NULL,
			user_id BIGINT UNSIGNED NULL,
			code VARCHAR(64) NOT NULL,
			discount_amount DECIMAL(10,2) NOT NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			UNIQUE KEY uniq_shop_coupon_redemptions_order (coupon_id, order_id),
			KEY idx_shop_coupon_redemptions_user (user_id, coupon_id, created_at, id),
			CONSTRAINT fk_shop_coupon_redemptions_coupon FOREIGN KEY (coupon_id) REFERENCES shop_coupons(id) ON DELETE CASCADE,
			CONSTRAINT fk_shop_coupon_redemptions_order FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
			CONSTRAINT fk_shop_coupon_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_order_items (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			order_id BIGINT UNSIGNED NOT NULL,
			product_public_id VARCHAR(64) NOT NULL,
			product_name VARCHAR(255) NOT NULL,
			quantity INT UNSIGNED NOT NULL,
			unit_price DECIMAL(10,2) NOT NULL,
			compare_at_price DECIMAL(10,2) NULL,
			line_total DECIMAL(10,2) NOT NULL,
			created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (id),
			KEY idx_shop_order_items_order (order_id),
			CONSTRAINT fk_shop_order_items_order FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);
}

module.exports = { connectDb, getPool };
