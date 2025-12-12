<template>
  <div style="font-family: system-ui, Arial, sans-serif; padding: 1rem">
    <Login v-if="!user" @login-success="onLoginSuccess" />

    <div v-else>
      <div style="display:flex; justify-content:space-between; align-items:center">
        <h1>TrailSafe — Demo</h1>
        <div>
          <span>{{ user.user?.email }}</span>
          <button @click="logout" style="margin-left:8px">Logout</button>
        </div>
      </div>

      <p><strong>Status:</strong> {{ status?.status || '...' }}</p>

      <h2>Percorsi</h2>
      <ul>
        <li v-for="t in trails" :key="t._id || t.id">{{ t.name }} — {{ t.difficulty }} — {{ t.status }}</li>
      </ul>

      <h3>Invia segnalazione (esempio)</h3>
      <form @submit.prevent="sendReport">
        <input v-model="report.text" placeholder="Descrivi il problema" />
        <button>Invia</button>
      </form>
      <p v-if="reportResponse">Risposta: {{ reportResponse.message || reportResponse }}</p>
    </div>
  </div>
</template>

<script>
import Login from './components/Login.vue'

export default {
  components: { Login },
  data() {
    return {
      status: null,
      trails: [],
      report: { text: '' },
      reportResponse: null,
      user: null
    }
  },
  created() {
    const saved = localStorage.getItem('ts_user');
    if (saved) this.user = JSON.parse(saved);
    this.fetchStatus();
    this.fetchTrails();
  },
  methods: {
    async fetchStatus() {
      try {
        const s = await fetch('/api/status');
        this.status = await s.json();
      } catch (e) {
        console.warn('API status fetch failed', e);
      }
    },
    async fetchTrails() {
      try {
        const r = await fetch('/api/trails');
        this.trails = await r.json();
      } catch (e) {
        console.warn('Trails fetch failed', e);
      }
    },
    onLoginSuccess(payload) {
      // payload contains { token, user }
      this.user = payload;
      localStorage.setItem('ts_user', JSON.stringify(payload));
      // optionally re-fetch protected data
      this.fetchTrails();
    },
    logout() {
      this.user = null;
      localStorage.removeItem('ts_user');
    },
    async sendReport() {
      try {
        const res = await fetch('/api/trails/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: this.report.text, date: new Date() })
        });
        this.reportResponse = await res.json();
        this.report.text = '';
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>
