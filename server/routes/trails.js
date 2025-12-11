const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trail = require('../models/Trail');
const Report = require('../models/Report');

// If DB connected, use models; otherwise fallback to in-memory sample data
let inMemory = [
  { id: 1, name: 'Sentiero dei Faggi', difficulty: 'Facile', status: 'Aperto' },
  { id: 2, name: 'Creste del Monte', difficulty: 'Difficile', status: 'Parzialmente chiuso' }
];

router.get('/', async (req, res) => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const items = await Trail.find().limit(100).lean();
    return res.json(items);
  }
  res.json(inMemory);
});

// Create a trail (for seeding/testing)
router.post('/', async (req, res) => {
  const payload = req.body;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const t = new Trail(payload);
      await t.save();
      return res.status(201).json(t);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create trail' });
    }
  }
  // in-memory fallback
  const nextId = inMemory.length ? Math.max(...inMemory.map(x => x.id)) + 1 : 1;
  const newTrail = Object.assign({ id: nextId }, payload);
  inMemory.push(newTrail);
  res.status(201).json(newTrail);
});

router.get('/:id', async (req, res) => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const t = await Trail.findById(req.params.id).lean();
    if (!t) return res.status(404).json({ error: 'Trail not found' });
    return res.json(t);
  }
  const t = inMemory.find(x => x.id === Number(req.params.id));
  if (!t) return res.status(404).json({ error: 'Trail not found' });
  res.json(t);
});

router.post('/:id/report', async (req, res) => {
  const payload = req.body;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const report = new Report({ trail: req.params.id, text: payload.text, severity: payload.severity || 'low', user: payload.user });
      await report.save();
      return res.status(201).json({ message: 'Report saved', report });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save report' });
    }
  }
  console.log('Received report (in-memory):', payload);
  res.status(201).json({ message: 'Report received (in-memory)', report: payload });
});

module.exports = router;

// Seed route to populate sample trails (useful for development)
// GET /api/trails/seed
router.get('/seed', async (req, res) => {
  const samples = [
    { name: 'Sentiero dei Faggi', difficulty: 'Facile', status: 'Aperto', description: 'Bel sentiero boschivo', length_km: 4.2 },
    { name: 'Creste del Monte', difficulty: 'Difficile', status: 'Parzialmente chiuso', description: 'Creste esposte', length_km: 12.1 },
    { name: 'Giro del Lago', difficulty: 'Facile', status: 'Aperto', description: 'Percorso panoramico intorno al lago', length_km: 6.0 }
  ];

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      // remove previous seed by name and insert
      const names = samples.map(s => s.name);
      await Trail.deleteMany({ name: { $in: names } });
      const created = await Trail.insertMany(samples);
      return res.json({ message: 'Seeded DB with sample trails', created: created.map(t => ({ id: t._id, name: t.name })) });
    } catch (err) {
      console.error('Seeding failed:', err);
      return res.status(500).json({ error: 'Seeding failed', details: err.message });
    }
  }

  // in-memory fallback
  // clear existing samples with same names
  const names = samples.map(s => s.name);
  inMemory = inMemory.filter(t => !names.includes(t.name));
  let nextId = inMemory.length ? Math.max(...inMemory.map(x => x.id)) + 1 : 1;
  const created = samples.map(s => ({ id: nextId++, ...s }));
  inMemory = inMemory.concat(created);
  res.json({ message: 'Seeded in-memory trails', created });
});

module.exports = router;
