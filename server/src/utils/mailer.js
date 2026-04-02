const nodemailer = require('nodemailer');

function smtpConfig() {
	const host = process.env.SMTP_HOST;
	const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const from = process.env.SMTP_FROM;

	if (!host || !port || !user || !pass || !from) return null;
	return { host, port, user, pass, from };
}

function getTransport() {
	const cfg = smtpConfig();
	if (!cfg) return null;
	const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== '0';
	return nodemailer.createTransport({
		host: cfg.host,
		port: cfg.port,
		secure: cfg.port === 465,
		auth: { user: cfg.user, pass: cfg.pass },
		tls: { rejectUnauthorized },
	});
}

async function sendMail({ to, subject, text, html }) {
	const cfg = smtpConfig();
	const transport = getTransport();
	if (!cfg || !transport) {
		throw new Error('SMTP is not configured');
	}

	return await transport.sendMail({
		from: cfg.from,
		to,
		subject,
		text,
		html,
	});
}

module.exports = { sendMail };
