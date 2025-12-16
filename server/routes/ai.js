const express = require('express');
const router = express.Router();
const Trail = require('../models/Trail');
const { rankTrails } = require('../services/aiServices');

// AI

router.post('/ai-search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query mancante' });
  }

  try {
    // recupero trails
    const trails = await Trail.find().lean();

    // usa rankTrails per ordinare
    const ranked = await rankTrails(query, trails);

    // top risultati
    res.json(
      ranked.slice(0, 5).map(t => ({
        ...t,
        similarity: t.score
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI search failed' });
  }
});

module.exports = router;