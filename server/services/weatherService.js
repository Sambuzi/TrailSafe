let fetchFn = typeof fetch !== 'undefined' ? fetch : null;
if (!fetchFn) fetchFn = require('node-fetch');

const getWeather = async (first, second) => {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) throw new Error('WEATHERAPI_KEY missing');

  let q;
  if (typeof first === 'string') {
    q = encodeURIComponent(first);
  } else if (typeof first === 'number' && typeof second === 'number') {
    q = `${first},${second}`;
  } else {
    throw new Error('Invalid arguments');
  }

  const url = `https://api.weatherapi.com/v1/forecast.json
    ?key=${apiKey}
    &q=${q}
    &days=1
    &aqi=no
    &alerts=no`.replace(/\s+/g, '');

  const res = await fetchFn(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'WeatherAPI error');

  const icon = (i) => (i?.startsWith('//') ? `https:${i}` : i);

  return {
    city: data.location.name,
    coord: { lat: data.location.lat, lon: data.location.lon },

    temp: data.current.temp_c,
    feels_like: data.current.feelslike_c,
    humidity: data.current.humidity,
    wind_speed: +(data.current.wind_kph / 3.6).toFixed(1),
    vis_km: data.current.vis_km,
    uv: data.current.uv,
    description: data.current.condition.text,
    icon: icon(data.current.condition.icon),

    sunrise: data.forecast.forecastday[0].astro.sunrise,
    sunset: data.forecast.forecastday[0].astro.sunset,

    hourly: data.forecast.forecastday[0].hour.map(h => ({
      dt: h.time_epoch,
      temp: h.temp_c,
      feels_like: h.feelslike_c,
      wind_speed: +(h.wind_kph / 3.6).toFixed(1),
      pop: h.chance_of_rain,
      icon: icon(h.condition.icon)
    }))
  };
};

module.exports = { getWeather };
