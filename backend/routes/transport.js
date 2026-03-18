const express = require('express');
const router = express.Router();
const {
  createTransport, updateTransportQR, getTransportById,
  getMyTransports, getTransportsByArea
} = require('../controllers/transportController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('transporter'), createTransport);
router.patch('/:id/qr', protect, restrictTo('transporter'), updateTransportQR);
router.get('/my', protect, restrictTo('transporter'), getMyTransports);
router.get('/area', protect, restrictTo('lab'), getTransportsByArea);
router.get('/:id', getTransportById); // public — for QR scan

module.exports = router;
