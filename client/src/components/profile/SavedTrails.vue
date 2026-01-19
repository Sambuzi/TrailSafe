<template>
  <section class="card saved-trails-card">
    <h2 class="card-title">Percorsi Salvati</h2>

    <div v-if="!trails || trails.length === 0" class="no-trails">Nessun percorso salvato.</div>
    <div v-else class="trails-list">
      <div v-for="trail in trails" :key="trail._id" class="trail-item">
        <h3>{{ trail.name }}</h3>
        <p>Difficoltà: {{ trail.difficulty }} | Lunghezza: {{ trail.length_km }} km</p>
        <div class="trail-actions">
          <router-link :to="`/trail/${trail._id}`" class="btn small tonal">Vedi dettaglio</router-link>
          <button class="btn small tonal" @click="$emit('plan-excursion', trail._id)">Programma escursione</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SavedTrails',
  props: { trails: { type: Array, default: () => [] } }
}
</script>