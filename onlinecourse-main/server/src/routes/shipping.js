/**
 * Shipping Routes - J&T Express Integration
 *
 * Mount this in server/index.js:
 *   const shippingRouter = require('./src/routes/shipping');
 *   app.use('/shipping', shippingRouter);
 *
 * Import paths assume this file lives at server/src/routes/shipping.js
 */

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');

const shippingController = require('../controllers/shipping');

const router = express.Router();

// --- Customer-facing routes ---

// Save/update shipping address before payment
// POST /shipping/address
// Body: { orderPublicId, receiverName, receiverPhone, receiverAddress, receiverProvince, receiverCity, receiverDistrict, receiverPostCode }
router.post('/address', requireAuth, shippingController.saveShippingAddress);

// Get tracking info for an order (customer view)
// GET /shipping/tracking/:orderPublicId
router.get('/tracking/:orderPublicId', requireAuth, shippingController.getTracking);

// Get tracking by bill code (public - no auth, for sharing tracking link)
// GET /shipping/track?billCode=XXX
router.get('/track', shippingController.getTracking);

// --- Admin routes ---

// Create J&T shipment after payment confirmed (admin action)
// POST /shipping/shipment
// Body: { orderPublicId }
router.post('/shipment', requireAdmin, shippingController.createShipment);

// Cancel shipment (admin action)
// POST /shipping/cancel
// Body: { orderPublicId, reason }
router.post('/cancel', requireAdmin, shippingController.cancelShipment);

// --- J&T Callback Webhook ---
// POST /shipping/callback
// This URL must be registered with J&T in their portal
// No auth middleware - J&T sends callbacks directly as JSON
router.post('/callback', shippingController.handleCallback);

module.exports = router;
