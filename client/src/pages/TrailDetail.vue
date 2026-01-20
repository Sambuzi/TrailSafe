<!-- Pagina TrailDetail: mostra i dettagli di un percorso escursionistico specifico, inclusi meteo, difficoltà, lunghezza, tempo stimato e segnalazioni degli utenti. -->
<template>
  <div class="trail-detail-card">
    <div class="card-header">
      <h2>{{ trail.name }} <span :class="['status-dot', trail.status === 'Aperto' ? 'open' : 'closed']"></span></h2>
    </div>
    <div class="card-body">
      <div class="map-section">
        <MapView :trails="[trail]" :reports="reports" />
      </div>
      <div class="details-section">
        <div v-if="loadingWeather" class="trail-weather">Caricamento meteo...</div>
        <div v-else-if="weather" class="trail-weather">
          <div class="row">
            <img :src="weather.icon" alt="meteo" />
            <div>
              <div class="temp">{{ Math.round(weather.temp) }}°C</div>
              <div class="desc">{{ weather.description }}</div>
              <div class="muted">{{ weather.city }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="weatherError" class="trail-weather">{{ weatherError }}</div>
        <p><strong>Difficoltà:</strong> {{ trail.difficulty }}</p>
        <p><strong>Lunghezza:</strong> {{ trail.length_km }} km</p>
        <p><strong>Tempo stimato:</strong>
          <span :class="{ 'alert-condition': isPrecipitating }">{{ estimatedDurationLabel }}</span>
        </p>
        <p><strong>Stato:</strong> {{ trail.status }}</p>
        <button class="save-btn" @click="saveTrail" :disabled="!isOpen">{{ isOpen ? 'Salva' : 'Non disponibile' }}</button>


      </div>
    </div>

    <!-- Modal for full report -->
    <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeReportModal">&times;</button>
        <h2>{{ selectedReport ? (selectedReport.user ? (selectedReport.user.name || selectedReport.user.email) : 'Segnalazione') : '' }}</h2>
        <small class="muted">{{ selectedReport ? (new Date(selectedReport.createdAt).toLocaleString()) : '' }}</small>
        <div class="modal-body" style="margin-top:12px">{{ selectedReport ? selectedReport.text : '' }}</div>
        <div v-if="selectedReport && selectedReport.imageUrl" style="margin-top:12px"><img :src="selectedReport.imageUrl" style="max-width:100%;border-radius:8px" /></div>
      </div>
    </div>
  </div>
</template>
<script>
import MapView from '../components/MapView.vue';
import '../css/TrailDetail.css';

export default {
  components: {
    MapView
  },
  props: ['id'],
  data() {
    return {
      trail: {},
      weather: null,
      loadingWeather: false,
      weatherError: null,
      reports: [],
      showReportModal: false,
      selectedReport: null
    };
  },
  computed: {
    isOpen() {
      return this.trail.status === 'Aperto';
    },

    // whether current weather indicates rain or snow / significant precipitation
    isPrecipitating() {
      if (!this.weather) return false;
      const desc = (this.weather.description || '').toLowerCase();
      if (desc.includes('rain') || desc.includes('snow') || desc.includes('piogg') || desc.includes('neve')) return true;
      if (Array.isArray(this.weather.hourly)) {
        return this.weather.hourly.some(h => (h.pop || 0) >= 50);
      }
      return false;
    },

    // estimated duration in minutes, adjusted for difficulty and weather
    estimatedDurationMinutes() {
      const len = Number(this.trail.length_km) || 0;
      // base walking speeds (km/h) by difficulty
      const diff = (this.trail.difficulty || '').toLowerCase();
      let speed = 5; // default km/h
      if (diff.includes('easy') || diff.includes('facile')) speed = 6;
      else if (diff.includes('medium') || diff.includes('medio')) speed = 5;
      else if (diff.includes('hard') || diff.includes('difficile') || diff.includes('avanzato')) speed = 4;

      const baseHours = speed > 0 ? (len / speed) : 0;
      let multiplier = 1.0;
      if (this.isPrecipitating) {
        const desc = (this.weather.description || '').toLowerCase();
        if (desc.includes('snow') || desc.includes('neve')) multiplier = 1.5;
        else multiplier = 1.25; // rain or likely precip
      }

      const minutes = Math.max(1, Math.round(baseHours * 60 * multiplier));
      return minutes;
    },

    estimatedDurationLabel() {
      const mins = this.estimatedDurationMinutes;
      if (mins < 60) return `${mins} min`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m === 0 ? `${h} h` : `${h} h ${m} min`;
    }
  },
  async mounted() {
    try {
      const res = await fetch(`http://localhost:3000/api/trails/${this.id}`);
      this.trail = await res.json();
      // after loading trail, fetch weather at trail coordinates
      this.fetchTrailWeather();
      // load approved reports for this trail
      this.loadReportsForTrail();
    } catch (err) {
      console.error('Failed to load trail', err);
    }
    // load reports for this trail (approved only)
    this.loadReportsForTrail();
  },
  methods: {
    saveTrail() {
      const userData = JSON.parse(localStorage.getItem('ts_user') || '{}');
      if (!userData.token) {
        alert('Devi essere loggato per salvare un percorso');
        this.$router.push('/login');
        return;
      }
      fetch(`http://localhost:3000/api/auth/save-trail/${this.trail._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          alert('Percorso salvato!');
        } else {
          alert('Errore: ' + (data.error || 'Sconosciuto'));
        }
      })
      .catch(err => {
        console.error(err);
        alert('Errore nel salvataggio');
      });
    }
    ,
    async fetchTrailWeather() {
      this.weather = null;
      this.loadingWeather = true;
      this.weatherError = null;
      try {
        // try to derive a representative coordinate from trail geometry
        let lat, lon;
        if (this.trail.geometry && Array.isArray(this.trail.geometry.coordinates) && this.trail.geometry.coordinates.length) {
          const coords = this.trail.geometry.coordinates;
          // coords are LineString: array of [lon, lat]
          const mid = Math.floor(coords.length / 2);
          const sample = coords[mid] || coords[0];
          lon = sample[0];
          lat = sample[1];
        }

        if (lat == null || lon == null) return (this.weatherError = 'Coordinate non disponibili');

        const res = await fetch(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
        if (!res.ok) {
          this.weatherError = 'Impossibile ottenere meteo';
          return;
        }
        this.weather = await res.json();
      } catch (e) {
        console.error(e);
        this.weatherError = 'Errore nel recupero del meteo';
      } finally {
        this.loadingWeather = false;
      }
    },

    async loadReportsForTrail() {
      try {
        const res = await fetch('/api/reports/approved');
        if (!res.ok) return;
        const all = await res.json();
        const filtered = (Array.isArray(all) ? all : []).filter(r => r.trail && (r.trail._id === this.trail._id || String(r.trail) === String(this.trail._id)));
        this.reports = filtered;
      } catch (e) {
        console.warn('Failed to load reports for trail', e);
      }
    },

    openReport(r) {
      this.selectedReport = r;
      this.showReportModal = true;
    },

    closeReportModal() {
      this.selectedReport = null;
      this.showReportModal = false;
    }
  }
}
</script>

<style scoped>
.trail-weather { margin-bottom: 12px; padding: 10px; border-radius: 12px; background: var(--md-surface, #fff); box-shadow: 0 6px 18px rgba(16,24,40,0.06); }
.trail-weather .row { display:flex; gap:12px; align-items:center }
.trail-weather img { width:48px; height:48px }
.trail-weather .temp { font-size:1.25rem; font-weight:600 }
.trail-weather .desc { color:#475569 }
.alert-condition { color: #b91c1c; font-weight: 700; background: rgba(249,115,22,0.06); padding: 2px 6px; border-radius: 6px }
</style>
