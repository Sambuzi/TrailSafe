const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin fixed-login endpoint
router.post('/admin-login', async (req, res) => {
  // Accept either a username or the admin email as identifier
  const { username, email, password, identifier } = req.body || {};
  const id = identifier || username || email;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trailsafe.local';

  if (!id || !password) return res.status(400).json({ error: 'Username/email and password required' });

  if ((id !== ADMIN_USERNAME && id !== ADMIN_EMAIL) || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  try {
    // Ensure an admin user exists in DB so profile and other endpoints work.
    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      user = new User({ name: 'Administrator', email: ADMIN_EMAIL, passwordHash: hash, role: 'admin' });
      await user.save();
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const secret = process.env.JWT_SECRET || 'change-me-in-env';
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const secret = process.env.JWT_SECRET || 'change-me-in-env';
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    let user = await User.findOne({ email });

    // If user doesn't exist, create one (auto-register on login)
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user = new User({ email, passwordHash: hash, name: req.body.name || '' });
      await user.save();
    } else {
      // If user exists, verify password
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'change-me-in-env';
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile with saved trails
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedTrails');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, email: user.email, name: user.name, savedTrails: user.savedTrails } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a trail
router.post('/save-trail/:trailId', require('../middleware/auth'), async (req, res) => {
  const { trailId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.savedTrails.includes(trailId)) {
      user.savedTrails.push(trailId);
      await user.save();
    }
    res.json({ message: 'Trail saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsave a trail
router.delete('/save-trail/:trailId', require('../middleware/auth'), async (req, res) => {
  const { trailId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.savedTrails = user.savedTrails.filter(id => id.toString() !== trailId);
    await user.save();
    res.json({ message: 'Trail unsaved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Plan an excursion
router.post('/plan-excursion', require('../middleware/auth'), async (req, res) => {
  const { trailId, date } = req.body;
  if (!trailId || !date) return res.status(400).json({ error: 'Trail ID and date required' });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Allow multiple plans for same trail on different dates
    user.plannedExcursions.push({ trail: trailId, date: new Date(date) });
    await user.save();
    res.json({ message: 'Excursion planned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get planned excursions
router.get('/planned-excursions', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('plannedExcursions.trail');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ plannedExcursions: user.plannedExcursions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/settings', require('../middleware/auth'), async (req, res) => {
  const { name, level, notificationsEnabled } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name !== undefined) user.name = name;
    if (level) user.level = level;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    await user.save();
    res.json({ message: 'Settings updated', user: { id: user._id, email: user.email, name: user.name, level: user.level, notificationsEnabled: user.notificationsEnabled } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
