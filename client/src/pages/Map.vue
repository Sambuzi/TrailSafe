<template>
  <div class="map-page">
    <!-- AREA MAPPA -->
    <section class="map-container">
      <div class="map-placeholder">
        <!-- Qui in futuro andrai a montare la mappa (Leaflet, Mapbox, ecc.) -->
        <MapView />
      </div>
    </section>

    <!-- AREA FILTRI -->
    <section class="filters-container">
      <!-- Ricerca -->
      <div class="filter-card">
        <h3>Cerca</h3>
        <input
          type="text"
          class="search-input"
          placeholder="Cerca percorsi o luoghi..."
        />
      </div>

      <!-- Bottoni categorie -->
      <div class="filter-card">
        <h3>Categorie</h3>
        <div class="category-buttons">
          <button class="category-btn">Trekking</button>
          <button class="category-btn">Stay</button>
          <button class="category-btn">Food</button>
        </div>
      </div>

      <!-- Slider KM -->
      <div class="filter-card">
        <h3>Distanza (km)</h3>
        <input
          type="range"
          min="1"
          max="50"
          value="10"
          class="km-slider"
        />
        <div class="km-value">Fino a 10 km</div>
      </div>
    </section>
  </div>
</template>

<script>

import MapView from '../components/MapView.vue'

export default {
 name: 'Map',
  components: {
    MapView
  }
}


</script>

<style src="../css/Map.css" scoped></style>

