const getWeather = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  console.log('API KEY:', apiKey ? 'OK' : 'MISSING');

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  console.log('WEATHER URL:', url);

  const res = await fetch(url);

  console.log('WEATHER STATUS:', res.status);

  const data = await res.json();
  console.log('WEATHER RESPONSE:', data);

  if (!res.ok) {
    throw new Error(data.message || 'Weather fetch failed');
  }

  return data;
};

module.exports = { getWeather };
