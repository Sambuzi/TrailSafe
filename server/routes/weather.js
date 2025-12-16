const express = require('express');
const router = express.Router();
const { getWeather } = require('../services/weatherService');
 
// Coordinate fisse (es. Misano / Rimini)
router.get('/', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    let weather;

    if (city) {
      weather = await getWeather(city);
    } else if (lat && lon) {
      weather = await getWeather(Number(lat), Number(lon));
    } else {
      // Default to Trentino-Alto Adige center when no coordinates provided
      const dlat = 46.350;
      const dlon = 11.200;
      weather = await getWeather(dlat, dlon);
    }

    res.json({
      city: weather.name || null,
      temp: weather.main.temp,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon
    });
  } catch (err) {
    console.error('Weather route error:', err.message || err);
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

module.exports = router;
