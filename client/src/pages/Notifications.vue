<template>
  <div class="notifications-page">
    <h1>Notifiche</h1>

    <div v-if="loading">Caricamento...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <ul v-if="items.length">
        <li v-for="it in items" :key="it._id" class="notice">
          <div class="notice-head">
            <strong>{{ it.trail ? it.trail.name : 'Aggiornamento' }}</strong>
            <small class="muted">{{ new Date(it.createdAt).toLocaleString() }}</small>
          </div>
          <div class="notice-body">{{ it.text }}</div>
          <div v-if="it.imageUrl" class="notice-image"><img :src="it.imageUrl" alt="img" /></div>
        </li>
      </ul>
      <div v-else class="muted">Nessuna notifica</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notifications',
  data() { return { items: [], loading: false, error: null } },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.error = null;
      try {
        const res = await fetch('/api/reports/approved');
        if (!res.ok) { this.error = 'Errore nel caricamento'; return }
        this.items = await res.json();
      } catch (e) { this.error = 'Server non raggiungibile' }
      finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.notifications-page { padding: 24px; max-width: 900px; margin: 0 auto }
.notice { padding: 12px; border-radius: 12px; background: var(--m3-surface, #fff); margin-bottom: 12px; box-shadow: 0 6px 18px rgba(16,24,40,0.06) }
.notice-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
.notice-body { color: #374151 }
.notice-image img { max-width:100%; border-radius:8px; margin-top:8px }
.muted { color: #6b7280 }
</style>
