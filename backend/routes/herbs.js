const express = require('express');
const router = express.Router();
const {
  createHerb, updateHerbQR, getMyHerbs, getHerbById, getHerbsByArea
} = require('../controllers/herbController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('farmer'), createHerb);
router.patch('/:id/qr', protect, restrictTo('farmer'), updateHerbQR);
router.get('/my', protect, restrictTo('farmer'), getMyHerbs);
router.get('/area', protect, restrictTo('transporter'), getHerbsByArea);
router.get('/:id', getHerbById); // public — for QR scan

module.exports = router;
