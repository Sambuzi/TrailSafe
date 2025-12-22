<template>
  <div class="admin-reports-page">
    <div class="header">
      <h1>Segnalazioni Utenti</h1>
      <p class="muted">Gestisci le segnalazioni inviate dagli utenti. Approva per pubblicare, rifiuta per scartare.</p>
    </div>

    <div v-if="loading" class="loading">Caricamento segnalazioni...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="reports-list">
      <table class="reports-table">
        <thead>
          <tr>
            <th>Trail</th>
            <th>Utente</th>
            <th>Testo</th>
            <th>Gravità</th>
            <th>Data</th>
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
                <img :src="r.imageUrl" alt="foto" style="max-width:120px; max-height:80px; object-fit:cover;" />
              </div>
            </td>
            <td>
              <span :class="['status', r.status]">{{ r.status }}</span>
            </td>
            <td class="actions">
              <button v-if="r.status !== 'approved'" class="btn-approve" @click="updateStatus(r, 'approved')">Approva</button>
              <button v-if="r.status !== 'rejected'" class="btn-reject" @click="updateStatus(r, 'rejected')">Rifiuta</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminReports'
  ,
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

<style scoped>
.admin-reports-page { padding: 24px; max-width: 1200px; margin: 0 auto; }

.header { margin-bottom: 16px; }
.muted { color: #6b7280; }
.reports-table { width: 100%; border-collapse: collapse; }
.reports-table th, .reports-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: middle; }
.report-text { max-width: 480px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status.pending { color: #f59e0b; }
.status.approved { color: #10b981; }
.status.rejected { color: #ef4444; }
.actions button { margin-right: 6px; }
.btn-approve { background: #10b981; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn-reject { background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn-delete { background: transparent; color: #374151; border: 1px solid #e5e7eb; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
</style>
