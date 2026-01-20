<!-- Pagina AdminProfile: mostra le statistiche amministrative, le informazioni del profilo e la gestione degli utenti. -->
<template>
  <div class="admin-profile-page">
    <div class="admin-grid">
      <div class="left-column">
        <AdminStats :trailsCount="trailsCount" :reportsCount="reportsCount" :usersCount="usersCount" :lastUpdated="lastUpdated" />
        <AdminInfoCard :profile="profile" :lastUpdated="lastUpdated" />
      </div>

      <div class="right-column">
        <UsersManagement />
      </div>
    </div>
  </div>
</template>

<script>
import '../css/AdminProfile.css'
import AdminStats from '../components/admin/AdminStats.vue'
import AdminInfoCard from '../components/admin/AdminInfoCard.vue'
import UsersManagement from '../components/admin/UsersManagement.vue'

export default {
  name: 'AdminProfile',
  components: { AdminStats, AdminInfoCard, UsersManagement },
  data() {
    return {
      editMode: false,
      profile: { id: null, name: 'Amministratore', email: 'admin@example.com', role: 'admin', avatar: '' },
      defaultAvatar: '/src/assets/default-avatar.png',
      password: '',
      activeTab: 'profile',

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
    }
  }
}
</script>
