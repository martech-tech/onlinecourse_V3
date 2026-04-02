const bcrypt = require('bcryptjs');

async function hashPassword(password) {
	if (!password) return '';
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

async function verifyPassword(password, passwordHash) {
	if (!passwordHash) return true;
	if (!password) return false;
	return bcrypt.compare(password, passwordHash);
}

module.exports = { hashPassword, verifyPassword };
