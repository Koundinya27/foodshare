const Report = require('../models/Report');
const Donation = require('../models/Donation');

// Create report
const createReport = async (req, res) => {
  try {
    console.log('=== CREATE REPORT START ===');
    const { donationId, type, reason, evidence } = req.body;
    const reporterId = req.user._id;

    // Get donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Determine reported user
    let reportedUser;
    if (type === 'expired_food') {
      // Receiver reports donor
      if (donation.receiver.toString() !== reporterId.toString()) {
        return res.status(403).json({ message: 'Only receiver can report expired food' });
      }
      reportedUser = donation.donor;
    } else if (type === 'no_show') {
      // Donor reports receiver
      if (donation.donor.toString() !== reporterId.toString()) {
        return res.status(403).json({ message: 'Only donor can report no-show' });
      }
      reportedUser = donation.receiver;
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    // Check if already reported
    const existingReport = await Report.findOne({
      reporter: reporterId,
      donation: donationId,
      type
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You already reported this issue' });
    }

    // Create report
    const report = await Report.create({
      reporter: reporterId,
      reportedUser,
      donation: donationId,
      type,
      reason,
      evidence: evidence || ''
    });

    console.log('✅ Report created:', report._id);

    res.status(201).json({
      message: 'Report submitted successfully. We will review it shortly.',
      report
    });
  } catch (error) {
    console.error('❌ Create report error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my reports
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedUser', 'firstName lastName businessName organizationName')
      .populate('donation', 'foodName')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports against me
const getReportsAgainstMe = async (req, res) => {
  try {
    const reports = await Report.find({ reportedUser: req.user._id })
      .populate('reporter', 'firstName lastName organizationName')
      .populate('donation', 'foodName')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportsAgainstMe
};
