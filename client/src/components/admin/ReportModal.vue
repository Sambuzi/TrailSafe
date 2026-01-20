<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Segnalazione</h2>
      <p class="report-full-text">{{ report ? report.text : '' }}</p>
      <div v-if="report && report.imageUrl" class="report-full-image">
        <img :src="report.imageUrl" alt="Immagine segnalazione" />
      </div>
      <button class="modal-close" @click="$emit('close')" aria-label="Chiudi">&times;</button>
      <div class="form-actions modal-actions">
        <button v-if="report && report.status !== 'rejected'" class="btn-danger" @click="$emit('update-status', 'rejected')">Rifiuta</button>
        <button v-if="report && report.status !== 'approved'" class="btn-primary" @click="$emit('update-status', 'approved')">Approva</button>
        <button class="btn-delete" @click="$emit('delete-report')">Elimina</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportModal',
  props: { report: { type: Object, default: null } }
}
</script>
