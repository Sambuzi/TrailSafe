<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>Pannello Amministrazione - Gestione Percorsi</h1>
      <button class="btn-primary add-trail-btn" @click="showAddForm = true">Aggiungi Percorso</button>
    </div>

    <div v-if="loading" class="loading">Caricamento percorsi...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="admin-content">
      <div class="stats-cards">
        <div class="stat-card">
          <h3>{{ trails.length }}</h3>
          <p>Percorsi Totali</p>
        </div>
        <div class="stat-card">
          <h3>{{ trails.filter(t => t.status === 'Aperto').length }}</h3>
          <p>Percorsi Aperti</p>
        </div>
        <div class="stat-card">
          <h3>{{ trails.filter(t => t.status === 'Chiuso').length }}</h3>
          <p>Percorsi Chiusi</p>
        </div>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Difficoltà</th>
              <th>Lunghezza (km)</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trail in trails" :key="trail._id" :class="{ 'status-closed': trail.status === 'Chiuso' }">
              <td class="trail-name">{{ trail.name }}</td>
              <td>
                <span class="difficulty-badge" :class="getDifficultyClass(trail.difficulty)">
                  {{ trail.difficulty }}
                </span>
              </td>
              <td>{{ trail.length_km }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(trail.status)">
                  {{ trail.status }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-secondary edit-btn" @click="editTrail(trail)">Modifica</button>
                <button class="btn-danger delete-btn" @click="deleteTrail(trail)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal per aggiungere/modificare percorso -->
    <div v-if="showAddForm || editingTrail" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingTrail ? 'Modifica Percorso' : 'Aggiungi Nuovo Percorso' }}</h2>
        <form @submit.prevent="saveTrail" class="trail-form">
          <div class="form-group">
            <label>Nome:</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Difficoltà:</label>
            <select v-model="form.difficulty" required>
              <option value="Facile">Facile</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>
          <div class="form-group">
            <label>Lunghezza (km):</label>
            <input v-model.number="form.length_km" type="number" step="0.1" required />
          </div>
          <div class="form-group">
            <label>Stato:</label>
            <select v-model="form.status" required>
              <option value="Aperto">Aperto</option>
              <option value="Chiuso">Chiuso</option>
              <option value="Parzialmente chiuso">Parzialmente chiuso</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Annulla</button>
            <button type="submit" class="btn-primary">Salva</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Admin',
  data() {
    return {
      trails: [],
      loading: false,
      error: null,
      showAddForm: false,
      editingTrail: null,
      form: {
        name: '',
        difficulty: 'Facile',
        length_km: 0,
        status: 'Aperto'
      }
    };
  },
  created() {
    this.loadTrails();
  },
  methods: {
    async loadTrails() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch('http://localhost:3000/api/trails');
        if (!res.ok) throw new Error('Errore nel caricamento');
        const data = await res.json();
        this.trails = data;
      } catch (err) {
        console.error(err);
        this.error = 'Errore nel caricamento dei percorsi';
      } finally {
        this.loading = false;
      }
    },

    getDifficultyClass(difficulty) {
      const classes = {
        'Facile': 'easy',
        'Intermedio': 'medium',
        'Difficile': 'hard'
      };
      return classes[difficulty] || 'easy';
    },

    getStatusClass(status) {
      const classes = {
        'Aperto': 'open',
        'Chiuso': 'closed',
        'Parzialmente chiuso': 'partial'
      };
      return classes[status] || 'open';
    },

    editTrail(trail) {
      this.editingTrail = trail;
      this.form = { ...trail };
    },

    async deleteTrail(trail) {
      if (!confirm(`Sei sicuro di voler eliminare "${trail.name}"?`)) return;

      try {
        const res = await fetch(`http://localhost:3000/api/trails/${trail._id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Errore nell\'eliminazione');
        this.trails = this.trails.filter(t => t._id !== trail._id);
        alert('Percorso eliminato con successo');
      } catch (err) {
        console.error(err);
        alert('Errore nell\'eliminazione del percorso');
      }
    },

    async saveTrail() {
      try {
        const method = this.editingTrail ? 'PUT' : 'POST';
        const url = this.editingTrail
          ? `http://localhost:3000/api/trails/${this.editingTrail._id}`
          : 'http://localhost:3000/api/trails';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });

        if (!res.ok) throw new Error('Errore nel salvataggio');

        const savedTrail = await res.json();

        if (this.editingTrail) {
          const index = this.trails.findIndex(t => t._id === this.editingTrail._id);
          this.trails.splice(index, 1, savedTrail);
        } else {
          this.trails.push(savedTrail);
        }

        this.closeModal();
        alert('Percorso salvato con successo');
      } catch (err) {
        console.error(err);
        alert('Errore nel salvataggio del percorso');
      }
    },

    closeModal() {
      this.showAddForm = false;
      this.editingTrail = null;
      this.form = {
        name: '',
        difficulty: 'Facile',
        length_km: 0,
        status: 'Aperto'
      };
    }
  }
}
</script>
<style scoped>
/* =========================
   CUSTOM SCROLLBARS
   ========================= */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--md-surface-container);
  border-radius: var(--md-radius-sm);
}

