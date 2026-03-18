const express = require('express');
const router = express.Router();
const {
  createLabRecord, updateLabQR, getLabById,
  getMyLabRecords, getLabsByArea
} = require('../controllers/labController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('lab'), createLabRecord);
router.patch('/:id/qr', protect, restrictTo('lab'), updateLabQR);
router.get('/my', protect, restrictTo('lab'), getMyLabRecords);
router.get('/area', protect, restrictTo('manufacturer'), getLabsByArea);
router.get('/:id', getLabById);

module.exports = router;
