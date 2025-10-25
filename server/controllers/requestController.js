const Request = require('../models/Request');
const Donation = require('../models/Donation');

// Create request (Receiver requests food)
exports.createRequest = async (req, res) => {
  try {
    console.log('=== CREATE REQUEST START ===');
    console.log('Body:', req.body);
    console.log('User:', req.user._id);
    
    const { donationId, note } = req.body;
    const receiverId = req.user._id;

    // Check donation exists
    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log('❌ Donation not found');
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      console.log('❌ Donation not available');
      return res.status(400).json({ message: 'Donation is no longer available' });
    }

    // Check if already requested
    const existingRequest = await Request.findOne({
      donation: donationId,
      receiver: receiverId
    });

    if (existingRequest) {
      console.log('❌ Already requested');
      return res.status(400).json({ message: 'You already requested this donation' });
    }

    // Create request
    const request = await Request.create({
      donation: donationId,
      receiver: receiverId,
      donor: donation.donor,
      note: note || ''
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('receiver', 'firstName lastName organizationName')
      .populate('donation', 'foodName quantity');

    console.log('✅ Request created:', request._id);
    console.log('=== CREATE REQUEST END ===');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('❌ CREATE REQUEST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my requests (Receiver's requests)
exports.getMyRequests = async (req, res) => {
  try {
    console.log('Getting requests for receiver:', req.user._id);
    
    const requests = await Request.find({ receiver: req.user._id })
      .populate('donation', 'foodName quantity foodType location')
      .populate('donor', 'firstName lastName businessName mobile')
      .sort({ createdAt: -1 });

    console.log('Found requests:', requests.length);

    res.json(requests);
  } catch (error) {
    console.error('❌ Get requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get incoming requests (Donor's incoming requests)
exports.getIncomingRequests = async (req, res) => {
  try {
    console.log('Getting incoming requests for donor:', req.user._id);
    
    const requests = await Request.find({ donor: req.user._id })
      .populate('donation', 'foodName quantity foodType')
      .populate('receiver', 'firstName lastName organizationName mobile')
      .sort({ createdAt: -1 });

    console.log('Found incoming requests:', requests.length);

    res.json(requests);
  } catch (error) {
    console.error('❌ Get incoming requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Confirm request (Donor approves)
exports.confirmRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request
    request.status = 'confirmed';
    request.confirmedAt = new Date();
    await request.save();

    // Update donation
    await Donation.findByIdAndUpdate(request.donation, {
      status: 'allotted',
      receiver: request.receiver,
      confirmedAt: new Date()
    });

    // Decline other pending requests
    await Request.updateMany(
      {
        donation: request.donation,
        _id: { $ne: requestId },
        status: 'pending'
      },
      {
        status: 'declined',
        declinedAt: new Date(),
        declineReason: 'Donation allotted to another receiver'
      }
    );

    const populatedRequest = await Request.findById(requestId)
      .populate('receiver', 'firstName lastName organizationName mobile')
      .populate('donation', 'foodName quantity location');

    console.log('✅ Request confirmed:', requestId);

    res.json(populatedRequest);
  } catch (error) {
    console.error('❌ Confirm request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Decline request (Donor rejects)
exports.declineRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'declined';
    request.declinedAt = new Date();
    request.declineReason = reason || 'No reason provided';
    await request.save();

    console.log('✅ Request declined:', requestId);

    res.json(request);
  } catch (error) {
    console.error('❌ Decline request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Complete request (Mark as picked up)
exports.completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Update donation
    await Donation.findByIdAndUpdate(request.donation, {
      status: 'picked_up',
      pickedUpAt: new Date()
    });

    console.log('✅ Request completed:', requestId);

    res.json(request);
  } catch (error) {
    console.error('❌ Complete request error:', error);
    res.status(500).json({ message: error.message });
  }
};
