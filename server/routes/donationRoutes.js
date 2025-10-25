const express = require('express');
const router = express.Router();
const { 
  createDonation, 
  getDonationsNearby, 
  getMyDonations,
  getLeaderboard,
  getAnalytics
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createDonation);
router.get('/nearby', getDonationsNearby);
router.get('/my-donations', protect, getMyDonations);
router.get('/leaderboard', getLeaderboard);
router.get('/analytics', getAnalytics);

module.exports = router;
