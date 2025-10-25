const Review = require('../models/Review');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Request = require('../models/Request');

// Create review
exports.createReview = async (req, res) => {
  try {
    console.log('=== CREATE REVIEW START ===');
    console.log('Body:', req.body);
    console.log('User:', req.user._id);
    
    const { donationId, rating, comment, foodQuality } = req.body;
    const reviewerId = req.user._id;

    // Get donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log('❌ Donation not found');
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only receiver can review
    if (donation.receiver.toString() !== reviewerId.toString()) {
      console.log('❌ Not receiver');
      return res.status(403).json({ message: 'Only receiver can review' });
    }

    // Must be completed
    if (donation.status !== 'picked_up') {
      console.log('❌ Not completed');
      return res.status(400).json({ message: 'Can only review completed donations' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ donation: donationId, reviewer: reviewerId });
    if (existingReview) {
      console.log('❌ Already reviewed');
      return res.status(400).json({ message: 'Already reviewed this donation' });
    }

    // Create review
    const review = await Review.create({
      donation: donationId,
      reviewer: reviewerId,
      reviewee: donation.donor,
      rating,
      comment: comment || '',
      foodQuality
    });

    // Mark request as reviewed
    await Request.findOneAndUpdate(
      { donation: donationId, receiver: reviewerId },
      { reviewed: true }
    );

    // Update donor's average rating
    const reviews = await Review.find({ reviewee: donation.donor });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(donation.donor, { averageRating: avgRating });

    console.log('✅ Review created:', review._id);
    console.log('=== CREATE REVIEW END ===');

    res.status(201).json(review);
  } catch (error) {
    console.error('❌ CREATE REVIEW ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'firstName lastName organizationName')
      .populate('donation', 'foodName')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check if user can review (optional)
exports.canReview = async (req, res) => {
  try {
    const { donationId } = req.params;
    const userId = req.user._id;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.json({ canReview: false, message: 'Donation not found' });
    }

    if (donation.receiver.toString() !== userId.toString()) {
      return res.json({ canReview: false, message: 'Only receiver can review' });
    }

    if (donation.status !== 'picked_up') {
      return res.json({ canReview: false, message: 'Donation not completed yet' });
    }

    const existingReview = await Review.findOne({ donation: donationId, reviewer: userId });
    if (existingReview) {
      return res.json({ canReview: false, message: 'Already reviewed', review: existingReview });
    }

    res.json({ canReview: true, donation });
  } catch (error) {
    res.status(500).json({ canReview: false, message: error.message });
  }
};
