<template>
  <div v-if="visible" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>{{ initial && initial._id ? 'Modifica Percorso' : 'Aggiungi Nuovo Percorso' }}</h2>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Nome:</label>
          <input v-model="local.name" type="text" required />
        </div>
        <div class="form-group">
          <label>Difficoltà:</label>
          <select v-model="local.difficulty" required>
            <option value="Facile">Facile</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Difficile">Difficile</option>
          </select>
        </div>
        <div class="form-group">
          <label>Lunghezza (km):</label>
          <input v-model.number="local.length_km" type="number" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Stato:</label>
          <select v-model="local.status" required>
            <option value="Aperto">Aperto</option>
            <option value="Chiuso">Chiuso</option>
            <option value="Parzialmente chiuso">Parzialmente chiuso</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary trail-cancel-btn" @click="$emit('close')">Annulla</button>
          <button type="submit" class="btn-primary">Salva</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrailForm',
  props: {
    visible: { type: Boolean, default: false },
    initial: { type: Object, default: null }
  },
  data() {
    return {
      local: {
        name: '',
        difficulty: 'Facile',
        length_km: 0,
        status: 'Aperto'
      }
    }
  },
  watch: {
    initial: {
      handler (v) {
        this.local = v ? { ...v } : { name: '', difficulty: 'Facile', length_km: 0, status: 'Aperto' }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    submit () {
      this.$emit('save', { ...this.local })
    }
  }
}
</script>
