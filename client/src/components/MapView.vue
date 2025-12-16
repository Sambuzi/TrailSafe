<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'MapView',

  async mounted() {
    // Default view centered on Trentino-Alto Adige
    const map = L.map('map').setView([46.35, 11.20], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 🔹 Fetch percorsi dal backend
    const res = await fetch('http://localhost:3000/api/trails');
    const trails = await res.json();

    // Bounding box per Trentino-Alto Adige
    const minLat = 45.5, maxLat = 47.2, minLng = 10.0, maxLng = 13.0;

    // Filtra i percorsi presenti nella regione (se presenti)
    const regionTrails = trails.filter(trail => {
      if (!trail.geometry || !trail.geometry.coordinates) return false;
      return trail.geometry.coordinates.some(([lng, lat]) => (
        lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
      ));
    });

    const toDraw = regionTrails.length ? regionTrails : trails;

    // raccogli bounds per adattare la vista
    const bounds = L.latLngBounds([]);

    toDraw.forEach(trail => {
      if (!trail.geometry) return;

      const latlngs = trail.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      L.polyline(latlngs, {
        color: 'green',
        weight: 4
      })
        .bindPopup(`<b>${trail.name}</b><br>${trail.difficulty}`)
        .addTo(map);

      bounds.extend(latlngs);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1));
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
