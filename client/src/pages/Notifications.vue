<template>
  <div class="notifications-page">
    <header class="notifications-header">
      <div class="header-left">
        <h1>Notifiche</h1>
        <div class="header-sub">Qui trovi gli avvisi e le segnalazioni recenti</div>
      </div>
      <div class="header-actions">
        <span class="unread-count" v-if="unreadCount">{{ unreadCount }} non lette</span>
        <button v-if="unreadCount" class="flat action" @click="markAllRead">Segna tutte come lette</button>
      </div>
    </header>

    <div v-if="loading" class="center">Caricamento...</div>
    <div v-else-if="error" class="error center">{{ error }}</div>

    <div v-else>
      <ul v-if="items.length" class="notice-list">
        <li v-for="it in items" :key="it._id" :class="['notice', { unread: !it.read }]">
          <div class="notice-left">
            <div class="avatar">{{ initials(it.title) }}</div>
          </div>

          <div class="notice-main" role="button" tabindex="0" @click="showNotice(it)">
            <div class="title-row">
              <div class="title-block">
                <strong class="title">{{ it.title }}</strong>
                <span class="badge" v-if="!it.read">Nuova</span>
              </div>
              <small class="muted time">{{ formatRelative(it.createdAt) }}</small>
            </div>
            <div class="notice-body">{{ it.message || it.text || '—' }}</div>
          </div>

          <div class="notice-actions">
            <button class="action-btn" @click="toggleRead(it)">{{ it.read ? 'Segna non letta' : 'Segna letta' }}</button>
            <button class="action-btn danger" @click="remove(it)">Elimina</button>
          </div>
        </li>
      </ul>
      <div v-else class="muted">Nessuna notifica</div>

      <!-- Modal for full notice -->
      <div v-if="showNoticeModal" class="modal-overlay" @click="closeNoticeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeNoticeModal">&times;</button>
          <h2>{{ selectedNotice ? selectedNotice.title : '' }}</h2>
          <small class="muted">{{ selectedNotice ? formatRelative(selectedNotice.createdAt) : '' }}</small>
          <div class="modal-body" style="margin-top:12px;">{{ selectedNotice ? (selectedNotice.message || selectedNotice.text || '—') : '' }}</div>
          <div v-if="selectedNotice && selectedNotice.imageUrl" style="margin-top:12px;"><img :src="selectedNotice.imageUrl" style="max-width:100%; border-radius:8px;" /></div>
          <div class="form-actions" style="margin-top:16px; justify-content:flex-end;">
            <button v-if="selectedNotice && selectedNotice.type === 'note'" class="action-btn" @click="toggleRead(selectedNotice)">{{ selectedNotice && selectedNotice.read ? 'Segna non letta' : 'Segna letta' }}</button>
            <button v-if="selectedNotice && selectedNotice.type === 'note'" class="action-btn danger" @click="remove(selectedNotice)">Elimina</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import '../css/Notifications.css';

export default {
  name: 'Notifications',
  data() { return { items: [], loading: false, error: null, showNoticeModal: false, selectedNotice: null } },
  computed: {
    unreadCount() { return this.items.filter(i => !i.read).length }
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const [notesRes, reportsRes] = await Promise.all([
          fetch('/api/notifications', { headers: this.getAuthHeader() }),
          fetch('/api/reports/approved')
        ]);
        const notes = notesRes && notesRes.ok ? await notesRes.json() : [];
        const reports = reportsRes && reportsRes.ok ? await reportsRes.json() : [];

        // normalize items: notifications first
        const normNotes = notes.map(n => ({ _id: n._id, type: 'note', title: n.title || (n.trail ? n.trail.name : 'Avviso'), message: n.message, createdAt: n.createdAt, read: !!n.read }));
        const normReports = reports.map(r => ({ _id: r._id, type: 'report', title: r.title || (r.trail ? r.trail.name : 'Segnalazione'), text: r.text, imageUrl: r.imageUrl, createdAt: r.createdAt, read: true }));
        this.items = [...normNotes, ...normReports];
      } catch (e) {
        this.error = 'Server non raggiungibile';
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.token) return {};
        return { Authorization: `Bearer ${parsed.token}` };
      } catch (e) { return {} }
    },

    initials(text) {
      if (!text) return '•';
      return text.split(' ').slice(0,1).map(s => s[0]).join('').toUpperCase();
    },

    formatRelative(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const diff = Date.now() - d.getTime();
      const sec = Math.floor(diff/1000);
      if (sec < 60) return `${sec}s fa`;
      const min = Math.floor(sec/60);
      if (min < 60) return `${min}m fa`;
      const hrs = Math.floor(min/60);
      if (hrs < 24) return `${hrs}h fa`;
      const days = Math.floor(hrs/24);
      return `${days}d fa`;
    },

    async toggleRead(item) {
      const orig = item.read;
      item.read = !orig; // optimistic
      try {
        await fetch(`/api/notifications/${item._id}/mark-read`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }, body: JSON.stringify({ read: item.read }) });
      } catch (e) {
        item.read = orig; // rollback
        console.warn('mark-read failed', e);
      }
    },

    async remove(item) {
      if (!confirm('Eliminare questa notifica?')) return;
      const idx = this.items.findIndex(i => i._id === item._id);
      if (idx === -1) return;
      const removed = this.items.splice(idx,1)[0];
      try {
        // only notifications (type 'note') have delete endpoint
        if (item.type === 'note') {
          await fetch(`/api/notifications/${item._id}`, { method: 'DELETE', headers: this.getAuthHeader() });
        } else {
          // if it's a report, just remove locally (cannot delete public reports from client)
          // noop server-side
        }
        // if modal was open on this item, close it
        if (this.selectedNotice && this.selectedNotice._id === item._id) {
          this.closeNoticeModal();
        }
      } catch (e) {
        // rollback
        this.items.splice(idx,0,removed);
        console.warn('delete failed', e);
      }
    },

    async markAllRead() {
      const orig = this.items.map(i => ({ id: i._id, read: i.read }));
      this.items.forEach(i => i.read = true);
      try {
        await fetch('/api/notifications/mark-all-read', { method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() }, body: JSON.stringify({}) });
      } catch (e) {
        // rollback
        orig.forEach(o => {
          const it = this.items.find(x => x._id === o.id);
          if (it) it.read = o.read;
        });
        console.warn('mark-all-read failed', e);
      }
    },

    showNotice(item) {
      // open modal and mark as read if it's a notification
      this.selectedNotice = item;
      this.showNoticeModal = true;
      if (item.type === 'note' && !item.read) {
        this.toggleRead(item);
      }
    },

    closeNoticeModal() {
      this.selectedNotice = null;
      this.showNoticeModal = false;
    }
  }
}
</script>

