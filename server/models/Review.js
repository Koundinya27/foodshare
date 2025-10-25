const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  foodQuality: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor']
  }
}, {
  timestamps: true
});

// One review per donation per user
reviewSchema.index({ donation: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
