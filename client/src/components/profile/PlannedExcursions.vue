<template>
  <section class="card planned-excursions-card">
    <h2 class="card-title">Escursioni Programmate</h2>

    <div v-if="!plans || plans.length === 0" class="no-plans">Nessuna escursione programmata.</div>
    <div v-else class="trails-list plans-list">
      <div v-for="plan in plans" :key="plan._id" class="plan-item trail-item">
        <h3>{{ plan.title || plan.trail?.name || 'Escursione' }}</h3>
        <p>{{ formatDate(plan.date) }} — {{ plan.locationName || (plan.trail?.name || 'Luogo non specificato') }}</p>

        <div v-if="plan.forecast" class="plan-forecast">
          <img :src="plan.forecast.icon" alt="meteo" class="forecast-icon" />
          <span class="forecast-temp">{{ Math.round(plan.forecast.temp) }}°C</span>
          <span class="forecast-desc">{{ plan.forecast.description }}</span>
        </div>

        <div class="plan-actions">
          <button class="btn small tonal" @click="$emit('open-plan', plan._id)">Dettagli</button>
          <button class="btn small tonal" @click="$emit('cancel-plan', plan._id)">Annulla</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PlannedExcursions',
  props: {
    plans: { type: Array, default: () => [] }
  },
  methods: {
    formatDate (iso) {
      try { return new Date(iso).toLocaleString() } catch (e) { return iso }
    }
  }
}
</script>