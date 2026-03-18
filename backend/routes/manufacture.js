const express = require('express');
const router = express.Router();
const {
  createManufacture, updateManufactureQR, getManufactureById,
  getMyManufactures, getConsumerView
} = require('../controllers/manufactureController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('manufacturer'), createManufacture);
router.patch('/:id/qr', protect, restrictTo('manufacturer'), updateManufactureQR);
router.get('/my', protect, restrictTo('manufacturer'), getMyManufactures);
router.get('/consumer/:id', getConsumerView); // public — for consumer QR scan
router.get('/:id', getManufactureById);

module.exports = router;
