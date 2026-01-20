const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trail = require('../models/Trail');
const Report = require('../models/Report');



// Note: seed route and in-memory fallback removed — routes now require a connected MongoDB.
// --------------------------------------
// NORMAL ROUTES
// --------------------------------------
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const items = await Trail.find().lean();
    return res.json(items);
  }
  return res.status(500).json({ error: 'Database not connected' });
});

// NOTE: the route for fetching a single trail by id is declared later
// to avoid conflicts with more specific routes like '/search' or '/difficulties'.
router.post('/', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const t = new Trail(req.body);
      await t.save();
      return res.status(201).json(t);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create trail' });
    }
  }
  return res.status(500).json({ error: 'Database not connected' });
});

// Search with filters: difficulty, name (partial), min_km
router.get('/search', async (req, res) => {
  const { difficulty, name, min_km } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (difficulty) query.difficulty = difficulty;
      if (name) query.name = { $regex: name, $options: 'i' };
      if (min_km) query.length_km = { $gte: parseFloat(min_km) };

      const items = await Trail.find(query).lean();
      return res.json(items);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Search failed' });
    }
  }

  return res.status(500).json({ error: 'Database not connected' });
});
router.get('/difficulties', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const diffs = await Trail.distinct('difficulty');
      return res.json(diffs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get difficulties' });
    }
  }

  return res.status(500).json({ error: 'Database not connected' });
});
// GET /api/trails/popular - Percorsi più popolari (più salvati)
router.get('/popular', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: 'Database not connected' });
  }

  try {
    const User = require('../models/User');
    const popularTrails = await User.aggregate([
      { $unwind: '$savedTrails' },
      { $group: { _id: '$savedTrails', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'trails',
          localField: '_id',
          foreignField: '_id',
          as: 'trail'
        }
      },
      { $unwind: '$trail' },
      {
        $project: {
          _id: '$trail._id',
          name: '$trail.name',
          difficulty: '$trail.difficulty',
          length_km: '$trail.length_km',
          status: '$trail.status',
          popularity: '$count'
        }
      }
    ]);

    res.json(popularTrails);
  } catch (err) {
    console.error('Error fetching popular trails:', err);
    res.status(500).json({ error: 'Failed to get popular trails' });
  }
});

// Count endpoint for admin/statistics
router.get('/count', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const c = await Trail.countDocuments();
      return res.json({ count: c });
    }
    return res.status(500).json({ error: 'Database not connected' });
  } catch (err) {
    console.error('Failed to get trails count', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (mongoose.connection.readyState === 1) {
    try {
      const trail = await Trail.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!trail) return res.status(404).json({ error: 'Trail not found' });
      return res.json(trail);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update trail' });
    }
  }
  return res.status(500).json({ error: 'Database not connected' });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (mongoose.connection.readyState === 1) {
    try {
      const trail = await Trail.findByIdAndDelete(id);
      if (!trail) return res.status(404).json({ error: 'Trail not found' });
      return res.json({ message: 'Trail deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete trail' });
    }
  }
  return res.status(500).json({ error: 'Database not connected' });
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (mongoose.connection.readyState === 1) {
    try {
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid trail id' });
      const trail = await Trail.findById(id).lean();
      if (!trail) return res.status(404).json({ error: 'Trail not found' });
      return res.json(trail);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch trail' });
    }
  }
  return res.status(500).json({ error: 'Database not connected' });
});

module.exports = router;
