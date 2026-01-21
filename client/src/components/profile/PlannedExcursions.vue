<template>
  <section class="card planned-excursions-card">
    <h2 class="card-title">Escursioni Programmate</h2>

    <div v-if="loading" class="muted">Caricamento escursioni...</div>
    <div v-else-if="!plans || plans.length === 0" class="no-plans">Nessuna escursione programmata.</div>
    <div v-else class="trails-list plans-list">
      <div v-for="plan in plans" :key="plan._id" class="plan-item trail-item">
        <h3>{{ plan.title || plan.trail?.name || 'Escursione' }}</h3>
        <p>{{ formatDate(plan.date) }} — {{ plan.locationName || (plan.trail?.name || 'Luogo non specificato') }}</p>

        <div v-if="plan.forecast" class="plan-forecast">
          <img :src="plan.forecast.icon" alt="meteo" class="forecast-icon" />
          <span class="forecast-temp">{{ Math.round(plan.forecast.temp) }}°C</span>
          <span class="forecast-desc">{{ plan.forecast.description }}</span>
        </div>


      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PlannedExcursions',
  data() {
    return { plans: [], loading: false }
  },
  mounted() {
    this.loadPlans()
  },
  methods: {
    getAuthHeader() {
      try { const raw = localStorage.getItem('ts_user'); if (!raw) return {}; const parsed = JSON.parse(raw); if (!parsed || !parsed.token) return {}; return { Authorization: `Bearer ${parsed.token}` } } catch (e) { return {} }
    },
    formatDate (iso) { try { return new Date(iso).toLocaleString() } catch (e) { return iso } },
    async loadPlans() {
      this.loading = true
      try {
        const res = await fetch('/api/auth/planned-excursions', { headers: this.getAuthHeader() })
        if (!res.ok) { this.plans = []; this.emitStats(); return }
        const j = await res.json()
        this.plans = j.plannedExcursions || []
        await this.fetchForecasts()
        this.emitStats()
      } catch (e) { console.error('loadPlans', e); this.plans = []; this.emitStats() } finally { this.loading = false }
    },
    async fetchForecasts() {
      for (const plan of this.plans) {
        try {
          const trail = plan.trail || {}
          plan.locationName = trail.locationName || trail.place || trail.name || (trail.center && Array.isArray(trail.center) ? `${trail.center[1].toFixed(4)}, ${trail.center[0].toFixed(4)}` : null)
          if (!plan.locationName) plan.locationName = 'Luogo non specificato'

          const coord = this.getRepresentativeCoord(trail)
          if (!coord) { plan.forecast = null; continue }

          const dateStr = new Date(plan.date).toISOString().slice(0,10)
          const res = await fetch(`/api/weather?lat=${coord.lat}&lon=${coord.lon}&date=${encodeURIComponent(dateStr)}`)
          if (!res.ok) { plan.forecast = null; continue }
          const f = await res.json()
          plan.forecast = f
        } catch (e) { console.warn('fetch forecast', e); plan.forecast = null }
      }
      // trigger reactivity
      this.plans = [...this.plans]
    },
    getRepresentativeCoord(trail) {
      try {
        if (trail && trail.geometry && Array.isArray(trail.geometry.coordinates) && trail.geometry.coordinates.length > 0) {
          const coords = trail.geometry.coordinates
          let point = null
          if (trail.geometry.type === 'Point' && Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number') point = coords
          else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            const firstLine = coords[0]; point = firstLine[Math.floor(firstLine.length / 2)]
          } else if (Array.isArray(coords[0])) point = coords[Math.floor(coords.length / 2)]
          if (point && point.length >= 2) {
            const lon = parseFloat(point[0]); const lat = parseFloat(point[1]); if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon }
          }
        }
        const toNum = v => (v === undefined || v === null) ? null : Number(v)
        if (trail) {
          const latLonPairs = [ [trail.lat, trail.lon], [trail.latitude, trail.longitude], [trail.centerLat || trail.center_lat, trail.centerLon || trail.center_lon] ]
          for (const [la, lo] of latLonPairs) {
            const lat = toNum(la); const lon = toNum(lo); if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon }
          }
          if (trail.center && Array.isArray(trail.center) && trail.center.length >= 2) {
            const lat = toNum(trail.center[1]); const lon = toNum(trail.center[0]); if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon }
          }
          if (trail.location && (trail.location.lat !== undefined || trail.location.latitude !== undefined)) {
            const lat = toNum(trail.location.lat ?? trail.location.latitude); const lon = toNum(trail.location.lon ?? trail.location.longitude); if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon }
          }
        }
      } catch (e) { return null }
      return null
    },
    async cancelPlan(id) {
      if (!confirm('Confermi annullamento dell\'escursione?')) return;
      try {
        const res = await fetch(`/api/auth/planned-excursions/${id}`, { method: 'DELETE', headers: this.getAuthHeader() })
        if (!res.ok) { const body = await res.json().catch(() => null); alert(body && body.error ? body.error : 'Eliminazione fallita'); return }
        this.plans = this.plans.filter(p => p._id !== id)
        this.emitStats()
      } catch (e) { alert('Server non raggiungibile') }
    },
    emitStats() {
      const totalKm = (this.plans || []).reduce((sum, p) => sum + ((p.trail && p.trail.length_km) || 0), 0)
      this.$emit('stats', { totalKm, count: this.plans.length })
    }
  }
}
</script>