<template>
  <div class="profile-root">
    <div v-if="!user" class="empty">
      <p>Non sei autenticato. Effettua il login per vedere il profilo.</p>
      <router-link to="/login" class="btn">Vai al login</router-link>
    </div>

    <div class="profile-container">
      <header class="profile-header">
        <div class="avatar" :aria-label="userName">{{ initials }}</div>

        <div class="user-info">
          <h1 class="user-name">{{ user?.user?.name || '—' }}</h1>
          <p class="user-level">Livello: {{ user?.user?.level || 'principiante' }}</p>
          <p class="user-email">{{ user?.user?.email || '—' }}</p>
          <p class="user-role">{{ user?.user?.role || 'user' }}</p>
        </div>

  
      </header>

      <main class="profile-body">
        <section class="card info-card">
          <h2 class="card-title">Informazioni</h2>

          <div class="info-grid">
            <div class="row"><span class="label">Nome</span><span class="value">{{ user?.user?.name || '—' }}</span></div>
            <div class="row"><span class="label">Email</span><span class="value">{{ user?.user?.email || '—' }}</span></div>
            <div class="row"><span class="label">Ruolo</span><span class="value">{{ user?.user?.role || 'user' }}</span></div>
          </div>
        </section>

        <!-- Plan excursion modal -->
        <div v-if="showPlanModal" class="plan-modal-overlay">
          <div class="plan-modal">
            <h3>Programma escursione</h3>
            <p>Seleziona la data per l'escursione</p>
            <input type="date" v-model="planDate" />
            <div class="form-actions" style="margin-top:12px">
              <button class="btn" @click="cancelPlan">Annulla</button>
              <button class="btn filled" @click="submitPlan">Conferma</button>
            </div>
          </div>
        </div>

        <section class="card stats-card">
          <h2 class="card-title">Statistiche</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">{{ totalKm }}</div>
              <div class="stat-label">Km programmati</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ savedTrails.length }}</div>
              <div class="stat-label">Percorsi salvati</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ plannedExcursions.length }}</div>
              <div class="stat-label">Escursioni pianificate</div>
            </div>
          </div>
        </section>

        <section class="card saved-trails-card">
          <h2 class="card-title">Percorsi Salvati</h2>
          <div v-if="savedTrails.length === 0" class="no-trails">
            Nessun percorso salvato.
          </div>
          <div v-else class="trails-list">
            <div v-for="trail in savedTrails" :key="trail._id" class="trail-item">
              <h3>{{ trail.name }}</h3>
              <p>Difficoltà: {{ trail.difficulty }} | Lunghezza: {{ trail.length_km }} km</p>
              <div class="trail-actions">
                <router-link :to="`/trail/${trail._id}`" class="btn small tonal">Vedi dettaglio</router-link>
                <button class="btn small tonal" @click="planExcursion(trail._id)">Programma escursione</button>
              </div>
            </div>
          </div>
        </section>

        <section class="card planned-excursions-card">
          <h2 class="card-title">Escursioni Programmati</h2>
          <div v-if="plannedExcursions.length === 0" class="no-trails">
            Nessuna escursione programmata.
          </div>
          <div v-else class="trails-list">
            <div v-for="plan in plannedExcursions" :key="plan._id" :class="['trail-item', { 'plan-today': isToday(plan.date) }]">
              <h3>{{ plan.trail.name }}</h3>
              <p>Data: {{ new Date(plan.date).toLocaleDateString() }}</p>
              <div v-if="plan.forecast" class="plan-forecast">
                <img :src="plan.forecast.icon" alt="meteo" class="forecast-icon" />
                <span class="forecast-temp">{{ Math.round(plan.forecast.temp) }}°C</span>
                <span class="forecast-desc">{{ plan.forecast.description }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import '../css/profilo.css'

export default {
  name: 'Profile',

  data() {
    return {
      user: null,
      savedTrails: [],
      plannedExcursions: [],
      // modal state for planning
      showPlanModal: false,
      planTrailId: null,
      planDate: ''
    };
  },

  computed: {
    userName() {
      return this.user?.user?.name || '';
    },
    initials() {
      const n = this.userName.trim();
      if (!n) return 'TS';
      return n.split(' ').map(s => s[0].toUpperCase()).slice(0,2).join('');
    },
    totalKm() {
      return this.plannedExcursions.reduce((sum, plan) => sum + (plan.trail.length_km || 0), 0);
    }
  },

  created() {
    try { this.user = JSON.parse(localStorage.getItem('ts_user')) || null; } catch (e) { this.user = null; }
    if (this.user) {
      this.fetchProfile();
    }
  },

  methods: {
    async fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${this.user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          this.savedTrails = data.user.savedTrails || [];
        }
        // Fetch planned excursions
        const res2 = await fetch('/api/auth/planned-excursions', {
          headers: { 'Authorization': `Bearer ${this.user.token}` }
        });
        const data2 = await res2.json();
        if (res2.ok) {
          this.plannedExcursions = data2.plannedExcursions || [];
          // fetch per-plan forecasts for the planned dates
          this.fetchPlansForecasts();
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    },
    async fetchPlansForecasts() {
      if (!this.plannedExcursions || !this.plannedExcursions.length) return;
      for (const plan of this.plannedExcursions) {
        try {
          const trail = plan.trail || {};
          const coord = this.getRepresentativeCoord(trail);
          if (!coord) {
            plan.forecast = null;
            continue;
          }
          const dateStr = new Date(plan.date).toISOString().slice(0,10);
          const res = await fetch(`/api/weather?lat=${coord.lat}&lon=${coord.lon}&date=${encodeURIComponent(dateStr)}`);
          if (!res.ok) { plan.forecast = null; continue; }
          const f = await res.json();
          plan.forecast = f;
        } catch (e) {
          console.warn('Failed to fetch forecast for plan', e);
          plan.forecast = null;
        }
      }
      // trigger reactivity
      this.plannedExcursions = [...this.plannedExcursions];
    },

    isToday(d) {
      try {
        const dt = new Date(d);
        const today = new Date();
        dt.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        return dt.getTime() === today.getTime();
      } catch (e) { return false }
    },

    getRepresentativeCoord(trail) {
      // Try GeoJSON geometry (LineString: coordinates = [[lon,lat], ...])
      try {
        const g = trail.geometry;
        if (g && Array.isArray(g.coordinates) && g.coordinates.length > 0) {
          const coords = g.coordinates;
          // handle MultiLineString
          let point = null;
          if (Array.isArray(coords[0][0])) {
            const firstLine = coords[0];
            point = firstLine[Math.floor(firstLine.length/2)];
          } else {
            point = coords[Math.floor(coords.length/2)];
          }
          if (point && point.length >= 2) return { lat: point[1], lon: point[0] };
        }
        // fallback fields
        if (trail.lat && trail.lon) return { lat: trail.lat, lon: trail.lon };
        if (trail.center && Array.isArray(trail.center)) return { lat: trail.center[1], lon: trail.center[0] };
      } catch (e) {
        return null;
      }
      return null;
    },
    
    planExcursion(trailId) {
      // open modal and default date to today
      this.planTrailId = trailId;
      const today = new Date();
      this.planDate = today.toISOString().slice(0,10);
      this.showPlanModal = true;
    },
    cancelPlan() {
      this.showPlanModal = false;
      this.planTrailId = null;
      this.planDate = '';
    },
    async submitPlan() {
      if (!this.planTrailId || !this.planDate) return alert('Seleziona una data valida');
      try {
        const res = await fetch('/api/auth/plan-excursion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.user.token}`
          },
          body: JSON.stringify({ trailId: this.planTrailId, date: this.planDate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Errore');
        // refresh profile to show planned excursions
        this.showPlanModal = false;
        this.planTrailId = null;
        this.planDate = '';
        await this.fetchProfile();
      } catch (err) {
        console.error('Failed to plan excursion', err);
        alert('Impossibile pianificare escursione');
      }
    }
  }
}
</script>

<style scoped>
.plan-today { background: linear-gradient(90deg, rgba(255,249,196,0.95), rgba(255,243,224,0.9)); border-left: 4px solid #f59e0b; padding: 12px; border-radius: 8px }
.plan-forecast { display:flex; gap:8px; align-items:center; margin-top:8px }
.forecast-icon { width:28px; height:28px }
.forecast-temp { font-weight:600; margin-right:6px }
.forecast-desc { color: #374151 }
</style>
