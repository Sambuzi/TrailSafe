<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/Map.css';

export default {
  name: 'MapView',
  props: {
    trails: {
      type: Array,
      default: () => []
    },
    reports: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      map: null,
      trailsLayer: null,
      reportsLayer: null
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
    this.reportsLayer = L.layerGroup().addTo(this.map);

    // Define global function for popup button
    window.viewTrailDetail = (id) => {
      this.$router.push('/trail/' + id);
    };

    // if parent passed trails already, draw them; otherwise fetch all
    if (this.trails && this.trails.length) {
      this.drawTrails(this.trails);
    } else {
      try {
        const res = await fetch('/api/trails');
        const trails = await res.json();
        this.drawTrails(trails);
      } catch (err) {
        console.error('Failed to load trails in MapView', err);
      }
    }

    // draw reports if provided
    if (this.reports && this.reports.length) {
      this.drawReports(this.reports);
    }
  },
  watch: {
    trails(newVal) {
      this.drawTrails(newVal || []);
    },
    reports(newVal) {
      this.drawReports(newVal || []);
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
        const color = diff.includes('facile') || diff.includes('easy') ? '#2e7d32' : (diff.includes('hard') || diff.includes('difficile') ? '#b71c1c' : (diff.includes('medium') || diff.includes('intermedio') ? '#f59e0b' : '#388e3c'));

        const poly = L.polyline(latlngs, { color, weight: 4 })
          .bindPopup(`<b>${this.escapeHtml(trail.name)}</b><br>${this.escapeHtml(trail.difficulty || '')}<br><button onclick="viewTrailDetail('${trail._id}')">Vedi dettaglio</button>`);

        poly.addTo(this.trailsLayer);
        bounds.extend(latlngs);
      });

      if (bounds.isValid()) {
        this.map.fitBounds(bounds.pad(0.1));
      }

      // if reports were provided, draw them
      if (this.reports && this.reports.length) this.drawReports(this.reports);
    },

    drawReports(reports) {
      if (!this.map || !this.reportsLayer) return;
      this.reportsLayer.clearLayers();

      reports.forEach(r => {
        if (!r.location || r.location.lat == null || r.location.lng == null) return;
        if (r.status && r.status !== 'approved') return; // show only approved

        const latlng = [r.location.lat, r.location.lng];
        const parts = [];
        parts.push(`<strong>${this.escapeHtml(r.trail && r.trail.name ? r.trail.name : 'Segnalazione')}</strong>`);
        if (r.text) parts.push(`<div style="margin-top:6px;white-space:pre-wrap">${this.escapeHtml(r.text)}</div>`);
        if (r.imageUrl) parts.push(`<img src="${r.imageUrl}" style="max-width:220px;max-height:160px;border-radius:8px;margin-top:8px;display:block" />`);

        const marker = L.circleMarker(latlng, { radius: 7, color: '#b71c1c', fillColor: '#f44336', fillOpacity: 1 });
        marker.bindPopup(`<div style="max-width:260px">${parts.join('')}</div>`);
        marker.addTo(this.reportsLayer);
      });
    },

    escapeHtml(s) {
      if (!s) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }
};
</script>
