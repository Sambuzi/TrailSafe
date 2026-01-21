<template>
  <section class="card saved-trails-card">
    <h2 class="card-title">Percorsi Salvati</h2>

    <div v-if="loading" class="muted">Caricamento percorsi salvati...</div>
    <div v-else-if="!trails || trails.length === 0" class="no-trails">Nessun percorso salvato.</div>
    <div v-else class="trails-list">
      <div v-for="trail in trails" :key="trail._id" class="trail-item">
        <h3>{{ trail.name }}</h3>
        <p>Difficoltà: {{ trail.difficulty }} | Lunghezza: {{ trail.length_km }} km</p>
        <div class="trail-actions">
          <router-link :to="`/trail/${trail._id}`" class="btn small tonal">Vedi dettaglio</router-link>
          <button class="btn small tonal" @click="openPlanModal(trail._id)">Programma escursione</button>
        </div>
      </div>
    </div>

    <PlanModal :visible="showPlanModal" :initial="planInitial" @save="onSavePlan" @close="closePlanModal" />
  </section>
</template>

<script>
import PlanModal from '../../components/profile/PlanModal.vue'

export default {
  name: 'SavedTrails',
  components: { PlanModal },
  data() {
    return { trails: [], loading: false, showPlanModal: false, planInitial: null }
  },
  mounted() {
    this.fetchSavedTrails()
  },
  methods: {
    getAuthHeader() {
      try { const raw = localStorage.getItem('ts_user'); if (!raw) return {}; const parsed = JSON.parse(raw); if (!parsed || !parsed.token) return {}; return { Authorization: `Bearer ${parsed.token}` } } catch (e) { return {} }
    },
    async fetchSavedTrails() {
      this.loading = true
      try {
        const res = await fetch('/api/auth/profile', { headers: this.getAuthHeader() })
        if (!res.ok) { this.trails = []; this.$emit('saved-count', 0); return }
        const j = await res.json()
        this.trails = j.user && j.user.savedTrails ? j.user.savedTrails : []
        this.$emit('saved-count', this.trails.length)
      } catch (e) {
        console.error('fetchSavedTrails', e)
        this.trails = []
        this.$emit('saved-count', 0)
      } finally { this.loading = false }
    },
    openPlanModal(trailId) {
      const trail = this.trails.find(t => t._id === trailId) || {}
      this.planTrailId = trailId
      this.planInitial = { title: trail.name || '', date: '', notes: '' }
      this.showPlanModal = true
    },
    closePlanModal() { this.showPlanModal = false; this.planInitial = null; this.planTrailId = null },
    async onSavePlan(payload) {
      // payload: { title, date, notes }
      try {
        if (!this.planTrailId) return alert('Percorso non selezionato')
        const res = await fetch('/api/auth/plan-excursion', { method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }, body: JSON.stringify({ trailId: this.planTrailId, date: payload.date }) })
        if (!res.ok) { const body = await res.json().catch(() => null); alert((body && (body.error || body.message)) || 'Impossibile pianificare'); return }
        this.showPlanModal = false
        this.planTrailId = null
        this.planInitial = null
        // notify parent so planned list can refresh
        this.$emit('planned')
      } catch (e) { alert('Impossibile contattare il server') }
    }
  }
}
</script>