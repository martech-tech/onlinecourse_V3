const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool;

/**
 * Helper to convert MySQL-style queries to PG-style ($1, $2, etc.)
 * and return a MySQL-compatible result [rows, result].
 */
async function queryWrapper(executor, text, params) {
	let pgText = text;
	let pgParams = params || [];

	// 1. Convert ? placeholders to $1, $2, etc.
	if (pgParams.length > 0) {
		let index = 1;
		pgText = text.replace(/\?/g, () => `$${index++}`);
	}

	// 2. Automatically handle INSERT RETURNING id for MySQL's insertId compatibility
	const isInsert = /^\s*INSERT\s+/i.test(pgText);
	if (isInsert && !/RETURNING\s+/i.test(pgText)) {
		pgText += ' RETURNING id';
	}

	const start = Date.now();
	const res = await executor.query(pgText, pgParams);
	const duration = Date.now() - start;

	// eslint-disable-next-line no-console
	if (process.env.DEBUG_DB) {
		console.log('executed query', { pgText, duration, rows: res.rowCount });
	}

	// 3. Format result like MySQL [rows, result]
	const rows = res.rows;
	const result = {
		...res,
		insertId: isInsert && res.rows[0]?.id ? Number(res.rows[0].id) : null,
		affectedRows: res.rowCount,
	};

	return [rows, result];
}

/**
 * Wrap a single PG Client to emulate a MySQL Connection
 */
function wrapClient(client) {
	return {
		query: (text, params) => queryWrapper(client, text, params),
		beginTransaction: () => client.query('BEGIN'),
		commit: () => client.query('COMMIT'),
		rollback: () => client.query('ROLLBACK'),
		release: () => client.release(),
		// Legacy names
		ping: () => client.query('SELECT 1'),
	};
}

/**
 * Wrap the PG Pool to emulate a MySQL Pool
 */
function wrapPool(p) {
	return {
		query: (text, params) => queryWrapper(p, text, params),
		getConnection: async () => {
			const client = await p.connect();
			return wrapClient(client);
		},
		end: () => p.end(),
	};
}

function getPool() {
	if (!pool) {
		throw new Error('DB pool not initialized. Call connectDb() first.');
	}
	return pool;
}

/**
 * Basic query export (shortcut)
 */
async function query(text, params) {
	return queryWrapper(getPool(), text, params);
}

async function connectDb() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error('Missing DATABASE_URL env var');
	}

	const rawPool = new Pool({
		connectionString,
		ssl: {
			rejectUnauthorized: false,
		},
	});

	// Smoke test connection
	const client = await rawPool.connect();
	try {
		await client.query('SELECT NOW()');
	} finally {
		client.release();
	}

	// Wrap the pool for MySQL compatibility
	pool = wrapPool(rawPool);

	await initSchema();

	// eslint-disable-next-line no-console
	console.log('Connected to PostgreSQL (Supabase) via Compatibility Layer');
}

