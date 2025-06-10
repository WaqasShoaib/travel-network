const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({ username, email, password: hash });
    await user.save();

    // Debug JWT_SECRET during token creation
    console.log('🔍 REGISTER - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔍 REGISTER - JWT_SECRET length:', process.env.JWT_SECRET?.length);
    console.log('🔍 REGISTER - JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.substring(0, 10));

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('✅ REGISTER - Token created:', token.substring(0, 20) + '...');

    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Debug JWT_SECRET during token creation
    console.log('🔍 LOGIN - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔍 LOGIN - JWT_SECRET length:', process.env.JWT_SECRET?.length);
    console.log('🔍 LOGIN - JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.substring(0, 10));

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('✅ LOGIN - Token created for user:', user._id);
    console.log('✅ LOGIN - Token starts with:', token.substring(0, 20) + '...');

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('❌ LOGIN - Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};