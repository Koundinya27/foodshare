const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, canReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/can-review/:donationId', protect, canReview);

module.exports = router;
