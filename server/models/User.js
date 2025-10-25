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
  role: {
    type: String,
    enum: ['donor', 'receiver'],
    required: true
  },
  // Donor-specific fields (OPTIONAL - no validation on empty strings)
  donorType: {
    type: String,
    enum: {
      values: ['individual', 'small_business'],
      message: '{VALUE} is not a valid donor type'
    }
  },
  businessType: {
    type: String,
    enum: {
      values: ['restaurant', 'hotel', 'catering', 'function_hall'],
      message: '{VALUE} is not a valid business type'
    }
  },
  businessName: {
    type: String,
    trim: true
  },
  // Receiver-specific fields (OPTIONAL - no validation on empty strings)
  receiverType: {
    type: String,
    enum: {
      values: ['individual', 'group'],
      message: '{VALUE} is not a valid receiver type'
    }
  },
  organizationType: {
    type: String,
    enum: {
      values: ['charity', 'orphanage', 'trust', 'other_ngo'],
      message: '{VALUE} is not a valid organization type'
    }
  },
  organizationName: {
    type: String,
    trim: true
  },
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

// Create geospatial index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get display name
userSchema.methods.getDisplayName = function() {
  if (this.role === 'donor' && this.businessName) {
    return this.businessName;
  }
  if (this.role === 'receiver' && this.organizationName) {
    return this.organizationName;
  }
  return `${this.firstName} ${this.lastName}`;
};

module.exports = mongoose.model('User', userSchema);
