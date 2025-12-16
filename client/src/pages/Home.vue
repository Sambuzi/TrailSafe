<template>
  <div class="home-container">
    <!-- SEZIONE SINISTRA -->
    <section class="home-left">
      <!-- Barra di ricerca -->
      <div class="card search-card">
        <h2>Cerca un percorso</h2>
        <input
          type="text"
          placeholder="Descrivi il percorso che cerchi..."
          class="search-input"
        />
      </div>

      <!-- Cerca città per meteo -->
      <div class="card city-search-card">
        <h2>Cerca città (Meteo)</h2>
        <div class="city-search-row">
          <input
            v-model="cityQuery"
            @keyup.enter="onSearchCity"
            type="text"
            placeholder="Inserisci il nome della città..."
            class="city-search-input"
          />
          <button class="btn" @click="onSearchCity">Cerca</button>
        </div>
      </div>

      <!-- Meteo -->
      <div class="card weather-card">
        <h2>Meteo</h2>
        <p v-if="weather && weather.city">Condizioni per: <strong>{{ weather.city }}</strong></p>
        <p v-else>Condizioni attuali nella tua zona</p>

        <div class="geo-row">
          <button class="btn geo-btn" @click="detectLocation">Usa la mia posizione</button>
        </div>

        <div class="weather-info" v-if="loadingWeather">
           Caricamento meteo...
        </div>

        <div class="weather-info" v-else-if="weather">
           <div class="weather-main">
             <img :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`" alt="weather icon"/>
             <div class="weather-text">
               <div class="weather-desc">{{ weather.description }}</div>
               <div class="weather-temp">{{ weather.temp }}°C</div>
             </div>
           </div>
        </div>

        <div class="weather-info error" v-else-if="weatherError">
           {{ weatherError }}
        </div>

      </div>
    </section>

    <!-- SEZIONE DESTRA -->
    <section class="home-right">
      <div class="card announcements-card">
        <h2>Annunci</h2>
        <ul>
          <li>⚠️ Sentiero Lago Verde chiuso per manutenzione</li>
          <li>🌧️ Allerta meteo prevista per domani</li>
          <li>ℹ️ Nuovi percorsi disponibili</li>
        </ul>
      </div>
    </section>
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
      weatherError: null
    }
  },

  mounted() {
    // prova a ottenere subito la posizione dell'utente
    this.detectLocation();
  },

  methods: {
    async loadWeather(query) {
      this.loadingWeather = true;
      this.weatherError = null;

      try {
        let url;

        if (query && typeof query === 'object' && query.lat && query.lon) {
          url = `http://localhost:3000/api/weather?lat=${query.lat}&lon=${query.lon}`;
        } else if (query && typeof query === 'string') {
          url = `http://localhost:3000/api/weather?city=${encodeURIComponent(query)}`;
        } else {
          url = 'http://localhost:3000/api/weather';
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        this.weather = data;
      } catch (err) {
        console.error('Errore meteo:', err);
        this.weatherError = 'Impossibile ottenere il meteo';
        this.weather = null;
      } finally {
        this.loadingWeather = false;
      }
    },

    onSearchCity() {
      const city = (this.cityQuery || '').trim();
      if (!city) return;
      this.loadWeather(city);
    }
    ,

    detectLocation() {
      if (!navigator.geolocation) {
        this.weatherError = 'Geolocalizzazione non supportata dal browser';
        return;
      }

      this.loadingWeather = true;
      this.weatherError = null;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          this.cityQuery = '';
          this.loadWeather({ lat, lon });
        },
        (err) => {
          console.error('Geolocation error', err);
          this.loadingWeather = false;
          this.weatherError = 'Impossibile ottenere la posizione';
          // fallback: carica meteo di default dal server (es. regione preimpostata)
          this.loadWeather();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }
}


</script>
