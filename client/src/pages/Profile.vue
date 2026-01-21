<!-- Pagina Profilo: mostra intestazione, informazioni utente, statistiche, escursioni salvate e pianificate; gestisce pianificazione ed eliminazione account. -->
<template>
  <div class="profile-root">
    <div v-if="!user" class="empty">
      <p>Non sei autenticato. Effettua il login per vedere il profilo.</p>
      <router-link to="/login" class="btn">Vai al login</router-link>
    </div>

    <div class="profile-container">
      <ProfileHeader :user="user?.user">
        <template #actions>
          <button class="btn btn-danger" @click="confirmDeleteAccount">Elimina account</button>
        </template>
      </ProfileHeader>

      <main class="profile-body">
        <InfoCard :profile="user?.user" />

        <!-- Child components fetch their own data and emit stats events -->

        <StatsGrid :totalKm="totalKm" :savedCount="savedCount" :plannedCount="plannedCount" />

        <SavedTrails @saved-count="onSavedCount" @planned="onPlannedUpdate" />

        <PlannedExcursions ref="plannedComp" @stats="onPlannedStats" />
      </main>
    </div>
  </div>
</template>

<script>
import '../css/profilo.css'
import SavedTrails from '../components/profile/SavedTrails.vue'
import PlannedExcursions from '../components/profile/PlannedExcursions.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import InfoCard from '../components/profile/InfoCard.vue'
import StatsGrid from '../components/profile/StatsGrid.vue'

export default {
  name: 'Profile',
  components: { SavedTrails, PlannedExcursions, ProfileHeader, InfoCard, StatsGrid },

  data() {
    return {
      user: null,
      savedCount: 0,
      plannedCount: 0,
      totalKm: 0
    };
  },

  computed: {
    // kept for compatibility (if used elsewhere), otherwise refer directly to data
    statsTotalKm() { return this.totalKm },
    statsSavedCount() { return this.savedCount },
    statsPlannedCount() { return this.plannedCount }
  },

  created() {
    try { this.user = JSON.parse(localStorage.getItem('ts_user')) || null; } catch (e) { this.user = null; }
    if (this.user) {
      // keep profile basic info load here; detailed lists are fetched inside child components
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
          // basic profile loaded; children will fetch saved/planned lists and emit counts
          // store only user info here
          // nothing else to do
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    },
    isToday(d) {
      try {
        const dt = new Date(d);
        const today = new Date();
        dt.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        return dt.getTime() === today.getTime();
      } catch (e) { return false }
    },

    /* Handlers for child component events */
    onSavedCount(count) { this.savedCount = count },
    onPlannedStats(payload) { this.totalKm = payload.totalKm || 0; this.plannedCount = payload.count || 0 },
    onPlannedUpdate() { if (this.$refs.plannedComp && typeof this.$refs.plannedComp.loadPlans === 'function') this.$refs.plannedComp.loadPlans() },


    confirmDeleteAccount() {
      if (!confirm('Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile.')) return;
      this.deleteAccount();
    },

    async deleteAccount() {
      try {
        if (!this.user || !this.user.token) return alert('Utente non autenticato');
        const res = await fetch('/api/auth/me', { method: 'DELETE', headers: { 'Authorization': `Bearer ${this.user.token}` } });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          alert((body && (body.error || body.message)) || 'Eliminazione account fallita');
          return;
        }
        try { localStorage.removeItem('ts_user'); } catch (e) {}
        alert('Account eliminato');
        this.$router && this.$router.push('/login');
      } catch (e) {
        console.error('deleteAccount error', e);
        alert('Impossibile contattare il server');
      }
    }
  }
}
</script>


