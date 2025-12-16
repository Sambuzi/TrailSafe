const express = require('express');
const router = express.Router();
const { getWeather } = require('../services/weatherService');
 
// Coordinate fisse (es. Misano / Rimini)
router.get('/', async (req, res) => {
  try {
    const lat = 43.969;
    const lon = 12.693;

    const weather = await getWeather(lat, lon);

    res.json({
      temp: weather.main.temp,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon
    });
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

module.exports = router;
