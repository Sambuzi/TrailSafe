<template>
  <div class="admin-page admin-reports-page">
    <ReportsToolbar @refresh="loadReports" />

    <div v-if="loading" class="loading">Caricamento segnalazioni...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="admin-content">
      <ReportsTable :reports="reports" @show="showReport" />

      <ReportModal
        v-if="showReportModal"
        :report="selectedReport"
        @close="closeReportModal"
        @update-status="s => updateStatus(selectedReport, s)"
        @delete-report="() => deleteReport(selectedReport)"
      />
    </div>
  </div>
</template>

<script>
import '../css/adminTrails.css'
import '../css/adminReport.css'

import ReportsToolbar from '../components/admin/ReportsToolbar.vue'
import ReportsTable from '../components/admin/ReportsTable.vue'
import ReportModal from '../components/admin/ReportModal.vue'

export default {
  name: 'AdminReports',
  components: { ReportsToolbar, ReportsTable, ReportModal },
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
