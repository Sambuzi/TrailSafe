<template>
  <div class="notifications" title="Notifiche">
    <button class="bell" @click="goToNotifications" aria-label="Notifications">
      <!-- Material 3 'notifications' filled icon -->
      <svg class="m3-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S9.5 3.17 9.5 4v.68C6.63 5.36 5 7.92 5 11v5l-1.7 1.7c-.14.14-.3.3-.3.5h17c0-.2-.16-.36-.29-.5L18 16z"/>
      </svg>
      <span v-if="count > 0" class="badge">{{ count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'NotificationsButton',
  data() {
    return { count: 0 };
  },
  methods: {
    async goToNotifications() {
      // mark as read, then navigate and clear badge
      try {
        const auth = this.getAuthHeader();
        // mark both reports and notifications read where applicable
        await Promise.all([
          fetch('/api/reports/mark-read', { method: 'POST', headers: { ...auth } }),
          fetch('/api/notifications/mark-read', { method: 'POST', headers: { ...auth } })
        ]);
      } catch (e) {
        // ignore
      }
      this.count = 0;
      this.$router.push('/notifications');
    },

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

    async loadCount() {
      try {
        const auth = this.getAuthHeader();
        const [reportsRes, notesRes, profileRes] = await Promise.all([
          fetch('/api/reports/approved'),
          fetch('/api/notifications', { headers: { ...auth } }),
          fetch('/api/auth/profile', { headers: { ...auth } })
        ]);

        if (!reportsRes.ok) return;
        const reports = await reportsRes.json();
        const notes = notesRes && notesRes.ok ? await notesRes.json() : [];

        let lastSeen = 0;
        if (profileRes && profileRes.ok) {
          const body = await profileRes.json();
          lastSeen = body.user && body.user.lastSeenNotifications ? new Date(body.user.lastSeenNotifications).getTime() : 0;
        }

        const reportsCount = Array.isArray(reports) ? reports.filter(r => new Date(r.createdAt).getTime() > lastSeen).length : 0;
        const notesCount = Array.isArray(notes) ? notes.filter(n => !n.read).length : 0;

        this.count = reportsCount + notesCount;
      } catch (e) {
        // ignore
      }
    }
    ,
    async pollForNew() {
      try {
        const auth = this.getAuthHeader();
        const [reportsRes, notesRes, profileRes] = await Promise.all([
          fetch('/api/reports/approved'),
          fetch('/api/notifications', { headers: { ...auth } }),
          fetch('/api/auth/profile', { headers: { ...auth } })
        ]);
        if (!reportsRes.ok) return;
        const reports = await reportsRes.json();
        const notes = notesRes && notesRes.ok ? await notesRes.json() : [];

        let lastSeen = 0;
        if (profileRes && profileRes.ok) {
          const body = await profileRes.json();
          lastSeen = body.user && body.user.lastSeenNotifications ? new Date(body.user.lastSeenNotifications).getTime() : 0;
        }

        const newReports = Array.isArray(reports) ? reports.filter(r => new Date(r.createdAt).getTime() > lastSeen) : [];
        const unreadNotes = Array.isArray(notes) ? notes.filter(n => !n.read) : [];

        // show toasts for new personal notifications (if any)
        if (unreadNotes.length) {
          const newest = unreadNotes[0];
          const title = newest.trail ? (newest.trail.name || 'Avviso meteo') : 'Avviso meteo';
          const message = newest.message && newest.message.length > 140 ? newest.message.slice(0,137) + '...' : newest.message;
          window.dispatchEvent(new CustomEvent('app:show-toast', { detail: { title, message } }));
        } else if (newReports.length) {
          const newest = newReports[0];
          const title = newest.trail ? newest.trail.name : 'Nuova segnalazione';
          const message = newest.text.length > 140 ? newest.text.slice(0,137) + '...' : newest.text;
          window.dispatchEvent(new CustomEvent('app:show-toast', { detail: { title, message } }));
        }

        // update internal badge count
        const count = (Array.isArray(reports) ? reports.filter(r => new Date(r.createdAt).getTime() > lastSeen).length : 0) + (Array.isArray(notes) ? notes.filter(n => !n.read).length : 0);
        this.count = count;
      } catch (e) {
        // ignore polling errors
      }
    }
  },
  mounted() {
    this.loadCount();
    // start polling for new approved reports every 20s
    this._pollInterval = setInterval(this.pollForNew.bind(this), 20000);
  }
  ,
  unmounted() {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }
}
</script>

<style scoped>
.notifications { display: inline-block; margin-right: 8px }
.bell { background: var(--m3-surface, rgba(255,255,255,0.06)); border: none; color: var(--m3-on-surface, #fff); cursor: pointer; padding: 8px; border-radius: 12px; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; position: relative }
.bell:hover { background: rgba(255,255,255,0.12) }
.m3-icon { width: 20px; height: 20px; display: block }
.badge { position: absolute; top: 6px; right: 6px; background: #ff5252; color: white; font-size: 11px; padding: 2px 6px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.18) }
</style>
