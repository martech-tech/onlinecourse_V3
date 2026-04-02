const express = require('express');

const { adminLogin, adminLogout, adminMe } = require('../controllers/admin');
const { requireAdmin } = require('../middleware/requireAdmin');
const adminShipping = require('../controllers/adminShipping');
const adminJT = require('../controllers/adminJT');

const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/me', requireAdmin, adminMe);

// --- Shipping management (manual / OCR) ---
router.get('/shipping/orders', requireAdmin, adminShipping.listShippingOrders);
router.patch('/shipping/orders/:id/status', requireAdmin, adminShipping.updateShippingStatus);
router.patch('/shipping/orders/:id/tracking', requireAdmin, adminShipping.saveTrackingNotes);
router.post('/shipping/orders/bulk-print', requireAdmin, adminShipping.bulkPrint);
router.post('/shipping/orders/bulk-import', requireAdmin, adminShipping.bulkImportTracking);

// --- J&T Express Open Platform ---
router.get('/jt/orders', requireAdmin, adminJT.listJTOrders);
router.post('/jt/create-shipment', requireAdmin, adminJT.createShipment);
router.post('/jt/cancel-shipment', requireAdmin, adminJT.cancelShipment);
router.get('/jt/tracking/:billCode', requireAdmin, adminJT.queryTracking);

module.exports = router;
