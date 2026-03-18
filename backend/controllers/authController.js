const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const {
      name, age, gender, phoneNumber, password,
      role, region, pincode, city, state,
      organizationName, licenseNumber
    } = req.body;

    // Validate required
    if (!name || !age || !gender || !phoneNumber || !password || !role || !region || !pincode) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Check duplicate phone
    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Phone number already registered' });
    }

    const user = await User.create({
      name, age, gender, phoneNumber, password,
      role, region, pincode,
      city: city || '',
      state: state || '',
      organizationName: organizationName || '',
      licenseNumber: licenseNumber || ''
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      token,
      user
    });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Phone number already registered' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/auth/signin
exports.signin = async (req, res) => {
  try {
    const { phoneNumber, password, role } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'Phone number and password are required' });
    }

    // Find user by phone + role
    const query = { phoneNumber };
    if (role) query.role = role;

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this phone number' });
    }

    if (role && user.role !== role) {
      return res.status(400).json({ success: false, error: `This account is registered as ${user.role}, not ${role}` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: `Login successful`,
      token,
      user
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
