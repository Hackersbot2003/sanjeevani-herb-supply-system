const express = require('express');
const router = express.Router();
const {
  createManufacture, updateManufactureQR, getManufactureById,
  getMyManufactures, getConsumerView, dispatchManufacture
} = require('../controllers/manufactureController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('manufacturer'), createManufacture);
router.patch('/:id/qr', protect, restrictTo('manufacturer'), updateManufactureQR);
router.patch('/:id/dispatch', protect, restrictTo('manufacturer'), dispatchManufacture);
router.get('/my', protect, restrictTo('manufacturer'), getMyManufactures);
router.get('/consumer/:id', getConsumerView);
router.get('/:id', getManufactureById);

module.exports = router;