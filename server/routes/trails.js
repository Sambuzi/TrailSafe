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
    { name: 'Sentiero dei Faggi', difficulty: 'Facile', status: 'Aperto', description: 'Bel sentiero boschivo', length_km: 4.2 },
    { name: 'Creste del Monte', difficulty: 'Difficile', status: 'Parzialmente chiuso', description: 'Creste esposte', length_km: 12.1 },
    { name: 'Giro del Lago', difficulty: 'Facile', status: 'Aperto', description: 'Percorso panoramico intorno al lago', length_km: 6.0 }
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

// Export DEFINITIVO (uno solo!)
module.exports = router;
