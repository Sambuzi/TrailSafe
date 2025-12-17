<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'MapView',
  props: {
    trails: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      map: null,
      trailsLayer: null
    };
  },
  async mounted() {
    // Default view centered on Trentino-Alto Adige
    this.map = L.map('map').setView([46.35, 11.20], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // layer group to manage polylines/markers
    this.trailsLayer = L.layerGroup().addTo(this.map);

    // Define global function for popup button
    window.viewTrailDetail = (id) => {
      this.$router.push('/trail/' + id);
    };

    // if parent passed trails already, draw them; otherwise fetch all
    if (this.trails && this.trails.length) {
      this.drawTrails(this.trails);
    } else {
      try {
        const res = await fetch('http://localhost:3000/api/trails');
        const trails = await res.json();
        this.drawTrails(trails);
      } catch (err) {
        console.error('Failed to load trails in MapView', err);
      }
    }
  },
  watch: {
    trails(newVal) {
      this.drawTrails(newVal || []);
    }
  },
  methods: {
    drawTrails(trails) {
      if (!this.map || !this.trailsLayer) return;

      this.trailsLayer.clearLayers();
      const bounds = L.latLngBounds([]);

      trails.forEach(trail => {
        if (!trail.geometry || !trail.geometry.coordinates) return;

        const latlngs = trail.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        // choose color based on difficulty (simple mapping)
        const diff = (trail.difficulty || '').toLowerCase();
        const color = diff.includes('facile') || diff.includes('easy') ? '#2e7d32' : (diff.includes('hard') || diff.includes('difficile') ? '#b71c1c' : '#388e3c');

        const poly = L.polyline(latlngs, { color, weight: 4 })
          .bindPopup(`<b>${trail.name}</b><br>${trail.difficulty || ''}<br><button onclick="viewTrailDetail('${trail._id}')">Vedi dettaglio</button>`);

        poly.addTo(this.trailsLayer);
        bounds.extend(latlngs);
      });

      if (bounds.isValid()) {
        this.map.fitBounds(bounds.pad(0.1));
      }
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}
</style>
