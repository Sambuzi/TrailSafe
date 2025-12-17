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
          <p class="user-level">Livello: {{ user?.user?.level || 'principiante' }}</p>
          <p class="user-email">{{ user?.user?.email || '—' }}</p>
          <p class="user-role">{{ user?.user?.role || 'user' }}</p>
        </div>

  
      </header>

      <main class="profile-body">
        <section class="card info-card">
          <h2 class="card-title">Informazioni</h2>

          <div class="info-grid">
            <div class="row"><span class="label">Nome</span><span class="value">{{ user?.user?.name || '—' }}</span></div>
            <div class="row"><span class="label">Email</span><span class="value">{{ user?.user?.email || '—' }}</span></div>
            <div class="row"><span class="label">Ruolo</span><span class="value">{{ user?.user?.role || 'user' }}</span></div>
          </div>
        </section>

        <section class="card stats-card">
          <h2 class="card-title">Statistiche</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">{{ totalKm }}</div>
              <div class="stat-label">Km programmati</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ savedTrails.length }}</div>
              <div class="stat-label">Percorsi salvati</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ plannedExcursions.length }}</div>
              <div class="stat-label">Escursioni pianificate</div>
            </div>
          </div>
        </section>

        <section class="card saved-trails-card">
          <h2 class="card-title">Percorsi Salvati</h2>
          <div v-if="savedTrails.length === 0" class="no-trails">
            Nessun percorso salvato.
          </div>
          <div v-else class="trails-list">
            <div v-for="trail in savedTrails" :key="trail._id" class="trail-item">
              <h3>{{ trail.name }}</h3>
              <p>Difficoltà: {{ trail.difficulty }} | Lunghezza: {{ trail.length_km }} km</p>
              <div class="trail-actions">
                <router-link :to="`/trail/${trail._id}`" class="btn small tonal">Vedi dettaglio</router-link>
                <button class="btn small tonal" @click="planExcursion(trail._id)">Programma escursione</button>
              </div>
            </div>
          </div>
        </section>

        <section class="card planned-excursions-card">
          <h2 class="card-title">Escursioni Programmati</h2>
          <div v-if="plannedExcursions.length === 0" class="no-trails">
            Nessuna escursione programmata.
          </div>
          <div v-else class="trails-list">
            <div v-for="plan in plannedExcursions" :key="plan._id" class="trail-item">
              <h3>{{ plan.trail.name }}</h3>
              <p>Data: {{ new Date(plan.date).toLocaleDateString() }}</p>
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
      savedTrails: [],
      plannedExcursions: []
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
    },
    totalKm() {
      return this.plannedExcursions.reduce((sum, plan) => sum + (plan.trail.length_km || 0), 0);
    }
  },

  created() {
    try { this.user = JSON.parse(localStorage.getItem('ts_user')) || null; } catch (e) { this.user = null; }
    if (this.user) {
      this.fetchProfile();
    }
  },

  methods: {
    async fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${this.user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          this.savedTrails = data.user.savedTrails || [];
        }
        // Fetch planned excursions
        const res2 = await fetch('/api/auth/planned-excursions', {
          headers: { 'Authorization': `Bearer ${this.user.token}` }
        });
        const data2 = await res2.json();
        if (res2.ok) {
          this.plannedExcursions = data2.plannedExcursions || [];
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    }
  }
}
</script>