async function initSchema() {
	// Standard schema initialization (using the new query wrapper)
	await query(`
		CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(20) NOT NULL DEFAULT 'student',
			profile_image_url TEXT NULL,
			phone_change_token_hash VARCHAR(255) NULL,
			phone_change_token_expires_at TIMESTAMPTZ NULL,
			first_name VARCHAR(255) NULL,
			last_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NULL,
			is_verified SMALLINT NOT NULL DEFAULT 0,
			verification_token_hash VARCHAR(255) NULL,
			verification_token_expires_at TIMESTAMPTZ NULL,
			bio TEXT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS admin_users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			is_active SMALLINT NOT NULL DEFAULT 1,
			last_login_at TIMESTAMPTZ NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS otp_request_rate_limits (
			phone_number VARCHAR(50) PRIMARY KEY,
			attempts INT NOT NULL DEFAULT 0,
			next_allowed_at_ms BIGINT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS login_otp_requests (
			token VARCHAR(64) PRIMARY KEY,
			phone_number VARCHAR(50) NOT NULL,
			provider_token VARCHAR(128) NULL,
			is_dummy SMALLINT NOT NULL DEFAULT 0,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS courses (
			id BIGSERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			slug VARCHAR(255) NOT NULL UNIQUE,
			description_html TEXT NULL,
			thumbnail_url TEXT NULL,
			intro_video_url TEXT NULL,
			intro_video_provider VARCHAR(50) NULL,
			level VARCHAR(100) NULL,
			categories_json JSONB NULL,
			tags_json JSONB NULL,
			pricing_model VARCHAR(20) NOT NULL DEFAULT 'free',
			pricing_amount DECIMAL(10,2) NULL,
			compare_at_price DECIMAL(10,2) NULL,
			pricing_currency VARCHAR(10) NOT NULL DEFAULT 'THB',
			book_product_id BIGINT NULL,
			visibility_type VARCHAR(20) NOT NULL DEFAULT 'public',
			password_hash VARCHAR(255) NULL,
			enable_qna SMALLINT NOT NULL DEFAULT 1,
			status VARCHAR(20) NOT NULL DEFAULT 'draft',
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS modules (
			id BIGSERIAL PRIMARY KEY,
			course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			title VARCHAR(255) NOT NULL,
			module_order INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS lessons (
			id BIGSERIAL PRIMARY KEY,
			module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			title VARCHAR(255) NOT NULL,
			slug VARCHAR(255) NOT NULL,
			lesson_order INT NOT NULL DEFAULT 0,
			duration_seconds INT NULL,
			type VARCHAR(20) NULL,
			video_url TEXT NULL,
			video_provider VARCHAR(50) NULL,
			content_html TEXT NULL,
			is_active SMALLINT NOT NULL DEFAULT 1,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (module_id, slug)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS enrollments (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
			progress_percent SMALLINT NOT NULL DEFAULT 0,
			completed_lessons_count INT NOT NULL DEFAULT 0,
			total_lessons_count INT NOT NULL DEFAULT 0,
			enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (user_id, course_id)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS course_registrations (
			id BIGSERIAL PRIMARY KEY,
			course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
			user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
			prefix VARCHAR(50) NULL,
			full_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NOT NULL,
			email VARCHAR(255) NULL,
			grade VARCHAR(100) NULL,
			school_province VARCHAR(100) NULL,
			faculty_medicine SMALLINT NOT NULL DEFAULT 0,
			faculty_dentistry SMALLINT NOT NULL DEFAULT 0,
			faculty_veterinarians SMALLINT NOT NULL DEFAULT 0,
			faculty_pharmacy SMALLINT NOT NULL DEFAULT 0,
			faculty_medical_technology SMALLINT NOT NULL DEFAULT 0,
			faculty_nursing SMALLINT NOT NULL DEFAULT 0,
			faculty_engineering SMALLINT NOT NULL DEFAULT 0,
			faculty_architecture SMALLINT NOT NULL DEFAULT 0,
			faculty_science SMALLINT NOT NULL DEFAULT 0,
			faculty_business_administration SMALLINT NOT NULL DEFAULT 0,
			faculty_humanities SMALLINT NOT NULL DEFAULT 0,
			faculty_literature SMALLINT NOT NULL DEFAULT 0,
			faculty_social_sciences SMALLINT NOT NULL DEFAULT 0,
			faculty_law SMALLINT NOT NULL DEFAULT 0,
			faculty_education SMALLINT NOT NULL DEFAULT 0,
			faculty_other_text VARCHAR(255) NULL,
			university_chula SMALLINT NOT NULL DEFAULT 0,
			university_thammasat SMALLINT NOT NULL DEFAULT 0,
			university_mahidol SMALLINT NOT NULL DEFAULT 0,
			university_chiangmai SMALLINT NOT NULL DEFAULT 0,
			university_knonkaen SMALLINT NOT NULL DEFAULT 0,
			university_songkhla SMALLINT NOT NULL DEFAULT 0,
			university_ubon SMALLINT NOT NULL DEFAULT 0,
			university_kingmongkut_north SMALLINT NOT NULL DEFAULT 0,
			university_sarakham SMALLINT NOT NULL DEFAULT 0,
			university_walailak SMALLINT NOT NULL DEFAULT 0,
			university_maejo SMALLINT NOT NULL DEFAULT 0,
			university_kingmongkut_ladkrabang SMALLINT NOT NULL DEFAULT 0,
			university_other_text VARCHAR(255) NULL,
			protocol VARCHAR(50) NULL,
			agent TEXT NULL,
			fbp VARCHAR(255) NULL,
			fbc VARCHAR(255) NULL,
			city VARCHAR(100) NULL,
			postal VARCHAR(30) NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS module_access (
			enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
			module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
			unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (enrollment_id, module_id)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS lesson_completions (
			enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
			lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
			completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (enrollment_id, lesson_id)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_products (
			id BIGSERIAL PRIMARY KEY,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(20) NOT NULL,
			description TEXT NULL,
			details TEXT NULL,
			tags_json JSONB NULL,
			price DECIMAL(10,2) NOT NULL,
			compare_at_price DECIMAL(10,2) NULL,
			stock_left INT NOT NULL DEFAULT 0,
			sold_count INT NOT NULL DEFAULT 0,
			external_url TEXT NULL,
			badge VARCHAR(50) NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active SMALLINT NOT NULL DEFAULT 1,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_product_images (
			id BIGSERIAL PRIMARY KEY,
			product_id BIGINT NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_banners (
			id BIGSERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			subtitle VARCHAR(255) NULL,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active SMALLINT NOT NULL DEFAULT 1,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_orders (
			id BIGSERIAL PRIMARY KEY,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
			receiver_name VARCHAR(255) NULL,
			customer_email VARCHAR(255) NULL,
			customer_phone VARCHAR(50) NULL,
			shipping_address TEXT NULL,
			currency VARCHAR(10) NOT NULL DEFAULT 'THB',
			coupon_code VARCHAR(64) NULL,
			subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
			discount_total DECIMAL(10,2) NOT NULL DEFAULT 0,
			total DECIMAL(10,2) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			gateway VARCHAR(20) NOT NULL DEFAULT 'paysolutions',
			gateway_reference VARCHAR(128) NULL,
			gateway_status_code VARCHAR(32) NULL,
			gateway_raw_json JSONB NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (gateway, gateway_reference)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_coupons (
			id BIGSERIAL PRIMARY KEY,
			code VARCHAR(64) NOT NULL UNIQUE,
			description VARCHAR(255) NULL,
			type VARCHAR(20) NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			min_subtotal DECIMAL(10,2) NULL,
			max_uses INT NULL,
			uses_count INT NOT NULL DEFAULT 0,
			max_uses_per_user INT NULL,
			starts_at TIMESTAMPTZ NULL,
			ends_at TIMESTAMPTZ NULL,
			is_active SMALLINT NOT NULL DEFAULT 1,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_coupon_redemptions (
			id BIGSERIAL PRIMARY KEY,
			coupon_id BIGINT NOT NULL REFERENCES shop_coupons(id) ON DELETE CASCADE,
			order_id BIGINT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
			user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
			code VARCHAR(64) NOT NULL,
			discount_amount DECIMAL(10,2) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (coupon_id, order_id)
		);
	`);

	await query(`
		CREATE TABLE IF NOT EXISTS shop_order_items (
			id BIGSERIAL PRIMARY KEY,
			order_id BIGINT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
			product_public_id VARCHAR(64) NOT NULL,
			product_name VARCHAR(255) NOT NULL,
			quantity INT NOT NULL,
			unit_price DECIMAL(10,2) NOT NULL,
			compare_at_price DECIMAL(10,2) NULL,
			line_total DECIMAL(10,2) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// Seed admin user from environment variables
	const seedEmail = process.env.ADMIN_SEED_EMAIL ? String(process.env.ADMIN_SEED_EMAIL).trim().toLowerCase() : '';
	const seedPassword = process.env.ADMIN_SEED_PASSWORD ? String(process.env.ADMIN_SEED_PASSWORD) : '';
	if (seedEmail && seedPassword && seedPassword.length >= 8) {
		const [adminRows] = await query('SELECT COUNT(*) AS c FROM admin_users');
		const existingCount = Number(adminRows[0].c);
		if (existingCount === 0) {
			const passwordHash = await bcrypt.hash(seedPassword, 12);
			await query('INSERT INTO admin_users (email, password_hash, is_active) VALUES (?, ?, 1)', [seedEmail, passwordHash]);
			// eslint-disable-next-line no-console
			console.log('Seeded admin user from environment variables:', seedEmail);
		}
	}
}

module.exports = { connectDb, getPool, query };
