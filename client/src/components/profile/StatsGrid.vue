<template>
  <section class="card stats-card">
    <h2 class="card-title">Statistiche</h2>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">{{ totalKm }}</div>
        <div class="stat-label">Km programmati</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ savedCount }}</div>
        <div class="stat-label">Percorsi salvati</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ plannedCount }}</div>
        <div class="stat-label">Escursioni pianificate</div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'StatsGrid',
  props: {
    totalKm: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    plannedCount: { type: Number, default: 0 }
  }
}
</script>