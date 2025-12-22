<template>
  <div class="report-map-picker">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import L from 'leaflet'

export default {
  name: 'ReportMapPicker',
  props: {
    trail: { type: Object, default: null },
    initialLocation: { type: Object, default: null }
  },
  emits: ['location-selected'],
  data() {
    return {
      map: null,
      marker: null,
      trailLayer: null
    }
  },
  mounted() {
    this.initMap()
  },
  watch: {
    trail: {
      handler() {
        this.drawTrail()
      },
      deep: true
    }
  },
  methods: {
    initMap() {
      this.map = L.map(this.$refs.mapContainer, { zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map)

      this.map.on('click', (e) => {
        this.handleMapClick(e.latlng)
      })

      // draw if initial trail already present
      this.drawTrail()

      // if there's an initial location, place marker
      if (this.initialLocation && this.initialLocation.lat != null && this.initialLocation.lng != null) {
        this.placeMarker(this.initialLocation)
      }

      // ensure proper sizing when shown inside modal
      nextTick(() => { setTimeout(() => { this.map.invalidateSize(); }, 200) })
    },

    drawTrail() {
      if (!this.map) return

      // remove existing
      if (this.trailLayer) {
        this.map.removeLayer(this.trailLayer)
        this.trailLayer = null
      }

      if (!this.trail || !this.trail.geometry || !Array.isArray(this.trail.geometry.coordinates)) {
        // center on world default
        if (!this.marker) this.map.setView([46.0, 11.0], 6)
        return
      }

      // convert [lon,lat] to [lat,lon]
      const latlngs = this.trail.geometry.coordinates.map(c => [c[1], c[0]])
      this.trailLayer = L.polyline(latlngs, { color: '#f59e0b', weight: 5 }).addTo(this.map)
      this.map.fitBounds(this.trailLayer.getBounds(), { padding: [20,20] })
    },

    handleMapClick(latlng) {
      // if trail present, snap to closest point on polyline
      if (this.trail && this.trail.geometry && Array.isArray(this.trail.geometry.coordinates) && this.trail.geometry.coordinates.length) {
        const poly = this.trail.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }))
        const snapped = this.closestPointOnLine(poly, { lat: latlng.lat, lng: latlng.lng })
        this.placeMarker({ lat: snapped.lat, lng: snapped.lng })
        this.$emit('location-selected', { lat: snapped.lat, lng: snapped.lng })
      } else {
        this.placeMarker({ lat: latlng.lat, lng: latlng.lng })
        this.$emit('location-selected', { lat: latlng.lat, lng: latlng.lng })
      }
    },

    placeMarker(loc) {
      if (!this.map) return
      if (this.marker) this.map.removeLayer(this.marker)
      this.marker = L.marker([loc.lat, loc.lng], { draggable: false }).addTo(this.map)
      this.map.panTo([loc.lat, loc.lng])
    },

    // returns nearest point {lat,lng} on polyline defined by array of {lat,lng}
    closestPointOnLine(points, p) {
      let minDist = Infinity
      let closest = points[0]

      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i]
        const b = points[i+1]
        const proj = this.projectPointOnSegment(a, b, p)
        const d = this.sqDist(proj, p)
        if (d < minDist) { minDist = d; closest = proj }
      }
      return closest
    },

    projectPointOnSegment(a, b, p) {
      const ax = a.lat, ay = a.lng
      const bx = b.lat, by = b.lng
      const px = p.lat, py = p.lng
      const vx = bx - ax, vy = by - ay
      const wx = px - ax, wy = py - ay
      const vlen2 = vx*vx + vy*vy
      if (vlen2 === 0) return { lat: ax, lng: ay }
      let t = (vx*wx + vy*wy) / vlen2
      t = Math.max(0, Math.min(1, t))
      return { lat: ax + vx * t, lng: ay + vy * t }
    },

    sqDist(a, b) { const dx = a.lat - b.lat; const dy = a.lng - b.lng; return dx*dx + dy*dy }
  }
}
</script>

<style scoped>
.map-container { width: 100%; height: 360px; border-radius: 12px; overflow: hidden; }
</style>
