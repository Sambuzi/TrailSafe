let fetchFn = typeof fetch !== 'undefined' ? fetch : null;
if (!fetchFn) fetchFn = require('node-fetch');

const getWeather = async (first, second, date) => {
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

  // If a date is provided, request enough days from today to include that date (WeatherAPI supports up to 10 days)
  let days = 1;
  if (date) {
    try {
      const target = new Date(date + 'T00:00:00');
      const today = new Date();
      // zero time portion
      target.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (24 * 3600 * 1000));
      if (diffDays < 0) {
        days = 1; // past dates: fallback to 1 day (current/forecast for today)
      } else {
        days = Math.min(diffDays + 1, 10);
      }
    } catch (e) {
      days = 1;
    }
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${q}&days=${days}&aqi=no&alerts=no`;

  const res = await fetchFn(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'WeatherAPI error');

  const icon = (i) => (i?.startsWith('//') ? `https:${i}` : i);

  // If a specific date was requested, try to return the forecast for that date
  if (date) {
    const targetDateStr = date;
    const forecastDay = (data.forecast && data.forecast.forecastday)
      ? data.forecast.forecastday.find(fd => fd.date === targetDateStr)
      : null;

    const fd = forecastDay || (data.forecast && data.forecast.forecastday && data.forecast.forecastday[0]);
    if (!fd) throw new Error('No forecast data available');

    return {
      city: data.location.name,
      coord: { lat: data.location.lat, lon: data.location.lon },
      date: fd.date,

      temp: fd.day.avgtemp_c,
      feels_like: fd.day.avgtemp_c,
      humidity: fd.day.avghumidity,
      wind_speed: +(fd.day.maxwind_kph / 3.6).toFixed(1),
      vis_km: fd.day.avgvis_km,
      uv: fd.day.uv,
      description: fd.day.condition.text,
      icon: icon(fd.day.condition.icon),

      sunrise: fd.astro?.sunrise,
      sunset: fd.astro?.sunset,

      hourly: fd.hour.map(h => ({
        dt: h.time_epoch,
        temp: h.temp_c,
        feels_like: h.feelslike_c,
        wind_speed: +(h.wind_kph / 3.6).toFixed(1),
        pop: h.chance_of_rain,
        icon: icon(h.condition.icon)
      }))
    };
  }

  // Default: return current + today's hourly forecast
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
