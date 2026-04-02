const crypto = require('crypto');

const REGISTER_CODE_KEY = 'Jknow1edge';
const REGISTER_CODE_HEX_LEN = 16;

function makeRegisterCode(title) {
	const normalizedTitle = String(title || '').trim();
	if (!normalizedTitle) return '';
	return crypto
		.createHash('sha256')
		.update(`${REGISTER_CODE_KEY}:${normalizedTitle}`, 'utf8')
		.digest('hex')
		.slice(0, REGISTER_CODE_HEX_LEN);
}

module.exports = {
	REGISTER_CODE_KEY,
	REGISTER_CODE_HEX_LEN,
	makeRegisterCode,
};
