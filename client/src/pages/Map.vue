<template>
  <div class="map-page">
    <!-- AREA MAPPA -->
    <section class="map-container">
      <div class="map-placeholder">
        <!-- Qui in futuro andrai a montare la mappa (Leaflet, Mapbox, ecc.) -->
        <MapView :trails="trails" />
      </div>

      <!-- Lista card dei percorsi sincronizzati col DB -->
      <div class="trail-list">
        <div v-if="trails.length === 0" class="no-trails">Nessun percorso trovato</div>
        <div v-for="trail in trails" :key="trail._id || trail.id" class="trail-card">
          <h4 class="trail-name">{{ trail.name }}</h4>
          <div class="trail-meta">
            <span>Difficoltà: {{ trail.difficulty || 'N/A' }}</span>
            <span> • </span>
            <span>{{ trail.length_km ? trail.length_km + ' km' : '—' }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- AREA FILTRI -->
    <section class="filters-container">
      <!-- Ricerca -->
      <div class="filter-card">
        <h3>Cerca</h3>
        <input
          v-model="filters.name"
          @input="onFiltersChange"
          type="text"
          class="search-input"
          placeholder="Cerca percorsi o luoghi..."
        />
      </div>

      <!-- Bottoni categorie (difficoltà recuperate dal DB) -->
      <div class="filter-card">
        <h3>Difficoltà</h3>
        <div class="category-buttons">
          <button
            v-for="d in difficulties"
            :key="d"
            :class="['category-btn', { active: filters.difficulty === d }]"
            @click="selectDifficulty(d)"
          >
            {{ d }}
          </button>
          <button class="category-btn" :class="{ active: filters.difficulty === '' }" @click="selectDifficulty('')">Tutte</button>
        </div>
      </div>

      <!-- Slider KM -->
      <div class="filter-card">
        <h3>Distanza (km)</h3>
        <div class="km-select-wrap">
          <select v-model.number="filters.min_km" @change="onFiltersChange" class="km-select">
            <option :value="0">Qualsiasi distanza</option>
            <option :value="1">Almeno 1 km</option>
            <option :value="5">Almeno 5 km</option>
            <option :value="10">Almeno 10 km</option>
            <option :value="20">Almeno 20 km</option>
            <option :value="50">Almeno 50 km</option>
          </select>
          <div class="km-value">Selezionato: {{ filters.min_km }} km</div>
        </div>
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
  },
  data() {
    return {
      trails: [],
      difficulties: [],
      filters: {
        name: '',
        difficulty: '',
        min_km: 0
      }
    }
  },
  mounted() {
    this.fetchDifficulties();
    this.fetchTrails();
  },
  methods: {
    // debounce timer id
    debounceId: null,
    debounceDelay: 300,
    async fetchDifficulties() {
      try {
        const res = await fetch('http://localhost:3000/api/trails/difficulties');
        this.difficulties = await res.json();
      } catch (err) {
        console.error('Failed to load difficulties', err);
      }
    },
    async fetchTrails() {
      try {
        const params = new URLSearchParams();
        if (this.filters.difficulty) params.append('difficulty', this.filters.difficulty);
        if (this.filters.name) params.append('name', this.filters.name);
        if (this.filters.min_km) params.append('min_km', this.filters.min_km);

        const url = 'http://localhost:3000/api/trails/search' + (params.toString() ? ('?' + params.toString()) : '');
        const res = await fetch(url);
        this.trails = await res.json();
      } catch (err) {
        console.error('Failed to fetch trails', err);
      }
    },
    selectDifficulty(d) {
      this.filters.difficulty = d;
      this.debouncedFetch();
    },
    onFiltersChange() {
      // debounced to reduce requests while typing/moving UI
      this.debouncedFetch();
    }
    ,
    debouncedFetch() {
      if (this.debounceId) clearTimeout(this.debounceId);
      this.debounceId = setTimeout(() => {
        this.fetchTrails();
        this.debounceId = null;
      }, this.debounceDelay);
    }
  }
}


</script>

<style src="../css/Map.css" scoped></style>

