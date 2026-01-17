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
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reports" :key="r._id">
              <td>{{ r.trail ? r.trail.name : '—' }}</td>
              <td>{{ r.user ? (r.user.name || r.user.email) : '—' }}</td>
              <td class="report-text">
                <button class="report-preview" @click="showReport(r)" aria-label="Visualizza testo segnalazione">{{ r.text }}</button>
              </td>
              <td>{{ formatSeverity(r.severity) }}</td>
              <td>{{ formatDate(r.createdAt) }}</td>
              <td>
                <div v-if="r.imageUrl">
                  <img :src="r.imageUrl" alt="foto" class="report-thumb" />
                </div>
              </td>
              <td>
                <span :class="['status-badge', r.status]">{{ r.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal per testo segnalazione -->
      <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
        <div class="modal-content" @click.stop>
          <h2>Segnalazione</h2>
          <p class="report-full-text">{{ selectedReport ? selectedReport.text : '' }}</p>
          <div v-if="selectedReport && selectedReport.imageUrl" class="report-full-image">
            <img :src="selectedReport.imageUrl" alt="Immagine segnalazione" />
          </div>
          <button class="modal-close" @click="closeReportModal" aria-label="Chiudi">&times;</button>
          <div class="form-actions modal-actions">
            <button v-if="selectedReport && selectedReport.status !== 'rejected'" class="btn-danger" @click="updateStatus(selectedReport, 'rejected')">Rifiuta</button>
            <button v-if="selectedReport && selectedReport.status !== 'approved'" class="btn-primary" @click="updateStatus(selectedReport, 'approved')">Approva</button>
            <button class="btn-delete" @click="deleteReport(selectedReport)">Elimina</button>
          </div>
        </div>
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
      error: null,
      showReportModal: false,
      selectedReport: null
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
          // if unauthorized, clear saved credentials and redirect to login
          if (res.status === 401) {
            try { localStorage.removeItem('ts_user'); } catch (e) {}
            this.error = 'Sessione scaduta o non autorizzata. Effettua il login.';
            setTimeout(() => { this.$router && this.$router.push('/login'); }, 800);
            return;
          }
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

    formatSeverity(s) {
      return {
        low: 'Bassa',
        medium: 'Media',
        high: 'Alta'
      }[s] || (s || '—');
    },


    showReport(report) {
      this.selectedReport = report;
      this.showReportModal = true;
    },

    closeReportModal() {
      this.selectedReport = null;
      this.showReportModal = false;
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
          if (res.status === 401) {
            try { localStorage.removeItem('ts_user'); } catch (e) {}
            alert('Sessione scaduta. Verrai reindirizzato al login.');
            this.$router && this.$router.push('/login');
            return;
          }
          alert(body.error || 'Operazione fallita');
          return;
        }
        const updated = await res.json();
        const i = this.reports.findIndex(r => r._id === updated._id);
        if (i !== -1) this.reports.splice(i, 1, updated);
        // If the modal is showing the same report, update it and close the modal to reflect the change
        if (this.selectedReport && this.selectedReport._id === updated._id) {
          this.selectedReport = updated;
          this.showReportModal = false;
        }
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
          if (res.status === 401) {
            try { localStorage.removeItem('ts_user'); } catch (e) {}
            alert('Sessione scaduta. Verrai reindirizzato al login.');
            this.$router && this.$router.push('/login');
            return;
          }
          alert(body.error || 'Eliminazione fallita');
          return;
        }
        this.reports = this.reports.filter(r => r._id !== report._id);
        // if modal was open for this report, close it
        if (this.selectedReport && this.selectedReport._id === report._id) {
          this.selectedReport = null;
          this.showReportModal = false;
        }
      } catch (e) {
        alert('Server non raggiungibile');
      }
    }
  }
}
</script>
