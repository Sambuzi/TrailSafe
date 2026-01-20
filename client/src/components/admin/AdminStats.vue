<template>
  <div class="cards-row">
    <div class="m3-card stats-aggregate">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Percorsi totali</div>
          <div class="stat-value">{{ trailsCount !== null ? trailsCount : '—' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Segnalazioni</div>
          <div class="stat-value">{{ reportsCount !== null ? reportsCount : '—' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Utenti totali</div>
          <div class="stat-value">{{ usersCount !== null ? usersCount : '—' }}</div>
        </div>
      </div>
      <div class="stats-footer muted">Aggiornato: {{ lastUpdated }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminStats',
  props: {
    trailsCount: { type: Number, default: null },
    reportsCount: { type: Number, default: null },
    usersCount: { type: Number, default: null },
    lastUpdated: { type: String, default: '' }
  }
}
</script>
