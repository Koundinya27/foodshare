const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  type: {
    type: String,
    enum: ['expired_food', 'no_show', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  evidence: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

reportSchema.index({ reporter: 1, donation: 1 });
reportSchema.index({ reportedUser: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);
