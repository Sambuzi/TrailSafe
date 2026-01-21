<template>
  <div class="card saved-trails-card">
    <h2>I più popolari</h2>
    <div class="saved-trails-scroll">
      <div v-if="loading" class="loading">Caricamento...</div>
      <div v-else-if="trails.length">
        <div v-for="trail in trails" :key="trail._id" class="trail-item">
          <div class="trail-left"><div class="thumb">🏞️</div></div>
          <div class="trail-body">
            <div class="trail-name">{{ trail.name }}</div>
            <div class="trail-meta">
              <span v-if="trail.difficulty && trail.difficulty.toString().toLowerCase() !== 'medium'" class="badge difficulty">{{ trail.difficulty }}</span>
              <span class="chip">{{ trail.length_km }} km</span>
            </div>
            <div class="trail-sub">Stato: {{ trail.status || 'non specificato' }}</div>
          </div>
          <div class="trail-right"><button class="mini" @click="$emit('open-trail', trail._id)">Dettagli</button></div>
        </div>
      </div>
      <div v-else class="no-trails">Nessun percorso salvato</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PopularTrails',
  data() { return { trails: [], loading: false } },
  async mounted() {
    this.loading = true
    try {
      const res = await fetch('/api/trails/popular')
      if (!res.ok) throw new Error('Failed')
      this.trails = await res.json()
    } catch(e) { this.trails = [] }
    this.loading = false
  }
}
</script>