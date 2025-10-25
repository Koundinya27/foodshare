const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    enum: ['veg', 'non_veg'],
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['kg', 'servings', 'plates', 'liters'],
      required: true
    }
  },
  preparedTime: {
    type: Date,
    required: true
  },
  pickupTimeStart: {
    type: Date,
    required: true
  },
  pickupTimeEnd: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  willDeliver: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'allotted', 'picked_up', 'expired'],
    default: 'pending'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

donationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);
