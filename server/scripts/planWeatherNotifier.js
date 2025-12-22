const User = require('../models/User');
const Trail = require('../models/Trail');
const Notification = require('../models/Notification');
const { getWeather } = require('../services/weatherService');

// Simple helper to detect rain/snow from forecast
function conditionIsPrecipitant(forecast) {
  if (!forecast) return false;
  const desc = (forecast.description || '').toLowerCase();
  if (desc.includes('rain') || desc.includes('snow')) return true;
  if (Array.isArray(forecast.hourly)) {
    // if any hour has pop >= 50
    for (const h of forecast.hourly) {
      if ((h.pop || 0) >= 50) return true;
    }
  }
  return false;
}

async function checkPlansOnce() {
  try {
    const users = await User.find({ 'plannedExcursions.0': { $exists: true }, notificationsEnabled: true }).populate('plannedExcursions.trail');
    const today = new Date();
    for (const user of users) {
      let changed = false;
      for (const plan of user.plannedExcursions) {
        try {
          if (!plan.trail) continue;
          const planDate = new Date(plan.date);
          // only consider upcoming plans within next 10 days
          const diffMs = planDate.setHours(0,0,0,0) - (new Date()).setHours(0,0,0,0);
          const diffDays = Math.round(diffMs / (24*3600*1000));
          if (diffDays < 0 || diffDays > 10) continue;

          const coord = (() => {
            const g = plan.trail.geometry;
            if (g && Array.isArray(g.coordinates) && g.coordinates.length > 0) {
              const coords = g.coordinates;
              let point = null;
              if (Array.isArray(coords[0][0])) {
                const firstLine = coords[0];
                point = firstLine[Math.floor(firstLine.length/2)];
              } else {
                point = coords[Math.floor(coords.length/2)];
              }
              if (point && point.length >= 2) return { lat: point[1], lon: point[0] };
            }
            if (plan.trail.lat && plan.trail.lon) return { lat: plan.trail.lat, lon: plan.trail.lon };
            return null;
          })();
          if (!coord) continue;

          const dateStr = new Date(plan.date).toISOString().slice(0,10);
          const forecast = await getWeather(coord.lat, coord.lon, dateStr);
          const precip = conditionIsPrecipitant(forecast);
          const newCond = precip ? (forecast.description && forecast.description.toLowerCase().includes('snow') ? 'snow' : 'rain') : 'clear';

          if (newCond !== (plan.lastNotifiedCondition || 'clear')) {
            // if it became rain or snow, notify
            if (newCond === 'rain' || newCond === 'snow') {
              const msg = `Attenzione: il meteo per ${plan.trail.name} il ${dateStr} prevede ${forecast.description}.`;
              await Notification.create({ user: user._id, trail: plan.trail._id, message: msg, meta: { date: dateStr, condition: newCond } });
            }
            plan.lastNotifiedCondition = newCond;
            changed = true;
          }
        } catch (e) {
          console.warn('Failed checking plan', e);
        }
      }
      if (changed) await user.save();
    }
  } catch (err) {
    console.error('Plan notifier failed', err);
  }
}

function start(intervalMs = 1000 * 60 * 60) {
  // run immediately then at interval (default hourly)
  checkPlansOnce();
  setInterval(checkPlansOnce, intervalMs);
}

module.exports = { start };
