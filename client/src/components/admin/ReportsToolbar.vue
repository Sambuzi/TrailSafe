<template>
  <div class="md-topbar">
    <div class="topbar-inner">
      <div class="topbar-left">
        <h1>Segnalazioni Utenti</h1>
        <p class="subtitle">Gestisci le segnalazioni inviate dagli utenti. Approva per pubblicare, rifiuta per scartare.</p>
      </div>
      <div class="topbar-right">
        <button class="btn-primary" @click="$emit('refresh')">Aggiorna</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsToolbar'
}
</script>
