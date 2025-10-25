const User = require('../models/User');
const generateToken = require('../utils/generateToken');
// Temporarily comment out email import
// const { sendEmail } = require('../config/email');

// Register user
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTRATION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const userData = req.body;

    // Clean up empty strings
    Object.keys(userData).forEach(key => {
      if (userData[key] === '' || userData[key] === null) {
        delete userData[key];
      }
    });

    // Remove confirmPassword
    delete userData.confirmPassword;

    console.log('Cleaned data:', JSON.stringify(userData, null, 2));

    // Validate required fields
    if (!userData.email || !userData.password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    console.log('Checking if user exists...');
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    console.log('Creating new user...');
    // Create user
    const user = await User.create(userData);
    
    console.log('✅ User created successfully:', user._id);

    // Email sending temporarily disabled
    console.log('📧 Email notification skipped (not configured yet)');

    const response = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
    
    console.log('✅ Sending success response');
    console.log('=== REGISTRATION END ===');
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('=== LOGIN START ===');
    console.log('Login attempt for:', req.body.emailOrMobile);
    
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
    }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful for:', user.email);
    console.log('=== LOGIN END ===');

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      location: user.location,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('❌ GET USER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
