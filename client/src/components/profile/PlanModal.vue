<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal card">
      <header class="modal-header">
        <h3>Programma Escursione</h3>
        <button class="btn ghost small" @click="$emit('close')">Chiudi</button>
      </header>

      <form @submit.prevent="submitPlan">
        <label>
          Titolo
          <input v-model="title" required />
        </label>

        <label>
          Data e ora
          <input type="datetime-local" v-model="date" required />
        </label>

        <label>
          Note
          <textarea v-model="notes"></textarea>
        </label>

        <div class="modal-actions">
          <button class="btn tonal" type="submit">Salva Piano</button>
          <button class="btn ghost" type="button" @click="$emit('close')">Annulla</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanModal',
  props: {
    visible: { type: Boolean, default: false },
    initial: { type: Object, default: null }
  },
  data () {
    return {
      title: this.initial?.title || '',
      date: this.initial?.date || '',
      notes: this.initial?.notes || ''
    }
  },
  watch: {
    initial (val) {
      this.title = val?.title || ''
      this.date = val?.date || ''
      this.notes = val?.notes || ''
    }
  },
  methods: {
    submitPlan () {
      const plan = { title: this.title, date: this.date, notes: this.notes }
      this.$emit('save', plan)
      this.$emit('close')
    }
  }
}
</script>