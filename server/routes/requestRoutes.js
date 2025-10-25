const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  confirmRequest,
  declineRequest,
  completeRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/incoming', protect, getIncomingRequests);
router.put('/:requestId/confirm', protect, confirmRequest);
router.put('/:requestId/decline', protect, declineRequest);
router.put('/:requestId/complete', protect, completeRequest);

module.exports = router;
