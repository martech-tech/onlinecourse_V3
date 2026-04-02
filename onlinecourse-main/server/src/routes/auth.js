const express = require('express');

const {
	register,
	registerOtp,
	login,
	loginOtp,
	loginEmailPhone,
	checkoutGuest,
	checkPhoneExists,
	me,
	requestPhoneChange,
	verifyPhoneChange,
	confirmPhoneChange,
	logout,
	verifyEmail,
	resolveCourseRegisterIdentifier,
} = require('../controllers/auth');

const { requestOtp, verifyOtp, requestLoginOtp, verifyLoginOtp } = require('../controllers/otp');
const { startLineLogin, lineCallback, completeLineRegistration } = require('../controllers/line');

const router = express.Router();

router.post('/register', register);
router.post('/register-otp', registerOtp);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/login-email-phone', loginEmailPhone);
router.post('/checkout-guest', checkoutGuest);
router.post('/logout', logout);

// OTP login exchange
router.post('/login-otp', loginOtp);

// Current user
router.get('/me', me);

// OTP (used for course registration step authorization)
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

// Resolve email+phone identifier for course registration step 1 (no OTP)
router.post('/course-register/resolve', resolveCourseRegisterIdentifier);

// Check if phone number exists in DB (used for phone-first registration flow)
router.post('/check-phone', checkPhoneExists);

// OTP (login-only; sends OTP only for existing members)
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);

// Phone change via email link
router.post('/request-phone-change', requestPhoneChange);
router.get('/verify-phone-change', verifyPhoneChange);
router.post('/confirm-phone-change', confirmPhoneChange);

// LINE Login
router.get('/line/start', startLineLogin);
router.get('/line/callback', lineCallback);
router.post('/line/complete-registration', completeLineRegistration);

module.exports = router;
