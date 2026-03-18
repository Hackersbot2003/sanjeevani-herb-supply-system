const express = require('express');
const router = express.Router();
const { getGovernmentStats, getAllUsers } = require('../controllers/governmentController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/stats', protect, restrictTo('government'), getGovernmentStats);
router.get('/users', protect, restrictTo('government'), getAllUsers);

module.exports = router;
