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
        <PlanModal :visible="showPlanModal" :initial="planInitial" @save="onSavePlan" @close="cancelPlan" />

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

        <SavedTrails :trails="savedTrails" @plan-excursion="planExcursion" />

        <PlannedExcursions :plans="plannedExcursions" @open-plan="openPlan" @cancel-plan="cancelPlanById" />
      </main>
    </div>
  </div>
</template>

<script>
import '../css/profilo.css'
import SavedTrails from '../components/profile/SavedTrails.vue'
import PlannedExcursions from '../components/profile/PlannedExcursions.vue'
import PlanModal from '../components/profile/PlanModal.vue'

export default {
  name: 'Profile',
  components: { SavedTrails, PlannedExcursions, PlanModal },

  data() {
    return {
      user: null,
      savedTrails: [],
      plannedExcursions: [],
      // modal state for planning
      showPlanModal: false,
      planTrailId: null,
      planDate: '',
      // editing plan id (if opening existing plan)
      currentEditPlanId: null
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
    },
    planInitial() {
      const trail = this.savedTrails.find(t => t._id === this.planTrailId) || {};
      return { title: trail.name || '', date: this.planDate || '', notes: '' };
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

          // Human-readable location: prefer explicit place fields, fallback to trail name
          plan.locationName = trail.locationName || trail.place || trail.name || (trail.center && Array.isArray(trail.center) ? `${trail.center[1].toFixed(4)}, ${trail.center[0].toFixed(4)}` : null);
          if (!plan.locationName) plan.locationName = 'Luogo non specificato';
          // Ensure a display title (some plans use separate title)
          plan.title = plan.title || trail.name || 'Escursione';

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
      try {
        // 1) GeoJSON geometry (Point / LineString / MultiLineString)
        if (trail && trail.geometry && Array.isArray(trail.geometry.coordinates) && trail.geometry.coordinates.length > 0) {
          const coords = trail.geometry.coordinates;
          let point = null;

          // Explicit Point geometry
          if (trail.geometry.type === 'Point' && Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number') {
            point = coords;
          } else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            // MultiLineString -> take middle point of first line
            const firstLine = coords[0];
            point = firstLine[Math.floor(firstLine.length / 2)];
          } else if (Array.isArray(coords[0])) {
            // LineString -> take middle coordinate
            point = coords[Math.floor(coords.length / 2)];
          }

          if (point && point.length >= 2) {
            const lon = parseFloat(point[0]);
            const lat = parseFloat(point[1]);
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
          }
        }

        // 2) Common fields and variants
        const toNum = v => (v === undefined || v === null) ? null : Number(v);
        if (trail) {
          const latLonPairs = [
            [trail.lat, trail.lon],
            [trail.latitude, trail.longitude],
            [trail.centerLat || trail.center_lat, trail.centerLon || trail.center_lon],
          ];

          for (const [la, lo] of latLonPairs) {
            const lat = toNum(la);
            const lon = toNum(lo);
            if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
          }

          if (trail.center && Array.isArray(trail.center) && trail.center.length >= 2) {
            const lat = toNum(trail.center[1]);
            const lon = toNum(trail.center[0]);
            if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
          }

          if (trail.location && (trail.location.lat !== undefined || trail.location.latitude !== undefined)) {
            const lat = toNum(trail.location.lat ?? trail.location.latitude);
            const lon = toNum(trail.location.lon ?? trail.location.longitude);
            if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
          }
        }
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
      this.currentEditPlanId = null;
      this.showPlanModal = true;
    },
    cancelPlan() {
      this.showPlanModal = false;
      this.planTrailId = null;
      this.planDate = '';
      this.currentEditPlanId = null;
    },
    async onSavePlan(plan) {
      // plan: { title, date, notes }
      const date = plan?.date || this.planDate;
      if (!this.planTrailId || !date) return alert('Seleziona una data valida');
      try {
        const res = await fetch('/api/auth/plan-excursion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.user.token}`
          },
          body: JSON.stringify({ trailId: this.planTrailId, date })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Errore');
        // refresh profile to show planned excursions
        this.showPlanModal = false;
        this.planTrailId = null;
        this.planDate = '';
        this.currentEditPlanId = null;
        await this.fetchProfile();
      } catch (err) {
        console.error('Failed to plan excursion', err);
        alert('Impossibile pianificare escursione');
      }
    },

    openPlan(id) {
      const p = this.plannedExcursions.find(x => x._id === id);
      if (!p) return;
      this.planTrailId = p.trail?._id || null;
      this.planDate = new Date(p.date).toISOString().slice(0,10);
      this.currentEditPlanId = id;
      this.showPlanModal = true;
    },

    async cancelPlanById(id) {
      if (!confirm('Confermi annullamento dell\'escursione?')) return;
      try {
        // Try to delete via expected endpoint; if not available, fallback to optimistic removal
        const res = await fetch(`/api/auth/planned-excursions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${this.user.token}` } });
        if (res.ok) {
          await this.fetchProfile();
          return;
        }
      } catch (e) {
        console.warn('Delete endpoint not available, falling back to local removal');
      }
      // Fallback: remove locally
      this.plannedExcursions = this.plannedExcursions.filter(p => p._id !== id);
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