::-webkit-scrollbar-thumb {
  background: var(--md-outline);
  border-radius: var(--md-radius-sm);
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--md-on-surface-variant);
}

::-webkit-scrollbar-corner {
  background: var(--md-surface-container);
}

/* =========================
   PAGE LAYOUT
   ========================= */
.admin-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  overflow-x: auto;
  overflow-y: auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--md-outline);
}

.admin-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--md-on-surface);
  margin: 0;
}

.add-trail-btn {
  background: var(--md-primary);
  color: var(--md-on-primary);
  padding: 12px 24px;
  border-radius: var(--md-radius-md);
  border: none;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--md-elevation-1);
  transition: box-shadow 0.2s ease;
}

.add-trail-btn:hover {
  box-shadow: var(--md-elevation-2);
}

/* =========================
   STATS CARDS
   ========================= */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--md-surface);
  padding: 20px;
  border-radius: var(--md-radius-lg);
  box-shadow: var(--md-elevation-1);
  text-align: center;
  border: 1px solid var(--md-outline);
}

.stat-card h3 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--md-primary);
  margin: 0 0 8px 0;
}

.stat-card p {
  font-size: 0.9rem;
  color: var(--md-on-surface-variant);
  margin: 0;
  font-weight: 500;
}

/* =========================
   TABLE
   ========================= */
.table-container {
  background: var(--md-surface);
  border-radius: var(--md-radius-lg);
  box-shadow: var(--md-elevation-2);
  overflow: auto;
  border: 1px solid var(--md-outline);
  max-height: 70vh;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 800px;
}

.admin-table thead {
  background: var(--md-surface-container);
}

.admin-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--md-on-surface);
  border-bottom: 1px solid var(--md-outline);
}

.admin-table td {
  padding: 12px;
  border-bottom: 1px solid var(--md-outline);
  color: var(--md-on-surface);
}

.admin-table tbody tr:hover {
  background: rgba(27,94,32,.04);
}

.admin-table tbody tr.status-closed {
  opacity: 0.7;
}

/* =========================
   BADGES
   ========================= */
.difficulty-badge, .status-badge {
  padding: 4px 12px;
  border-radius: var(--md-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.difficulty-badge.easy {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.difficulty-badge.medium {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.difficulty-badge.hard {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.status-badge.open {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-badge.closed {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.status-badge.partial {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

/* =========================
   ACTIONS
   ========================= */
.actions {
  display: flex;
  gap: 8px;
}

.btn-secondary, .btn-danger {
  padding: 6px 12px;
  border-radius: var(--md-radius-sm);
  border: none;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--md-surface-container);
  color: var(--md-on-surface);
  border: 1px solid var(--md-outline);
}

.btn-secondary:hover {
  background: var(--md-on-surface);
  color: var(--md-surface);
}

.btn-danger {
  background: rgba(211, 47, 47, 0.1);
  color: var(--md-error);
}

.btn-danger:hover {
  background: var(--md-error);
  color: var(--md-on-primary);
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  font-size: 0.75rem;
}

/* =========================
   MODAL
   ========================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--md-surface);
  padding: 24px;
  border-radius: var(--md-radius-lg);
  box-shadow: var(--md-elevation-3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  color: var(--md-on-surface);
}

/* =========================
   FORM
   ========================= */
.trail-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: var(--md-on-surface);
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid var(--md-outline);
  border-radius: var(--md-radius-sm);
  font-size: 1rem;
  background: var(--md-surface);
  color: var(--md-on-surface);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--md-primary);
  box-shadow: 0 0 0 2px rgba(27,94,32,.15);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* =========================
   STATES
   ========================= */
.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
}

.loading {
  color: var(--md-on-surface-variant);
}

.error {
  color: var(--md-error);
  font-weight: 500;
}

/* =========================
   RESPONSIVE
   ========================= */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .admin-header h1 {
    font-size: 1.5rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .table-container {
    max-height: 60vh;
  }

  .modal-content {
    width: 95%;
    padding: 16px;
    max-height: 80vh;
    overflow-y: auto;
  }
}

@media (max-width: 900px) {
  .admin-page {
    padding: 16px;
    overflow-x: auto;
    overflow-y: auto;
  }
}
</style>
