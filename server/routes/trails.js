const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trail = require('../models/Trail');
const Report = require('../models/Report');


// In-memory fallback
let inMemory = [
  { id: 1, name: 'Sentiero dei Faggi', difficulty: 'Facile', status: 'Aperto' },
  { id: 2, name: 'Creste del Monte', difficulty: 'Difficile', status: 'Parzialmente chiuso' }
];

// --------------------------------------
// SEED ROUTE → DEVE STARE PRIMA DI EXPORT
// --------------------------------------
router.get('/seed', async (req, res) => {
  const samples = [

    {
  name: 'Sentiero Costiero',
  difficulty: 'Facile',
  length_km: 5.2,
  geometry: {
    type: 'LineString',
    coordinates: [
      [12.701, 43.968],
      [12.705, 43.970],
      [12.710, 43.973]
    ]
  }
},

{
  "name": "Sentiero del Bosco Fitto",
  "difficulty": "Easy",
  "length_km": 3.5,
  "status": "Aperto",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [12.530, 43.890],
      [12.535, 43.892],
      [12.540, 43.895]
    ]
  }
},

{
  "name": "Cresta del Monte Carpegna",
  "difficulty": "Hard",
  "length_km": 11.8,
  "status": "Aperto",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [12.300, 43.780],
      [12.305, 43.785],
      [12.310, 43.790],
      [12.315, 43.795],
      [12.320, 43.800],
      [12.340, 43.820]
    ]
  }
},
{
  "name": "Sentiero del Bosco Fitto",
  "difficulty": "Easy",
  "length_km": 3.8,
  "status": "Aperto",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [12.530, 43.890],
      [12.532, 43.892],
      [12.535, 43.894],
      [12.538, 43.895],
      [12.540, 43.893],
      [12.538, 43.891],
      [12.535, 43.889],
      [12.532, 43.888],
      [12.530, 43.890]
    ]
  }
},
{
  "name": "Alta Via delle Creste",
  "difficulty": "Hard",
  "length_km": 15.9,
  "status": "Aperto",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [40.850, 16.480],
      [40.853, 16.483],
      [40.857, 16.487],
      [40.861, 16.490],
      [40.858, 16.493],
      [40.862, 16.496],
      [40.865, 16.498]
    ]
  }
}





  ];

  if (mongoose.connection.readyState === 1) {
    try {
      await Trail.deleteMany({ name: { $in: samples.map(s => s.name) }});
      const created = await Trail.insertMany(samples);
      return res.json({ message: 'Seeded DB with sample trails', created });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Seeding failed', details: err.message });
    }
  }

  res.json({ message: 'DB not connected' });
});

// --------------------------------------
// NORMAL ROUTES
// --------------------------------------
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const items = await Trail.find().lean();
    return res.json(items);
  }
  res.json(inMemory);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (mongoose.connection.readyState === 1) {
    try {
      const trail = await Trail.findById(id).lean();
      if (!trail) return res.status(404).json({ error: 'Trail not found' });
      return res.json(trail);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch trail' });
    }
  }
  const trail = inMemory.find(t => t.id == id);
  if (!trail) return res.status(404).json({ error: 'Trail not found' });
  res.json(trail);
});

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

  const nextId = inMemory.length ? Math.max(...inMemory.map(t => t.id)) + 1 : 1;
  const newTrail = { id: nextId, ...req.body };
  inMemory.push(newTrail);
  res.status(201).json(newTrail);
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

  // fallback to in-memory filtering
  let items = inMemory.slice();
  if (difficulty) items = items.filter(t => t.difficulty === difficulty);
  if (name) items = items.filter(t => t.name.toLowerCase().includes(name.toLowerCase()));
  if (min_km) items = items.filter(t => (t.length_km || 0) >= parseFloat(min_km));

  res.json(items);
});

// Return distinct difficulties for building filter UI
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

  // fallback
  const diffs = Array.from(new Set(inMemory.map(t => t.difficulty))).filter(Boolean);
  res.json(diffs);
});



// Export DEFINITIVO (uno solo!)
module.exports = router;
