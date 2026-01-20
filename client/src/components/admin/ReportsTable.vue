<template>
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
            <button class="report-preview" @click="$emit('show', r)" aria-label="Visualizza testo segnalazione">{{ r.text }}</button>
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
</template>

<script>
export default {
  name: 'ReportsTable',
  props: {
    reports: { type: Array, default: () => [] }
  },
  methods: {
    formatDate(d) { if (!d) return ''; return new Date(d).toLocaleString() },
    formatSeverity(s) {
      return {
        low: 'Bassa',
        medium: 'Media',
        high: 'Alta'
      }[s] || (s || '—')
    }
  }
}
</script>
