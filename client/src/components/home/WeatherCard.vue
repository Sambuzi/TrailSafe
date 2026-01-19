<template>
  <div class="card weather-card">
    <h2>Meteo</h2>

    <div class="city-search-row">
      <input v-model="cityQuery" @keyup.enter="onSearchCity" type="text" placeholder="Cerca città per il meteo..." class="city-search-input" />
      <button class="btn" @click="onSearchCity">Cerca</button>
    </div>

    <div class="geo-row">
      <button class="btn geo-btn" @click="detectLocation">Usa la mia posizione</button>
    </div>

    <div v-if="loading" class="weather-info">Caricamento meteo...</div>

    <div v-else-if="weather" class="weather-info">
      <div class="weather-scroll">
        <template v-if="!showHourly">
          <div class="weather-main">
            <img class="weather-icon" :src="weather.icon" />
            <div class="weather-text">
              <div class="weather-city">{{ weather.city }}</div>
              <div class="weather-desc">{{ weather.description }}</div>
              <div class="weather-temp">{{ Math.round(weather.temp) }}°C</div>
            </div>
          </div>

          <div class="weather-details">
            <div class="detail"><div class="label">Percepita</div><div class="value">{{ weather.feels_like }}°C</div></div>
            <div class="detail"><div class="label">Umidità</div><div class="value">{{ weather.humidity }}%</div></div>
            <div class="detail"><div class="label">Vento</div><div class="value">{{ weather.wind_speed }} m/s</div></div>
            <div class="detail"><div class="label">Visibilità</div><div class="value">{{ weather.vis_km }} km</div></div>
          </div>
        </template>

        <template v-else>
          <div class="hourly-section" v-if="weather.hourly?.length">
            <h3>Prossime 24 ore</h3>
            <div class="hourly-row">
              <div class="hour-item" v-for="h in weather.hourly" :key="h.dt">
                <div class="hour">{{ formatHour(h.dt) }}</div>
                <img :src="h.icon" />
                <div class="temp">{{ Math.round(h.temp) }}°</div>
              </div>
            </div>
          </div>
        </template>

        <div class="weather-toggle-row">
          <button class="btn geo-btn" @click="toggleHourly">{{ showHourly ? 'Torna al meteo attuale' : 'Vedi meteo per tutta la giornata' }}</button>
        </div>

      </div>
    </div>

    <div v-else-if="error" class="weather-info error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'WeatherCard',
  data() {
    return {
      weather: null,
      cityQuery: '',
      loading: false,
      error: null,
      showHourly: false
    }
  },
  mounted() {
    this.detectLocation()
  },
  methods: {
    toggleHourly() { this.showHourly = !this.showHourly },
    async loadWeather(query) {
      this.loading = true
      this.showHourly = false
      this.error = null
      try {
        let url = '/api/weather'
        if (typeof query === 'string') url += `?city=${encodeURIComponent(query)}`
        if (query?.lat) url += `?lat=${query.lat}&lon=${query.lon}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Weather service error')
        this.weather = await res.json()
      } catch (e) {
        this.error = 'Errore meteo'
        this.weather = null
      } finally { this.loading = false }
    },
    onSearchCity() { if (this.cityQuery) this.loadWeather(this.cityQuery) },
    detectLocation() {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(pos => {
        this.loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      })
    },
    formatHour(ts) { return (new Date(ts * 1000).getHours().toString().padStart(2, '0') + ':00') }
  }
}
</script>