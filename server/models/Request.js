const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  note: {
    type: String,
    maxlength: 200,
    trim: true
  }, 
  reviewed: {
    type: Boolean,
    default: false
  },
  
  confirmedAt: Date,
  declinedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  declineReason: String,
  cancellationReason: String
}, {
  timestamps: true
});

requestSchema.index({ receiver: 1, status: 1, createdAt: -1 });
requestSchema.index({ donor: 1, status: 1, createdAt: -1 });
requestSchema.index({ donation: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Request', requestSchema);
