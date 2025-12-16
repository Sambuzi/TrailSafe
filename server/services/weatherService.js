const getWeather = async (lat, lonOrCity) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  console.log('API KEY:', apiKey ? 'OK' : 'MISSING');

  let url = `https://api.openweathermap.org/data/2.5/weather`;

  // If first argument is a string, treat it as city name
  if (typeof lat === 'string') {
    const city = encodeURIComponent(lat);
    url += `?q=${city}&units=metric&appid=${apiKey}`;
  } else if (typeof lat === 'number' && typeof lonOrCity === 'number') {
    const lon = lonOrCity;
    url += `?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  } else {
    throw new Error('Invalid arguments to getWeather');
  }

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
