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
