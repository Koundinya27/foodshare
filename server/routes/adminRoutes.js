const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Donation = require('../models/Donation');

// -------- User Management --------

// Get all users
router.get('/users', protect, isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Suspend user (temporary or permanent)
router.post('/users/:id/suspend', protect, isAdmin, async (req, res) => {
  const { reason, until } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.suspended = true;
  user.suspension = { reason, until };
  await user.save();
  res.json({ message: 'User suspended', user });
});

// Unsuspend user
router.post('/users/:id/unsuspend', protect, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.suspended = false;
  user.suspension = null;
  await user.save();
  res.json({ message: 'User unsuspended', user });
});

// Edit user role
router.post('/users/:id/role', protect, isAdmin, async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = role;
  await user.save();
  res.json({ message: 'User role updated', user });
});

// -------- Volunteer/NGO Management --------

// Get all NGO volunteers
router.get('/volunteers', protect, isAdmin, async (req, res) => {
  const volunteers = await User.find({ role: 'ngo_volunteer' });
  res.json(volunteers);
});

// Approve/deactivate volunteer, assign area
router.post('/volunteers/:id', protect, isAdmin, async (req, res) => {
  const { isActive, areaAssigned } = req.body;
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'ngo_volunteer') {
    return res.status(404).json({ message: 'Volunteer not found' });
  }
  if (isActive !== undefined) user.ngoDetails.isActive = isActive;
  if (areaAssigned) user.ngoDetails.areaAssigned = areaAssigned;
  await user.save();
  res.json({ message: 'Volunteer status updated', user });
});

// -------- Report Moderation --------

// Get all reports
router.get('/reports', protect, isAdmin, async (req, res) => {
  const reports = await Report.find().populate('reporter reportedUser donation');
  res.json(reports);
});

// Set report status (reviewed/resolved/dismissed) and admin notes
router.post('/reports/:id/status', protect, isAdmin, async (req, res) => {
  const { status, adminNotes } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;
  if (status === 'resolved') report.resolvedAt = new Date();
  await report.save();
  res.json({ message: 'Report updated', report });
});

// -------- Review Moderation --------

// Get all reviews
router.get('/reviews', protect, isAdmin, async (req, res) => {
  const reviews = await Review.find().populate('user donation');
  res.json(reviews);
});

// Delete a review (abuse/mod reasons)
router.delete('/reviews/:id', protect, isAdmin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Review deleted' });
});

// -------- Donation/Request Management --------

// Get all donations (filter by status/area/time)
router.get('/donations', protect, isAdmin, async (req, res) => {
  const { status, area, from, to } = req.query;
  const query = {};
  if (status) query.status = status;
  if (area) query['location.address'] = { $regex: area, $options: 'i' };
  if (from || to) query.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const donations = await Donation.find(query);
  res.json(donations);
});

// Force complete a donation (admin action)
router.post('/donations/:id/complete', protect, isAdmin, async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: 'Donation not found' });
  donation.status = 'completed';
  await donation.save();
  res.json({ message: 'Donation marked as completed', donation });
});

// -------- Area Analytics for Maps --------

router.get('/donation-areas', protect, isAdmin, async (req, res) => {
  // Group by city or lat/lon grid tile for mapping
  const data = await Donation.aggregate([
    {
      $group: {
        _id: '$location.address',
        count: { $sum: 1 },
        donations: { $push: '$$ROOT' },
        coords: { $push: '$location.coordinates' }
      }
    }
  ]);
  res.json(data);
});

module.exports = router;
