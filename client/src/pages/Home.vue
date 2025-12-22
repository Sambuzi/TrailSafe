<template>
  <div class="home-container">

    <div class="home-actions" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:12px;">
      <button class="btn-primary" @click="openReportModal">Segnala un problema</button>
    </div>

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
          <button class="mini" @click="openTrail(trail._id)">Dettagli</button>
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
        <div v-if="loadingAnnouncements">Caricamento...</div>
        <div v-else>
          <ul v-if="announcements.length">
            <li v-for="a in announcements" :key="a._id">
              <strong>{{ a.trail ? a.trail.name + ':' : '' }}</strong>
              {{ a.text }} <small class="muted">— {{ new Date(a.createdAt).toLocaleString() }}</small>
            </li>
          </ul>
          <div v-else class="muted">Nessun annuncio</div>
        </div>
      </div>

    </div>
  </div>

  <!-- Report modal -->
  <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
    <div class="modal-content" @click.stop>
      <h2>Segnala un problema</h2>

      <form @submit.prevent="submitReport">
        <div class="form-group">
          <label>Nome luogo (opzionale)</label>
          <input v-model="reportForm.placeName" placeholder="Es. Sentiero XYZ" />
        </div>

        <div class="form-group">
          <label>Seleziona percorso (opzionale)</label>
          <select v-model="reportForm.trail">
            <option value="">-- Nessuno --</option>
            <option v-for="t in popularTrails" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Messaggio</label>
          <textarea v-model="reportForm.text" required rows="4" placeholder="Descrivi il problema..."></textarea>
        </div>

        <div class="form-group">
          <label>Foto (opzionale)</label>
          <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="reportForm.imagePreview" style="margin-top:8px;"><img :src="reportForm.imagePreview" style="max-width:200px; max-height:120px; object-fit:cover;" /></div>
        </div>

        <div class="form-group">
          <label>Posizione</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button type="button" class="btn" @click="fillLocation">Usa la mia posizione</button>
            <div style="display:flex;gap:8px;align-items:center;">
              <input v-model.number="reportForm.location.lat" placeholder="Latitudine" style="width:140px;" />
              <input v-model.number="reportForm.location.lng" placeholder="Longitudine" style="width:140px;" />
            </div>
            <div class="muted">{{ (reportForm.location && reportForm.location.lat !== null && reportForm.location.lng !== null) ? (reportForm.location.lat.toFixed(4) + ', ' + reportForm.location.lng.toFixed(4)) : 'Nessuna posizione' }}</div>
          </div>
          <small class="muted">Puoi inserire manualmente le coordinate oppure usare il pulsante per raccogliere la posizione corrente.</small>
        </div>

        <div class="form-actions" style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
          <button type="button" class="btn-secondary" @click="closeReportModal">Annulla</button>
          <button type="submit" class="btn-primary">Invia</button>
        </div>
      </form>
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
      ,
      showReportModal: false,
      reportForm: {
        placeName: '',
        trail: '',
        text: '',
        severity: 'low',
        location: { lat: null, lng: null },
        imageBase64: null,
        imagePreview: null
      }
      ,
      announcements: [],
      loadingAnnouncements: false
    }
  },

  mounted() {
    this.detectLocation()
    this.loadPopularTrails()
    this.loadAnnouncements()
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

    async loadAnnouncements() {
      this.loadingAnnouncements = true;
      try {
        const res = await fetch('/api/reports/approved');
        if (!res.ok) {
          this.announcements = [];
          return;
        }
        this.announcements = await res.json();
      } catch (e) {
        this.announcements = [];
      } finally {
        this.loadingAnnouncements = false;
      }
    },

    formatHour(ts) {
      return (
        new Date(ts * 1000)
          .getHours()
          .toString()
          .padStart(2, '0') + ':00'
      )
    }
    ,
    openTrail(id) {
      if (!id) return;
      this.$router.push(`/trail/${id}`);
    },

    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.token) return {};
        return { Authorization: `Bearer ${parsed.token}` };
      } catch (e) {
        return {};
      }
    },

    fillLocation() {
      if (!navigator.geolocation) return alert('Geolocalizzazione non supportata');
      navigator.geolocation.getCurrentPosition(pos => {
        this.reportForm.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }, () => alert('Impossibile ottenere posizione'));
    },

    onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.reportForm.imageBase64 = reader.result;
        this.reportForm.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    },

    async submitReport() {
      if (!this.reportForm.text) return alert('Inserisci il testo della segnalazione');
      try {
        const payload = {
          trail: this.reportForm.trail || undefined,
          text: this.reportForm.text,
          severity: this.reportForm.severity,
          location: this.reportForm.location,
          imageBase64: this.reportForm.imageBase64
        };
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const body = await res.json();
          alert(body.error || 'Invio fallito');
          return;
        }
        alert('Segnalazione inviata');
        this.closeReportModal();
      } catch (e) {
        alert('Server non raggiungibile');
      }
    },

    closeReportModal() {
      this.showReportModal = false;
      this.reportForm = { placeName: '', trail: '', text: '', severity: 'low', location: { lat: null, lng: null }, imageBase64: null, imagePreview: null };
    },

    openReportModal() {
      this.showReportModal = true;
    }
  }
}
</script>

<style scoped>
/* Modal overlay centered with Material 3-like card */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.40);
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  width: min(820px, 98%);
  background: var(--md-surface, #ffffff);
  color: var(--md-on-surface, #111827);
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0px 10px 30px rgba(16,24,40,0.18);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  max-height: 90vh;
  overflow: auto;
}

.modal-content h2 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group { margin-bottom: 12px; }
.form-group label { display:block; font-size:0.9rem; margin-bottom:6px; color:var(--md-on-surface-variant,#6b7280); }
.form-group input[type="text"], .form-group input[type="number"], .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(16,24,40,0.08);
  background: var(--md-surface-variant, #f8fafc);
  box-sizing: border-box;
}

.form-actions { display:flex; gap:8px; justify-content:flex-end; }
.btn-primary { background: linear-gradient(180deg,var(--md-primary,#6750A4),#533e85); color:white; border:none; padding:10px 14px; border-radius:10px; }
.btn-secondary { background: transparent; border: 1px solid rgba(16,24,40,0.08); padding:8px 12px; border-radius:10px; }

.muted { color: #6b7280; font-size:0.9rem }

/* ensure modal content doesn't push page behind */
body[style] { }
</style>

