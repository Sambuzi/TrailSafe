<template>
  <div style="font-family: system-ui, Arial, sans-serif; padding: 1rem">
    <h1>TrailSafe — Demo</h1>
    <p><strong>Status:</strong> {{ status?.status || '...' }}</p>

    <h2>Percorsi</h2>
    <ul>
      <li v-for="t in trails" :key="t.id">{{ t.name }} — {{ t.difficulty }} — {{ t.status }}</li>
    </ul>

    <h3>Invia segnalazione (esempio)</h3>
    <form @submit.prevent="sendReport">
      <input v-model="report.text" placeholder="Descrivi il problema" />
      <button>Invia</button>
    </form>
    <p v-if="reportResponse">Risposta: {{ reportResponse.message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      status: null,
      trails: [],
      report: { text: '' },
      reportResponse: null
    }
  },
  async created() {
    try {
      const s = await fetch('/api/status');
      this.status = await s.json();
    } catch (e) {
      console.warn('API status fetch failed', e);
    }

    try {
      const r = await fetch('/api/trails');
      this.trails = await r.json();
    } catch (e) {
      console.warn('Trails fetch failed', e);
    }
  },
  methods: {
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
