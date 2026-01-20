<template>
  <div class="edit-user-panel">
    <h3>Modifica Utente</h3>
    <label>Nome <input v-model="local.name" /></label>
    <label>Email <input v-model="local.email" /></label>
    <label>Ruolo
      <select v-model="local.role">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </label>
    <label>Password (lascia vuoto per non cambiare) <input v-model="password" type="password"/></label>
    <div class="edit-actions">
      <button class="btn" @click="$emit('cancel')">Annulla</button>
      <button class="btn primary" @click="save">Salva</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditUserPanel',
  props: { user: { type: Object, required: true } },
  data() { return { local: { ...this.user }, password: '' } },
  watch: {
    user(newV) { this.local = { ...newV }; this.password = '' }
  },
  methods: {
    save() {
      const payload = { name: this.local.name, email: this.local.email, role: this.local.role }
      if (this.password) payload.password = this.password
      this.$emit('save', payload)
    }
  }
}
</script>
