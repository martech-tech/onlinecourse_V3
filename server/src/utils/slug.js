const slugify = require('slugify');

function makeSlug(input) {
	return slugify(String(input || ''), { lower: true, strict: true, trim: true });
}

module.exports = { makeSlug };
