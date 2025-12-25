<template>
  <div class="admin-profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <img :src="profile.avatar || defaultAvatar" alt="Avatar" class="avatar" />
        <div class="profile-info">
          <h1>{{ profile.name }}</h1>
          <p class="muted">{{ profile.email }}</p>
          <p class="role">Ruolo: <strong>{{ profile.role }}</strong></p>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn" @click="editMode = !editMode">{{ editMode ? 'Annulla' : 'Modifica profilo' }}</button>
        <button class="btn primary" v-if="editMode" @click="saveProfile">Salva</button>
      </div>

      <form v-if="editMode" class="profile-form" @submit.prevent="saveProfile">
        <label>Nome
          <input v-model="profile.name" type="text" />
        </label>
        <label>Email
          <input v-model="profile.email" type="email" />
        </label>
        <label>Password
          <input v-model="password" type="password" placeholder="Lascia vuoto per non cambiare" />
        </label>
      </form>

      <div v-else class="profile-details">
        <h2>Impostazioni</h2>
        <p><strong>Nome:</strong> {{ profile.name }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
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
      profile: {
        name: 'Amministratore',
        email: 'admin@example.com',
        role: 'Amministratore',
        avatar: ''
      },
      defaultAvatar: '/src/assets/default-avatar.png',
      password: ''
    }
  },
  mounted() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const json = await res.json()
          this.profile.name = json.name || json.username || this.profile.name
          this.profile.email = json.email || this.profile.email
          this.profile.role = json.role || this.profile.role
          this.profile.avatar = json.avatar || this.profile.avatar
        }
      } catch (e) {
        console.warn('Unable to load profile', e)
      }
    },
    async saveProfile() {
      try {
        const payload = { name: this.profile.name, email: this.profile.email }
        if (this.password) payload.password = this.password

        const res = await fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (res.ok) {
          alert('Profilo aggiornato')
          this.editMode = false
          this.password = ''
          this.loadProfile()
        } else {
          const txt = await res.text()
          alert('Errore: ' + txt)
        }
      } catch (e) {
        console.error(e)
        alert('Errore durante il salvataggio')
      }
    }
  }
}
</script>
