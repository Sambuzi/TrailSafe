<template>
  <div class="profile-root">
    <div v-if="!user" class="empty">
      <p>Non sei autenticato. Effettua il login per vedere il profilo.</p>
      <router-link to="/login" class="btn">Vai al login</router-link>
    </div>

    <div class="profile-container">
      <header class="profile-header">
        <div class="avatar" :aria-label="userName">{{ initials }}</div>

        <div class="user-info">
          <h1 class="user-name">{{ user?.user?.name || '—' }}</h1>
          <p class="user-email">{{ user?.user?.email || '—' }}</p>
          <p class="user-role">{{ user?.user?.role || 'user' }}</p>
        </div>

        <div class="header-actions">
          <button class="btn tonal" @click="toggleEdit">{{ editing ? 'Annulla' : 'Modifica' }}</button>
          <button class="btn filled" @click="logout">Logout</button>
        </div>
      </header>

      <main class="profile-body">
        <section class="card info-card">
          <h2 class="card-title">Informazioni</h2>

          <form v-if="editing && user" @submit.prevent="saveProfile" class="form-grid">
            <label>
              <span>Nome</span>
              <input v-model="form.name" type="text" />
            </label>

            <label>
              <span>Email</span>
              <input v-model="form.email" type="email" />
            </label>

            <div class="form-actions">
              <button class="btn filled" type="submit">Salva</button>
              <button class="btn" type="button" @click="cancelEdit">Annulla</button>
            </div>
          </form>

          <div v-else class="info-grid">
            <div class="row"><span class="label">Nome</span><span class="value">{{ user?.user?.name || '—' }}</span></div>
            <div class="row"><span class="label">Email</span><span class="value">{{ user?.user?.email || '—' }}</span></div>
            <div class="row"><span class="label">Ruolo</span><span class="value">{{ user?.user?.role || 'user' }}</span></div>
          </div>
        </section>

        <section class="card stats-card">
          <h2 class="card-title">Statistiche</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">12</div>
              <div class="stat-label">Report inviati</div>
            </div>
            <div class="stat">
              <div class="stat-value">3</div>
              <div class="stat-label">Trail creati</div>
            </div>
            <div class="stat">
              <div class="stat-value">—</div>
              <div class="stat-label">Ultimo accesso</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import '../css/profilo.css'

export default {
  name: 'Profile',

  data() {
    return {
      user: null,
      editing: false,
      form: { name: '', email: '' }
    };
  },

  computed: {
    userName() {
      return this.user?.user?.name || '';
    },
    initials() {
      const n = this.userName.trim();
      if (!n) return 'TS';
      return n.split(' ').map(s => s[0].toUpperCase()).slice(0,2).join('');
    }
  },

  created() {
    try { this.user = JSON.parse(localStorage.getItem('ts_user')) || null; } catch (e) { this.user = null; }
    if (this.user) this.resetForm();
  },

  methods: {
    logout() {
      try { localStorage.removeItem('ts_user'); } catch (e) {}
      this.user = null;
      this.$router.push('/login');
    },
    toggleEdit() {
      if (!this.user) return; // disable edit for unauthenticated
      this.editing = !this.editing;
      if (this.editing) this.resetForm();
    },
    resetForm() {
      this.form.name = this.user?.user?.name || '';
      this.form.email = this.user?.user?.email || '';
    },
    cancelEdit() {
      this.editing = false; this.resetForm();
    },
    saveProfile() {
      if (!this.user) return;
      // Nota: questo è solo update lato client/localStorage per demo.
      const stored = this.user || { user: {} };
      stored.user.name = this.form.name;
      stored.user.email = this.form.email;
      try { localStorage.setItem('ts_user', JSON.stringify(stored)); } catch (e) {}
      this.user = stored;
      this.editing = false;
    }
  }
}
</script>
