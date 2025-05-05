const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        fullName
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await User.verifyPassword(user, password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: user.avatar_url
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { fullName, bio, avatarUrl } = req.body;

      const user = await User.update(req.user.id, {
        fullName,
        bio,
        avatarUrl
      });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: user.avatar_url
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController; 