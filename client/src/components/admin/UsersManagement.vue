<template>
  <div class="m3-card users-card">
    <h3>Gestione Utenti</h3>
    <div class="users-top">
      <input v-model="q" placeholder="Cerca nome o email" @input="loadUsers" />
      <button class="btn" @click="loadUsers">Cerca</button>
    </div>

    <div v-if="loadingUsers" class="muted">Caricamento utenti...</div>
    <div v-else>
      <UsersTable :users="users" @edit="startEdit" @delete="deleteUser" />

      <div class="messages-row">
        <div v-if="users.length === 0 && !usersError" class="muted">Nessun utente trovato.</div>
        <div v-if="usersError" class="error">{{ usersError }}</div>
      </div>

      <EditUserPanel v-if="editingUser" :user="editingUser" @cancel="cancelEdit" @save="saveUser" />
    </div>
  </div>
</template>

<script>
import UsersTable from './UsersTable.vue'
import EditUserPanel from './EditUserPanel.vue'

export default {
  name: 'UsersManagement',
  components: { UsersTable, EditUserPanel },
  data() {
    return {
      q: '',
      users: [],
      loadingUsers: false,
      usersError: null,
      editingUser: null
    }
  },
  mounted() { this.loadUsers() },
  methods: {
    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.token) return {};
        return { Authorization: `Bearer ${parsed.token}` };
      } catch (e) { return {} }
    },
    async loadUsers() {
      this.loadingUsers = true; this.usersError = null; this.users = []
      try {
        const url = '/api/users' + (this.q ? '?q=' + encodeURIComponent(this.q) : '')
        const res = await fetch(url, { headers: this.getAuthHeader() })
        if (!res.ok) { const body = await res.json().catch(() => null); this.usersError = (body && (body.error || body.message)) || `Errore caricamento utenti (${res.status})`; return }
        this.users = await res.json()
      } catch (e) { console.error('loadUsers exception', e); this.usersError = 'Server non raggiungibile' }
      finally { this.loadingUsers = false }
    },
    startEdit(u) { this.editingUser = { ...u } },
    cancelEdit() { this.editingUser = null },
    async saveUser(payload) {
      if (!this.editingUser) return
      try {
        const res = await fetch(`/api/users/${this.editingUser._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }, body: JSON.stringify(payload) })
        if (!res.ok) { const body = await res.json().catch(() => null); alert(body && body.error ? body.error : 'Aggiornamento fallito'); return }
        const updated = await res.json(); const i = this.users.findIndex(x => x._id === updated._id); if (i !== -1) this.users.splice(i, 1, updated)
        this.editingUser = null
      } catch (e) { alert('Server non raggiungibile') }
    },
    async deleteUser(u) {
      if (!confirm(`Eliminare l'utente ${u.email}?`)) return
      try {
        const res = await fetch(`/api/users/${u._id}`, { method: 'DELETE', headers: this.getAuthHeader() })
        if (!res.ok) { const body = await res.json().catch(() => null); alert(body && body.error ? body.error : 'Eliminazione fallita'); return }
        this.users = this.users.filter(x => x._id !== u._id)
      } catch (e) { alert('Server non raggiungibile') }
    }
  }
}
</script>
