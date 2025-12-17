<template>
  <div class="settings-page">
    <div class="settings-card">
      <button class="back-btn" @click="$router.back()"></button>
      <h2>Impostazioni</h2>

      <section class="setting-section">
        <h3>Account</h3>
        <form @submit.prevent="saveSettings" class="settings-form">
          <label>
            <span>Nome</span>
            <input v-model="form.name" type="text" required />
          </label>
          <label>
            <span>Livello</span>
            <select v-model="form.level">
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzato">Avanzato</option>
            </select>
          </label>
          <label class="switch-label">
            <span>Notifiche</span>
            <input v-model="form.notificationsEnabled" type="checkbox" class="switch" />
          </label>
         <div class="form-actions">
            <button type="button" class="logout-btn" @click="logout">Logout</button>
            <button class="btn-primary" type="submit">Salva</button>
          </div>

        </form>
      </section>
    </div>
  </div>
</template>

<script>
import '../css/Settings.css';
export default {
  name: 'Settings',
  data() {
    return {
      user: null,
      form: { name: '', level: 'principiante', notificationsEnabled: true }
    };
  },
  created() {
    try { this.user = JSON.parse(localStorage.getItem('ts_user')) || null; } catch (e) { this.user = null; }
    if (this.user) {
      this.resetForm();
    }
  },
  methods: {
    resetForm() {
      this.form.name = this.user?.user?.name || '';
      this.form.level = this.user?.user?.level || 'principiante';
      this.form.notificationsEnabled = this.user?.user?.notificationsEnabled ?? true;
    },
    async saveSettings() {
      try {
        const res = await fetch('/api/auth/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Impostazioni salvate!');
          this.user.user = { ...this.user.user, ...data.user };
          localStorage.setItem('ts_user', JSON.stringify(this.user));
          this.$router.back();
        } else {
          alert('Errore: ' + (data.error || 'Sconosciuto'));
        }
      } catch (err) {
        console.error(err);
        alert('Errore nel salvataggio');
      }
    },
    logout() {
      try { localStorage.removeItem('ts_user'); } catch (e) {}
      this.$router.push('/login');
    }
  }
}
</script>

