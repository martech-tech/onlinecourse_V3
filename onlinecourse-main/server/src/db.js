const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool;

function getPool() {
	if (!pool) {
		throw new Error('DB pool not initialized. Call connectDb() first.');
	}
	return fakePool;
}

// Wrapper to mimic mysql2
async function wrappedQuery(sql, params = []) {
	if (!pool) throw new Error('DB pool not initialized.');
    
    let currentParamIndex = 1;
    let pgSql = sql;
    
    if (params && params.length > 0) {
        pgSql = sql.replace(/\?/g, () => `$${currentParamIndex++}`);
    }

	// Remove backticks
	pgSql = pgSql.replace(/`/g, '"');

	// Boolean mapping: 'TRUE'/'FALSE' to 1/0? Some queries literally check === 1
	// Handled by client usually, but wait.
	
	// Handle MySQL ENUM default values in some query syntax if needed (usually fine)

    const isInsert = /^\s*INSERT\s/i.test(sql);
	let needsReturning = false;
    
    if (isInsert && !pgSql.match(/RETURNING/i)) {
      pgSql += ' RETURNING id';
	  needsReturning = true;
    }

	const client = await pool.connect();
	try {
        const result = await client.query(pgSql, params);
        
        if (isInsert && needsReturning) {
            return [{ insertId: result.rows[0]?.id }, result.fields || []];
        } else if (/^\s*(UPDATE|DELETE)\s/i.test(sql)) {
            return [{ affectedRows: result.rowCount }, result.fields || []];
        }
        
        return [result.rows, result.fields || []];
	} catch (err) {
		console.error("SQL Error in wrapper for:", sql, "\nTranslated to:", pgSql, "\nERROR:", err);
		throw err;
	} finally {
		client.release();
	}
}

const fakePool = {
	query: wrappedQuery,
	getConnection: async () => {
		const client = await pool.connect();
		return {
			query: async (s, p) => wrappedQuery(s, p),
			ping: async () => client.query('SELECT 1'),
			release: () => client.release(),
			beginTransaction: async () => client.query('BEGIN'),
			commit: async () => client.query('COMMIT'),
			rollback: async () => client.query('ROLLBACK')
		};
	}
};

async function connectDb() {
	const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;

	if (!connectionString) {
		console.warn('Missing DATABASE_URL, attempting to construct from individual credentials...');
		const host = process.env.MYSQL_HOST || process.env.PG_HOST;
		const port = Number(process.env.MYSQL_PORT || process.env.PG_PORT || 5432);
		const user = process.env.MYSQL_USER || process.env.PG_USER;
		const password = process.env.MYSQL_PASSWORD || process.env.PG_PASSWORD;
		const database = process.env.MYSQL_DATABASE || process.env.PG_DATABASE;

		if (!host || !user || !database) {
			throw new Error('Missing DATABASE_URL or individual PG credentials');
		}

		pool = new Pool({
			host, port, user, password, database, max: 10
		});
	} else {
		pool = new Pool({ connectionString, max: 10 });
	}

	// Smoke test connection
	const client = await pool.connect();
	try {
		await client.query('SELECT 1');
	} finally {
		client.release();
	}

	await initSchema();

	console.log('Connected to PostgreSQL (Supabase)');
}

async function initSchema() {
	const db = getPool();
	
	// Create trigger function for updated_at
	await db.query(`
		CREATE OR REPLACE FUNCTION trigger_set_timestamp()
		RETURNS TRIGGER AS $$
		BEGIN
		  NEW.updated_at = NOW();
		  RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`);

	// Run Postgres-compatible schemas
	await db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(20) NOT NULL DEFAULT 'student',
			profile_image_url TEXT NULL,
			phone_change_token_hash VARCHAR(255) NULL,
			phone_change_token_expires_at TIMESTAMP(3) NULL,
			first_name VARCHAR(255) NULL,
			last_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NULL,
			is_verified BOOLEAN NOT NULL DEFAULT FALSE,
			verification_token_hash VARCHAR(255) NULL,
			verification_token_expires_at TIMESTAMP(3) NULL,
			bio TEXT NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS admin_users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			last_login_at TIMESTAMP(3) NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS otp_request_rate_limits (
			phone_number VARCHAR(50) PRIMARY KEY,
			attempts INT NOT NULL DEFAULT 0,
			next_allowed_at_ms BIGINT NOT NULL DEFAULT 0,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS login_otp_requests (
			token VARCHAR(64) PRIMARY KEY,
			phone_number VARCHAR(50) NOT NULL,
			provider_token VARCHAR(128) NULL,
			is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
			expires_at TIMESTAMP(3) NOT NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
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
			pricing_amount NUMERIC(10,2) NULL,
			compare_at_price NUMERIC(10,2) NULL,
			pricing_currency VARCHAR(10) NOT NULL DEFAULT 'THB',
			book_product_id BIGINT NULL,
			visibility_type VARCHAR(20) NOT NULL DEFAULT 'public',
			password_hash VARCHAR(255) NULL,
			enable_qna BOOLEAN NOT NULL DEFAULT TRUE,
			status VARCHAR(20) NOT NULL DEFAULT 'draft',
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS modules (
			id BIGSERIAL PRIMARY KEY,
			course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			title VARCHAR(255) NOT NULL,
			module_order INT NOT NULL DEFAULT 0,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (course_id, module_order)
		);
	`);

	await db.query(`
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
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (module_id, slug)
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS enrollments (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
			progress_percent SMALLINT NOT NULL DEFAULT 0,
			completed_lessons_count INT NOT NULL DEFAULT 0,
			total_lessons_count INT NOT NULL DEFAULT 0,
			enrolled_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (user_id, course_id)
		);
	`);

	await db.query(`
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
			faculty_medicine BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_dentistry BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_veterinarians BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_pharmacy BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_medical_technology BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_nursing BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_engineering BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_architecture BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_science BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_business_administration BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_humanities BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_literature BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_social_sciences BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_law BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_education BOOLEAN NOT NULL DEFAULT FALSE,
			faculty_other_text VARCHAR(255) NULL,
			university_chula BOOLEAN NOT NULL DEFAULT FALSE,
			university_thammasat BOOLEAN NOT NULL DEFAULT FALSE,
			university_mahidol BOOLEAN NOT NULL DEFAULT FALSE,
			university_chiangmai BOOLEAN NOT NULL DEFAULT FALSE,
			university_knonkaen BOOLEAN NOT NULL DEFAULT FALSE,
			university_songkhla BOOLEAN NOT NULL DEFAULT FALSE,
			university_ubon BOOLEAN NOT NULL DEFAULT FALSE,
			university_kingmongkut_north BOOLEAN NOT NULL DEFAULT FALSE,
			university_sarakham BOOLEAN NOT NULL DEFAULT FALSE,
			university_walailak BOOLEAN NOT NULL DEFAULT FALSE,
			university_maejo BOOLEAN NOT NULL DEFAULT FALSE,
			university_kingmongkut_ladkrabang BOOLEAN NOT NULL DEFAULT FALSE,
			university_other_text VARCHAR(255) NULL,
			protocol VARCHAR(50) NULL,
			agent TEXT NULL,
			fbp VARCHAR(255) NULL,
			fbc VARCHAR(255) NULL,
			city VARCHAR(100) NULL,
			postal VARCHAR(30) NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS module_access (
			enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
			module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
			unlocked_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (enrollment_id, module_id)
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS lesson_completions (
			enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
			lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
			completed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (enrollment_id, lesson_id)
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_products (
			id BIGSERIAL PRIMARY KEY,
			public_id VARCHAR(64) NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(20) NOT NULL,
			description TEXT NULL,
			details TEXT NULL,
			tags_json JSONB NULL,
			price NUMERIC(10,2) NOT NULL,
			compare_at_price NUMERIC(10,2) NULL,
			stock_left INT NOT NULL DEFAULT 0,
			sold_count INT NOT NULL DEFAULT 0,
			external_url TEXT NULL,
			badge VARCHAR(50) NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_product_images (
			id BIGSERIAL PRIMARY KEY,
			product_id BIGINT NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_banners (
			id BIGSERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			subtitle VARCHAR(255) NULL,
			image_url TEXT NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
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
			subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
			discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
			total NUMERIC(10,2) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			gateway VARCHAR(50) NOT NULL DEFAULT 'paysolutions',
			gateway_reference VARCHAR(128) NULL,
			gateway_status_code VARCHAR(32) NULL,
			gateway_raw_json JSONB NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (gateway, gateway_reference)
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_coupons (
			id BIGSERIAL PRIMARY KEY,
			code VARCHAR(64) NOT NULL UNIQUE,
			description VARCHAR(255) NULL,
			type VARCHAR(20) NOT NULL,
			amount NUMERIC(10,2) NOT NULL,
			min_subtotal NUMERIC(10,2) NULL,
			max_uses INT NULL,
			uses_count INT NOT NULL DEFAULT 0,
			max_uses_per_user INT NULL,
			starts_at TIMESTAMP(3) NULL,
			ends_at TIMESTAMP(3) NULL,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_coupon_redemptions (
			id BIGSERIAL PRIMARY KEY,
			coupon_id BIGINT NOT NULL REFERENCES shop_coupons(id) ON DELETE CASCADE,
			order_id BIGINT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
			user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
			code VARCHAR(64) NOT NULL,
			discount_amount NUMERIC(10,2) NOT NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (coupon_id, order_id)
		);
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS shop_order_items (
			id BIGSERIAL PRIMARY KEY,
			order_id BIGINT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
			product_public_id VARCHAR(64) NOT NULL,
			product_name VARCHAR(255) NOT NULL,
			quantity INT NOT NULL,
			unit_price NUMERIC(10,2) NOT NULL,
			compare_at_price NUMERIC(10,2) NULL,
			line_total NUMERIC(10,2) NOT NULL,
			created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// Auto-setup triggers for updated_at
	const tables = ['users', 'admin_users', 'otp_request_rate_limits', 'courses', 'modules', 'lessons', 'course_registrations', 'shop_products', 'shop_banners', 'shop_orders', 'shop_coupons'];
	for (const tbl of tables) {
		await db.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_${tbl}') THEN
					CREATE TRIGGER set_timestamp_${tbl}
					BEFORE UPDATE ON ${tbl}
					FOR EACH ROW
					EXECUTE FUNCTION trigger_set_timestamp();
				END IF;
			END
			$$;
		`);
	}

	// Seed admin_users
	const seedEmail = process.env.ADMIN_SEED_EMAIL ? String(process.env.ADMIN_SEED_EMAIL).trim().toLowerCase() : 'admin@test.com';
	const seedPassword = process.env.ADMIN_SEED_PASSWORD ? String(process.env.ADMIN_SEED_PASSWORD) : 'password123';
	
	const [adminCountRows] = await db.query('SELECT COUNT(*) AS c FROM admin_users WHERE email = $1', [seedEmail]);
	if (Number(adminCountRows[0].c) === 0) {
		const hash = await bcrypt.hash(seedPassword, 12);
		await db.query('INSERT INTO admin_users (email, password_hash, is_active) VALUES ($1, $2, TRUE)', [seedEmail, hash]);
		console.log('Seeded admin_users:', seedEmail);
	}

	// Seed users (Normal User & Admin Role User)
	const testUserEmail = 'user@test.com';
	const [userCountRows] = await db.query('SELECT COUNT(*) AS c FROM users WHERE email = $1', [testUserEmail]);
	if (Number(userCountRows[0].c) === 0) {
		const hash = await bcrypt.hash('password123', 12);
		await db.query(
			`INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number, is_verified) 
			 VALUES ($1, $2, 'student', 'Test', 'User', '0812345678', TRUE)`,
			[testUserEmail, hash]
		);
		console.log('Seeded users (student):', testUserEmail);
	}

	const testAdminUserEmail = 'admin_user@test.com';
	const [adminUserCountRows] = await db.query('SELECT COUNT(*) AS c FROM users WHERE email = $1', [testAdminUserEmail]);
	if (Number(adminUserCountRows[0].c) === 0) {
		const hash = await bcrypt.hash('password123', 12);
		await db.query(
			`INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number, is_verified) 
			 VALUES ($1, $2, 'admin', 'Admin', 'Test', '0899999999', TRUE)`,
			[testAdminUserEmail, hash]
		);
		console.log('Seeded users (admin):', testAdminUserEmail);
	}

	// Seed a sample course if none exists
	const [courseCountRows] = await db.query('SELECT COUNT(*) AS c FROM courses');
	if (Number(courseCountRows[0].c) === 0) {
		await db.query(
			`INSERT INTO courses (title, slug, description_html, status, visibility_type, pricing_model) 
			 VALUES ('คอร์สทดสอบระบบ (Test Course)', 'test-course', '<p>นี่คือคอร์สทดสอบเบื้องต้นสำหรับระบบใหม่</p>', 'published', 'public', 'free')`
		);
		console.log('Seeded sample course');
	}
}

module.exports = { connectDb, getPool };
