<template>
  <div class="admin-profile-page">
    <div class="admin-grid">
      <div class="left-column">
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

        <div class="info-row">
          <div class="m3-card admin-info-card">
            <h3>Informazioni Admin</h3>
            <div class="admin-info-grid">
              <div><strong>Nome</strong></div><div>{{ profile.name || '—' }}</div>
              <div><strong>Email</strong></div><div>{{ profile.email || '—' }}</div>
              <div><strong>Ruolo</strong></div><div>{{ profile.role || '—' }}</div>
              <div><strong>Ultimo aggiornamento</strong></div><div>{{ lastUpdated || '—' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-column">
        <div class="m3-card users-card">
          <h3>Gestione Utenti</h3>
          <div class="users-top">
            <input v-model="q" placeholder="Cerca nome o email" @input="loadUsers" />
            <button class="btn" @click="loadUsers">Cerca</button>
          </div>

          <div v-if="loadingUsers" class="muted">Caricamento utenti...</div>
          <div v-else>
            <div class="table-wrap">
              <table class="admin-table users-table">
                <thead>
                  <tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Creato</th><th>Azioni</th></tr>
                </thead>
                <tbody>
                  <tr v-for="u in users" :key="u._id">
                    <td>{{ u.name || '—' }}</td>
                    <td>{{ u.email }}</td>
                    <td>{{ u.role }}</td>
                    <td>{{ formatDate(u.createdAt) }}</td>
                    <td class="actions-cell">
                      <button class="btn icon" title="Modifica" @click="startEdit(u)">Modifica</button>
                      <button class="btn icon danger" title="Elimina" @click="deleteUser(u)">Elimina</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="messages-row">
              <div v-if="users.length === 0 && !usersError" class="muted">Nessun utente trovato.</div>
              <div v-if="usersError" class="error">{{ usersError }}</div>
            </div>

            <div v-if="editingUser" class="edit-user-panel">
              <h3>Modifica Utente</h3>
              <label>Nome <input v-model="editingUser.name" /></label>
              <label>Email <input v-model="editingUser.email" /></label>
              <label>Ruolo
                <select v-model="editingUser.role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label>Password (lascia vuoto per non cambiare) <input v-model="editingPassword" type="password"/></label>
              <div class="edit-actions">
                <button class="btn" @click="cancelEdit">Annulla</button>
                <button class="btn primary" @click="saveUser">Salva</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../css/AdminProfile.css'

export default {
  name: 'AdminProfile',
  data() {
    return {
      editMode: false,
      profile: { id: null, name: 'Amministratore', email: 'admin@example.com', role: 'admin', avatar: '' },
      defaultAvatar: '/src/assets/default-avatar.png',
      password: '',
      activeTab: 'profile',

      // users management state
      q: '',
      users: [],
      loadingUsers: false,
      usersError: null,
      editingUser: null,
      editingPassword: '',

      // stats
      trailsCount: null,
      reportsCount: null,
      usersCount: null,
      lastUpdated: ''
    }
  },
  mounted() {
    this.loadProfile()
    this.loadCounts()
    // load users immediately so admin sees the list on page open
    this.loadUsers()
  },
  methods: {
    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.token) return {};
        return { Authorization: `Bearer ${parsed.token}` };
      } catch (e) {
        return {};
      }
    },
    async loadProfile() {
      try {
        const res = await fetch('/api/auth/profile', { headers: this.getAuthHeader() })
        if (res.ok) {
          const json = await res.json()
          const u = json.user || json
          this.profile.id = u.id || u._id
          this.profile.name = u.name || this.profile.name
          this.profile.email = u.email || this.profile.email
          this.profile.role = u.role || this.profile.role
          this.profile.avatar = u.avatar || this.profile.avatar
        }
      } catch (e) {
        console.warn('Unable to load profile', e)
      }
    },
    async loadCounts() {
      try {
        const headers = this.getAuthHeader();
        const t = await fetch('/api/trails/count', { headers });
        if (t.ok) {
          const j = await t.json();
          this.trailsCount = typeof j.count === 'number' ? j.count : 0;
        } else { this.trailsCount = 0 }
      } catch (e) { this.trailsCount = 0 }

      try {
        const headers = this.getAuthHeader();
        const r = await fetch('/api/reports/count', { headers });
        if (r.ok) {
          const j = await r.json();
          this.reportsCount = typeof j.count === 'number' ? j.count : 0;
        } else { this.reportsCount = 0 }
      } catch (e) { this.reportsCount = 0 }

      // load users count (requires admin token)
      try {
        const headers = this.getAuthHeader();
        const ures = await fetch('/api/users', { headers });
        if (ures.ok) {
          const users = await ures.json();
          if (Array.isArray(users)) this.usersCount = users.length;
          else this.usersCount = 0;
        } else {
          this.usersCount = 0;
        }
      } catch (e) { this.usersCount = 0 }

      this.lastUpdated = new Date().toLocaleString();
    },
    async saveProfile() {
      try {
        if (!this.profile.id) return alert('Profilo non disponibile')
        const payload = { name: this.profile.name, email: this.profile.email }
        if (this.password) payload.password = this.password

        const res = await fetch(`/api/users/${this.profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
          body: JSON.stringify(payload)
        })

        if (res.ok) {
          alert('Profilo aggiornato')
          this.editMode = false
          this.password = ''
          this.loadProfile()
        } else {
          const body = await res.json().catch(() => null)
          alert((body && (body.error || body.message)) || 'Errore durante il salvataggio')
        }
      } catch (e) {
        console.error(e)
        alert('Errore durante il salvataggio')
      }
    },

    // Users management
    formatDate(d) { if (!d) return ''; return new Date(d).toLocaleString() },
    async loadUsers() {
      this.loadingUsers = true
      this.usersError = null
      this.users = []
      try {
        const url = '/api/users' + (this.q ? '?q=' + encodeURIComponent(this.q) : '')
        const res = await fetch(url, { headers: this.getAuthHeader() })
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          this.usersError = (body && (body.error || body.message)) || `Errore caricamento utenti (${res.status})`
          return
        }
        this.users = await res.json()
      } catch (e) {
        console.error('loadUsers exception', e)
        this.usersError = 'Server non raggiungibile'
      } finally { this.loadingUsers = false }
    },
    startEdit(u) { this.editingUser = { ...u }; this.editingPassword = '' },
    cancelEdit() { this.editingUser = null; this.editingPassword = '' },
    async saveUser() {
      if (!this.editingUser) return
      try {
        const payload = { name: this.editingUser.name, email: this.editingUser.email, role: this.editingUser.role }
        if (this.editingPassword) payload.password = this.editingPassword
        const res = await fetch(`/api/users/${this.editingUser._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }, body: JSON.stringify(payload)
        })
        if (!res.ok) { const body = await res.json().catch(() => null); alert(body && body.error ? body.error : 'Aggiornamento fallito'); return }
        const updated = await res.json()
        const i = this.users.findIndex(x => x._id === updated._id)
        if (i !== -1) this.users.splice(i, 1, updated)
        this.editingUser = null; this.editingPassword = ''
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
  },
  watch: {
    activeTab(newVal) { if (newVal === 'users') this.loadUsers() }
  }
}
</script>
