const Donation = require('../models/Donation');

// Create donation
exports.createDonation = async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      donor: req.user._id
    };

    const donation = await Donation.create(donationData);
    
    // Update donor stats
    await req.user.updateOne({
      $inc: { 
        totalDonations: 1,
        totalQuantityDonated: donation.quantity.value
      }
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get donations within radius
exports.getDonationsNearby = async (req, res) => {
  try {
    const { lng, lat, radius = 20 } = req.query;

    const donations = await Donation.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('donor', 'firstName lastName businessName');

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get donor's donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('receiver', 'firstName lastName organizationName')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(0); // All time
    }

    const User = require('../models/User');
    const Donation = require('../models/Donation');

    // Aggregate donations per donor
    const leaderboard = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['allotted', 'picked_up'] }
        }
      },
      {
        $group: {
          _id: '$donor',
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity.value' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      {
        $unwind: '$donor'
      },
      {
        $project: {
          _id: 1,
          totalDonations: 1,
          totalQuantity: 1,
          name: {
            $ifNull: ['$donor.businessName', { $concat: ['$donor.firstName', ' ', '$donor.lastName'] }]
          },
          donorType: '$donor.donorType'
        }
      },
      {
        $sort: { totalDonations: -1, totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
};
// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const User = require('../models/User');
    const Request = require('../models/Request');
    
    // Total users
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalReceivers = await User.countDocuments({ role: 'receiver' });
    
    // Total donations
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'picked_up' });
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    
    // Calculate food saved
    const foodSaved = await Donation.aggregate([
      { $match: { status: 'picked_up' } },
      { $group: { _id: null, total: { $sum: '$quantity.value' } } }
    ]);
    
    // Recent activity
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'firstName lastName businessName')
      .select('foodName quantity status createdAt');
    
    res.json({
      users: {
        totalDonors,
        totalReceivers,
        total: totalDonors + totalReceivers
      },
      donations: {
        total: totalDonations,
        completed: completedDonations,
        pending: pendingDonations
      },
      impact: {
        foodSaved: foodSaved[0]?.total || 0,
        mealsProvided: Math.floor((foodSaved[0]?.total || 0) * 1.5) // Estimate
      },
      recentActivity: recentDonations
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};


