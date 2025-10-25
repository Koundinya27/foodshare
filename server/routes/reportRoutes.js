const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getReportsAgainstMe } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/against-me', protect, getReportsAgainstMe);

module.exports = router;
