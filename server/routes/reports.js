const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Trail = require('../models/Trail');
const User = require('../models/User');

// List reports (admin only)
router.get('/', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    if (mongoose.connection.readyState === 1) {
      const reports = await Report.find().populate('trail').populate('user').sort({ createdAt: -1 }).lean();
      return res.json(reports);
    }

    // If DB not connected, return empty
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: get approved reports (announcements)
router.get('/approved', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const reports = await Report.find({ status: 'approved' }).populate('trail').populate('user').sort({ createdAt: -1 }).lean();
      return res.json(reports);
    }
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report status (approve/reject)
router.put('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    if (mongoose.connection.readyState === 1) {
      const rep = await Report.findById(id);
      if (!rep) return res.status(404).json({ error: 'Report not found' });
      rep.status = status;
      await rep.save();

      // Optionally, if approved, you might mark the related trail or perform other business logic
      const populated = await Report.findById(rep._id).populate('trail').populate('user').lean();
      return res.json(populated);
    }

    res.status(500).json({ error: 'DB not connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a report
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const rep = await Report.findByIdAndDelete(id);
      if (!rep) return res.status(404).json({ error: 'Report not found' });
      return res.json({ message: 'Report deleted' });
    }
    res.status(500).json({ error: 'DB not connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new report (authenticated users)
router.post('/', require('../middleware/auth'), async (req, res) => {
  try {
    const { trail, text, severity, location, imageBase64, imageUrl } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (mongoose.connection.readyState === 1) {
      // prefer provided imageUrl, otherwise imageBase64
      const img = imageUrl || imageBase64 || undefined;
      const rep = new Report({ trail, user: userId, text, severity: severity || 'low', location, imageUrl: img });
      await rep.save();
      const populated = await Report.findById(rep._id).populate('trail').populate('user').lean();
      return res.status(201).json(populated);
    }

    res.status(500).json({ error: 'DB not connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notifications as read for current user
router.post('/mark-read', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.lastSeenNotifications = new Date();
    await user.save();
    res.json({ message: 'Marked read', lastSeenNotifications: user.lastSeenNotifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

