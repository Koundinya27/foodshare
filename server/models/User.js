const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },

  // -------- ROLES & MODERATION --------
  role: {
    type: String,
    enum: ['donor', 'receiver', 'ngo_volunteer', 'admin'],
    required: true
  },
  suspended: { type: Boolean, default: false },
  suspension: {
    reason: String,
    until: Date
  },

  // -------- DONOR-SPECIFIC --------
  donorType: {
    type: String,
    enum: ['individual', 'small_business'],
    default: undefined
  },
  businessType: {
    type: String,
    enum: ['restaurant', 'hotel', 'catering', 'function_hall'],
    default: undefined
  },
  businessName: {
    type: String,
    trim: true
  },

  // -------- RECEIVER-SPECIFIC --------
  receiverType: {
    type: String,
    enum: ['individual', 'group'],
    default: undefined
  },
  organizationType: {
    type: String,
    enum: ['charity', 'orphanage', 'trust', 'other_ngo'],
    default: undefined
  },
  organizationName: {
    type: String,
    trim: true
  },

  // -------- VOLUNTEER (NGO) --------
  ngoDetails: {
    ngoName: String,
    volunteerId: String,    // Optional, unique per org
    areaAssigned: String,
    isActive: { type: Boolean, default: true }
  },

  // -------- COMMON GEOLOCATION --------
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [77.5946, 12.9716]
    },
    address: String
  },

  // -------- METRICS --------
  averageRating: {
    type: Number,
    default: 0
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  totalQuantityDonated: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getDisplayName = function() {
  if (this.role === 'donor' && this.businessName) return this.businessName;
  if (this.role === 'receiver' && this.organizationName) return this.organizationName;
  if (this.role === 'ngo_volunteer' && this.ngoDetails?.ngoName)
    return `${this.ngoDetails.ngoName} Volunteer`;
  if (this.role === 'admin') return 'Admin';
  return `${this.firstName} ${this.lastName}`;
};

module.exports = mongoose.model('User', userSchema);
