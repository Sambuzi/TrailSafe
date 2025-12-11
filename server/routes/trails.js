const express = require('express');
const router = express.Router();

// Sample in-memory trails data
let trails = [
  { id: 1, name: 'Sentiero dei Faggi', difficulty: 'Facile', status: 'Aperto' },
  { id: 2, name: 'Creste del Monte', difficulty: 'Difficile', status: 'Parzialmente chiuso' }
];

router.get('/', (req, res) => {
  res.json(trails);
});

router.get('/:id', (req, res) => {
  const t = trails.find(x => x.id === Number(req.params.id));
  if (!t) return res.status(404).json({ error: 'Trail not found' });
  res.json(t);
});

router.post('/report', (req, res) => {
  // In a real app this would persist a report to DB
  const report = req.body;
  console.log('Received report:', report);
  res.status(201).json({ message: 'Report received', report });
});

module.exports = router;
