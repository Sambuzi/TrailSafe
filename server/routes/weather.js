const express = require('express');
const router = express.Router();
const { getWeather } = require('../services/weatherService');

router.get('/', async (req, res) => {
  try {
    const { city, lat, lon, date } = req.query;

    let weather;
    if (city) {
      weather = await getWeather(city, undefined, date);
    } else if (lat && lon) {
      weather = await getWeather(Number(lat), Number(lon), date);
    } else {
      weather = await getWeather(46.35, 11.2, date); // default
    }

    res.json(weather);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

module.exports = router;
