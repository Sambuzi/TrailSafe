<!-- Pagina AdminTrails: gestione dei percorsi con funzionalità di visualizzazione, filtro, aggiunta, modifica ed eliminazione. -->
<template>
  <div class="admin-page">
    <div class="md-topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <h1>Pannello Amministrazione</h1>
          <p class="subtitle">Gestione percorsi — analisi e modifiche rapide</p>
        </div>

        <div class="topbar-right">
          <div class="search-input">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20l-5.99-6zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
            <input v-model="filters.q" placeholder="Cerca per nome o attributi" />
          </div>

          <button class="btn-secondary icon" @click="showFilterModal = true" title="Filtri">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm6 6h6v-2H9v2z"/></svg>
          </button>

          <button class="btn-primary add-trail-btn" @click="showAddForm = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M13 11h8v2h-8v8h-2v-8H3v-2h8V3h2v8z"/></svg>
            Aggiungi
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Caricamento percorsi...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="admin-content">
      <div class="stats-cards">
        <div class="stat-card elevated">
          <div class="stat-icon">📍</div>
          <div class="stat-body">
            <h3>{{ trails.length }}</h3>
            <p>Percorsi Totali</p>
          </div>
        </div>
        <div class="stat-card elevated">
          <div class="stat-icon">🟢</div>
          <div class="stat-body">
            <h3>{{ trails.filter(t => t.status === 'Aperto').length }}</h3>
            <p>Percorsi Aperti</p>
          </div>
        </div>
        <div class="stat-card elevated">
          <div class="stat-icon">🔴</div>
          <div class="stat-body">
            <h3>{{ trails.filter(t => t.status === 'Chiuso').length }}</h3>
            <p>Percorsi Chiusi</p>
          </div>
        </div>
      </div>
  


      <TrailsList :trails="filteredTrails" :difficultyClass="getDifficultyClass" :statusClass="getStatusClass" @edit="editTrail" @delete="deleteTrail" />
    </div>

    <TrailForm :visible="showAddForm || Boolean(editingTrail)" :initial="editingTrail" @save="onFormSave" @close="closeModal" />
    <!-- MODAL FILTRI -->
<div v-if="showFilterModal" class="modal-overlay" @click="closeFilterModal">
  <div class="modal-content" @click.stop>
    <h2>Filtra Percorsi</h2>

    <div class="trail-form">
      <div class="form-group">
        <label>Difficoltà</label>
        <select v-model="filters.difficulty">
          <option value="">Tutte</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div class="form-group">
        <label>Stato</label>
        <select v-model="filters.status">
          <option value="">Tutti</option>
          <option value="Aperto">Aperto</option>
          <option value="Chiuso">Chiuso</option>
          <option value="Parzialmente chiuso">Parzialmente chiuso</option>
        </select>
      </div>

      <div class="form-group">
        <label>Lunghezza massima (km)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          v-model.number="filters.maxLength"
          placeholder="Es. 10"
        />
      </div>

      <div class="form-actions">
        <button class="btn-secondary reset-btn--danger" @click="resetFilters">
          Reset
        </button>
        <button class="btn-primary" @click="closeFilterModal">
          Applica
        </button>
      </div>
    </div>
  </div>
</div>

  </div>
</template>
<script>
import '../css/adminTrails.css'
import TrailsList from '../components/admin/TrailsList.vue'
import TrailForm from '../components/admin/TrailForm.vue'

export default {
  name: 'Admin',
  components: { TrailsList, TrailForm },

  data() {
    return {
      trails: [],
      loading: false,
      error: null,

      /* ===== FILTRI ===== */
      showFilterModal: false,
      filters: {
        q: '',
        difficulty: '',
        status: '',
        maxLength: null
      },

      /* ===== MODAL CRUD ===== */
      showAddForm: false,
      editingTrail: null,

      form: {
        name: '',
        difficulty: 'Easy',
        length_km: 0,
        status: 'Aperto'
      }
    };
  },

  created() {
    this.loadTrails();
  },

  computed: {
    filteredTrails() {
      const q = (this.filters.q || '').toLowerCase().trim();
      return this.trails.filter(trail => {
        const byDifficulty = !this.filters.difficulty || trail.difficulty === this.filters.difficulty;
        const byStatus = !this.filters.status || trail.status === this.filters.status;
        const byLength = !this.filters.maxLength || trail.length_km <= this.filters.maxLength;

        const combined = `${trail.name || ''} ${trail.difficulty || ''} ${trail.status || ''}`.toLowerCase();
        const byQuery = !q || combined.includes(q);

        return byDifficulty && byStatus && byLength && byQuery;
      });
    }
  },

  methods: {
    async loadTrails() {
      this.loading = true;
      try {
        const res = await fetch('http://localhost:3000/api/trails');
        this.trails = await res.json();
      } catch {
        this.error = 'Errore nel caricamento dei percorsi';
      } finally {
        this.loading = false;
      }
    },

    getDifficultyClass(difficulty) {
      if (!difficulty) return 'easy';
      const d = (difficulty || '').toString().toLowerCase();
      return {
        'facile': 'easy', 'easy': 'easy',
        'intermedio': 'medium', 'medium': 'medium',
        'difficile': 'hard', 'difficult': 'hard', 'hard': 'hard'
      }[d] || 'easy';
    },

    getStatusClass(status) {
      return {
        Aperto: 'open',
        Chiuso: 'closed',
        'Parzialmente chiuso': 'partial'
      }[status] || 'open';
    },

    editTrail(trail) {
      this.editingTrail = trail;
      this.form = { ...trail };
    },

    async deleteTrail(trail) {
      if (!confirm(`Eliminare "${trail.name}"?`)) return;
      await fetch(`http://localhost:3000/api/trails/${trail._id}`, {
        method: 'DELETE'
      });
      this.trails = this.trails.filter(t => t._id !== trail._id);
    },

    async onFormSave(formData) {
      const isEdit = Boolean(this.editingTrail);
      const url = isEdit ? `http://localhost:3000/api/trails/${this.editingTrail._id}` : 'http://localhost:3000/api/trails';

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const saved = await res.json();

      if (isEdit) {
        const i = this.trails.findIndex(t => t._id === saved._id);
        if (i !== -1) this.trails.splice(i, 1, saved);
      } else {
        this.trails.push(saved);
      }

      this.closeModal();
    },

    resetFilters() {
      this.filters = {
        q: '',
        difficulty: '',
        status: '',
        maxLength: null
      };
    },

    closeFilterModal() {
      this.showFilterModal = false;
    },

    closeModal() {
      this.showAddForm = false;
      this.editingTrail = null;
      this.form = {
        name: '',
        difficulty: 'Easy',
        length_km: 0,
        status: 'Aperto'
      };
    }
  }
};
</script>

