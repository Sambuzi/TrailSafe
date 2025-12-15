<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'MapView',

  async mounted() {
    const map = L.map('map').setView([43.97, 12.70], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 🔹 Fetch percorsi dal backend
    const res = await fetch('http://localhost:3000/api/trails');
    const trails = await res.json();

    trails.forEach(trail => {
      if (!trail.geometry) return;

      // GeoJSON → Leaflet ([lat, lng])
      const latlngs = trail.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      L.polyline(latlngs, {
        color: 'green',
        weight: 4
      })
        .bindPopup(`<b>${trail.name}</b><br>${trail.difficulty}`)
        .addTo(map);
    });
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
