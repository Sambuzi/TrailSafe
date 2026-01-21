<template>
  <div class="card announcements-card">
    <h2>Annunci</h2>
    <div v-if="loading">Caricamento...</div>
    <div v-else>
      <ul v-if="announcements.length" class="announcements-scroll">
        <li v-for="a in announcements" :key="a._id"><strong>{{ a.trail ? a.trail.name + ':' : '' }}</strong> {{ a.text }} <small class="muted">— {{ new Date(a.createdAt).toLocaleString() }}</small></li>
      </ul>
      <div v-else class="muted">Nessun annuncio</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementsList',
  data() { return { announcements: [], loading: false } },
  async mounted() {
    this.loading = true
    try {
      const res = await fetch('/api/reports/approved')
      if (!res.ok) throw new Error('Failed')
      this.announcements = await res.json()
    } catch(e) { this.announcements = [] }
    this.loading = false
  }
}
</script>