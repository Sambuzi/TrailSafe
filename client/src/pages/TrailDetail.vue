<template>
  <div class="trail-detail-card">
    <div class="card-header">
      <h2>{{ trail.name }} <span :class="['status-dot', trail.status === 'Aperto' ? 'open' : 'closed']"></span></h2>
    </div>
    <div class="card-body">
      <div class="map-section">
        <MapView :trails="[trail]" />
      </div>
      <div class="details-section">
        <p><strong>Difficoltà:</strong> {{ trail.difficulty }}</p>
        <p><strong>Lunghezza:</strong> {{ trail.length_km }} km</p>
        <p><strong>Stato:</strong> {{ trail.status }}</p>
        <button class="save-btn" @click="saveTrail" :disabled="!isOpen">{{ isOpen ? 'Salva' : 'Non disponibile' }}</button>
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
      trail: {}
    };
  },
  computed: {
    isOpen() {
      return this.trail.status === 'Aperto';
    }
  },
  async mounted() {
    try {
      const res = await fetch(`http://localhost:3000/api/trails/${this.id}`);
      this.trail = await res.json();
    } catch (err) {
      console.error('Failed to load trail', err);
    }
  },
  methods: {
    saveTrail() {
      // Placeholder for saving the trail
      alert('Percorso salvato! (funzionalità da implementare)');
    }
  }
}
</script>
