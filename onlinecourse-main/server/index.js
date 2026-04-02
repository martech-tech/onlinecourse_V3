const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDb } = require('./src/db');
const coursesRouter = require('./src/routes/courses');
const importsRouter = require('./src/routes/imports');
const authRouter = require('./src/routes/auth');
const adminRouter = require('./src/routes/admin');
const userRouter = require('./src/routes/user');
const shopRouter = require('./src/routes/shop');
const shippingRouter = require('./src/routes/shipping');

// ---------------------------------------------------------------------------
// Global error handlers – prevent silent crashes and unplanned restarts
// ---------------------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
	// eslint-disable-next-line no-console
	console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
	// eslint-disable-next-line no-console
	console.error('Uncaught exception – shutting down gracefully:', err);
	process.exit(1);
});

const app = express();

function normalizeOrigin(origin) {
	return String(origin || '')
		.trim()
		.replace(/\/+$/, '');
}

function parseCorsOrigins(raw) {
	const value = typeof raw === 'string' ? raw : '';
	const parts = value
		.split(',')
		.map((s) => normalizeOrigin(s))
		.filter(Boolean);
	return parts.length > 0 ? parts : [normalizeOrigin('http://localhost:3000')];
}

const allowedCorsOrigins = new Set(parseCorsOrigins(process.env.CORS_ORIGIN));

app.use(
	cors({
		origin: (origin, callback) => {
			// Requests like curl/postman may not send an Origin header
			if (!origin) return callback(null, true);
			const normalized = normalizeOrigin(origin);
			return callback(null, allowedCorsOrigins.has(normalized));
		},
		credentials: true,
	})
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Serve uploaded profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', async (_req, res) => {
	try {
		const { getPool } = require('./src/db');
		const pool = getPool();
		await pool.query('SELECT 1');
		res.json({ ok: true });
	} catch {
		res.status(503).json({ ok: false, error: 'database unavailable' });
	}
});

app.use('/courses', coursesRouter);
app.use('/imports', importsRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/shop', shopRouter);
app.use('/shipping', shippingRouter);

// ---------------------------------------------------------------------------
// 404 catch-all & Express error handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
	res.status(404).json({ error: 'not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	// eslint-disable-next-line no-console
	console.error('Express error handler:', err);
	res.status(err.status || 500).json({ error: 'internal error' });
});

const port = Number(process.env.PORT || 4000);

connectDb()
	.then(() => {
		const server = app.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`API listening on http://localhost:${port}`);
		});

		// Graceful shutdown – let in-flight requests finish before exiting
		function shutdown(signal) {
			// eslint-disable-next-line no-console
			console.log(`${signal} received – closing server`);
			server.close(() => {
				// eslint-disable-next-line no-console
				console.log('Server closed');
				process.exit(0);
			});
			// Force-exit after 10 s if connections won't drain
			setTimeout(() => process.exit(1), 10_000).unref();
		}
		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Failed to start API:', err);
		process.exit(1);
	});
