<template>
  <div class="home-container">

    <!-- METEO -->
    <div class="card weather-card">
      <h2>Meteo</h2>

      <div class="city-search-row">
        <input
          v-model="cityQuery"
          @keyup.enter="onSearchCity"
          type="text"
          placeholder="Cerca città per il meteo..."
          class="city-search-input"
        />
        <button class="btn" @click="onSearchCity">Cerca</button>
      </div>

      <div class="geo-row">
        <button class="btn geo-btn" @click="detectLocation">
          Usa la mia posizione
        </button>
      </div>

      <div v-if="loadingWeather" class="weather-info">
        Caricamento meteo...
      </div>

      <div v-else-if="weather" class="weather-info">
        <div class="weather-scroll">

  <!-- METEO ATTUALE -->
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
      <div class="detail">
        <div class="label">Percepita</div>
        <div class="value">{{ weather.feels_like }}°C</div>
      </div>
      <div class="detail">
        <div class="label">Umidità</div>
        <div class="value">{{ weather.humidity }}%</div>
      </div>
      <div class="detail">
        <div class="label">Vento</div>
        <div class="value">{{ weather.wind_speed }} m/s</div>
      </div>
      <div class="detail">
        <div class="label">Visibilità</div>
        <div class="value">{{ weather.vis_km }} km</div>
      </div>
    </div>
  </template>

  <!-- METEO GIORNALIERO -->
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

  <!-- TOGGLE -->
  <div class="weather-toggle-row">
    <button class="btn geo-btn" @click="toggleHourly">
      {{ showHourly
        ? 'Torna al meteo attuale'
        : 'Vedi meteo per tutta la giornata' }}
    </button>
  </div>

</div>
        </div>


      <div v-else-if="weatherError" class="weather-info error">
        {{ weatherError }}
      </div>
    </div>

    <!-- SEZIONE INFERIORE -->
    <div class="bottom-grid">

      <!-- PERCORSI SALVATI -->
     <div class="card saved-trails-card">
  <h2>I più popolari</h2>

    <div class="saved-trails-scroll">
    <div v-if="loadingPopular" class="loading">
      Caricamento...
    </div>

    <div v-else-if="popularTrails.length">
      <div
        v-for="trail in popularTrails"
        :key="trail._id"
        class="trail-item"
      >
        <div class="trail-left">
          <div class="thumb">🏞️</div>
        </div>
        <div class="trail-body">
          <div class="trail-name">{{ trail.name }}</div>
          <div class="trail-meta">
            <span class="badge difficulty">{{ trail.difficulty }}</span>
            <span class="chip">{{ trail.length_km }} km</span>
          </div>
          <div class="trail-sub">Stato: {{ trail.status || 'non specificato' }}</div>
        </div>
        <div class="trail-right">
          <button class="mini">Dettagli</button>
        </div>
      </div>
    </div>

    <div v-else class="no-trails">
      Nessun percorso salvato
    </div>
  </div>
</div>


  

      <!-- ANNUNCI -->
      <div class="card announcements-card">
        <h2>Annunci</h2>
        <ul>
          <li>⚠️ Sentiero Lago Verde chiuso per manutenzione</li>
          <li>🌧️ Allerta meteo prevista per domani</li>
          <li>ℹ️ Nuovi percorsi disponibili</li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script>
import '../css/Home.css'

export default {
  name: 'Home',

  data() {
    return {
      weather: null,
      cityQuery: '',
      loadingWeather: false,
      weatherError: null,

      showHourly: false, 

      popularTrails: [],
      loadingPopular: false
    }
  },

  mounted() {
    this.detectLocation()
    this.loadPopularTrails()
  },

  methods: {
    toggleHourly() {
      this.showHourly = !this.showHourly
    },

    async loadWeather(query) {
      this.loadingWeather = true
      this.showHourly = false // reset quando carichi nuovo meteo

      try {
        let url = 'http://localhost:3000/api/weather'
        if (typeof query === 'string') url += `?city=${query}`
        if (query?.lat) url += `?lat=${query.lat}&lon=${query.lon}`

        const res = await fetch(url)
        this.weather = await res.json()
      } catch {
        this.weatherError = 'Errore meteo'
      } finally {
        this.loadingWeather = false
      }
    },

    onSearchCity() {
      if (this.cityQuery) {
        this.loadWeather(this.cityQuery)
      }
    },

    detectLocation() {
      navigator.geolocation.getCurrentPosition(pos => {
        this.loadWeather({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      })
    },

    async loadPopularTrails() {
      this.loadingPopular = true
      const res = await fetch('http://localhost:3000/api/trails/popular')
      this.popularTrails = await res.json()
      this.loadingPopular = false
    },

    formatHour(ts) {
      return (
        new Date(ts * 1000)
          .getHours()
          .toString()
          .padStart(2, '0') + ':00'
      )
    }
  }
}
</script>

