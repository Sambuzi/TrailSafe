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
  }
}
</script>
