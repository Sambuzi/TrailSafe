<template>
  <div class="admin-page">
    <div class="md-topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <h1>Segnalazioni Utenti</h1>
          <p class="subtitle">Gestisci le segnalazioni inviate dagli utenti. Approva per pubblicare, rifiuta per scartare.</p>
        </div>
        <div class="topbar-right">
          <button class="btn-primary" @click="loadReports">Aggiorna</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Caricamento segnalazioni...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="admin-content">
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Trail</th>
              <th>Utente</th>
              <th>Testo</th>
              <th>Gravità</th>
              <th>Data</th>
              <th>Immagine</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reports" :key="r._id">
              <td>{{ r.trail ? r.trail.name : '—' }}</td>
              <td>{{ r.user ? (r.user.name || r.user.email) : '—' }}</td>
              <td class="report-text">{{ r.text }}</td>
              <td>{{ r.severity }}</td>
              <td>{{ formatDate(r.createdAt) }}</td>
              <td>
                <div v-if="r.imageUrl">
                  <img :src="r.imageUrl" alt="foto" class="report-thumb" />
                </div>
              </td>
              <td>
                <span :class="['status-badge', r.status]">{{ r.status }}</span>
              </td>
              <td class="actions">
                <button v-if="r.status !== 'approved'" class="btn-primary" @click="updateStatus(r, 'approved')">Approva</button>
                <button v-if="r.status !== 'rejected'" class="btn-danger" @click="updateStatus(r, 'rejected')">Rifiuta</button>
                <button class="btn-secondary" @click="deleteReport(r)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import '../css/adminTrails.css'
import '../css/adminReport.css'

export default {
  name: 'AdminReports',
  data() {
    return {
      reports: [],
      loading: false,
      error: null
    };
  },

  created() {
    this.loadReports();
  },

  methods: {
    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.token) return {};
        return { Authorization: `Bearer ${parsed.token}` };
      } catch (e) {
        return {};
      }
    },

    async loadReports() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch('/api/reports', { headers: this.getAuthHeader() });
        if (!res.ok) {
          const body = await res.json();
          this.error = body.error || 'Errore nel recupero delle segnalazioni';
          return;
        }
        this.reports = await res.json();
      } catch (e) {
        this.error = 'Server non raggiungibile';
      } finally {
        this.loading = false;
      }
    },

    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleString();
    },

    async updateStatus(report, status) {
      if (!confirm(`Impostare la segnalazione come "${status}"?`)) return;
      try {
        const res = await fetch(`/api/reports/${report._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
          body: JSON.stringify({ status })
        });
        if (!res.ok) {
          const body = await res.json();
          alert(body.error || 'Operazione fallita');
          return;
        }
        const updated = await res.json();
        const i = this.reports.findIndex(r => r._id === updated._id);
        if (i !== -1) this.reports.splice(i, 1, updated);
      } catch (e) {
        alert('Server non raggiungibile');
      }
    },

    async deleteReport(report) {
      if (!confirm('Eliminare definitivamente questa segnalazione?')) return;
      try {
        const res = await fetch(`/api/reports/${report._id}`, {
          method: 'DELETE',
          headers: this.getAuthHeader()
        });
        if (!res.ok) {
          const body = await res.json();
          alert(body.error || 'Eliminazione fallita');
          return;
        }
        this.reports = this.reports.filter(r => r._id !== report._id);
      } catch (e) {
        alert('Server non raggiungibile');
      }
    }
  }
}
</script>
