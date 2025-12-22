<template>
  <div class="toast-wrapper" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" class="toast-card">
        <div class="toast-body">
          <div class="toast-title">{{ t.title }}</div>
          <div class="toast-message">{{ t.message }}</div>
        </div>
        <button class="toast-close" @click="remove(t.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
let nextId = 1;
export default {
  name: 'NotificationToast',
  data() {
    return { toasts: [] };
  },
  methods: {
    show({ title, message, duration = 6000 }) {
      const id = nextId++;
      this.toasts.push({ id, title, message });
      setTimeout(() => this.remove(id), duration);
    },
    remove(id) {
      const i = this.toasts.findIndex(t => t.id === id);
      if (i !== -1) this.toasts.splice(i, 1);
    },
    onShowEvent(e) {
      const d = e.detail || {};
      this.show(d);
    }
  },
  mounted() {
    window.addEventListener('app:show-toast', this.onShowEvent);
  },
  unmounted() {
    window.removeEventListener('app:show-toast', this.onShowEvent);
  }
}
</script>

<style scoped>
.toast-wrapper { position: fixed; right: 16px; bottom: 16px; z-index: 2000; display:flex; flex-direction:column; gap:10px; }
.toast-card { width: 320px; background: var(--md-surface,#fff); color: var(--md-on-surface,#111); border-radius:12px; box-shadow: 0 10px 30px rgba(16,24,40,0.18); padding:12px; display:flex; align-items:flex-start; gap:8px; }
.toast-body { flex:1 }
.toast-title { font-weight:600; margin-bottom:4px }
.toast-message { font-size:0.95rem; color: #334155 }
.toast-close { background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:14px }
.toast-enter-active, .toast-leave-active { transition: all 240ms ease; }
.toast-enter-from { transform: translateY(8px); opacity: 0 }
.toast-enter-to { transform: translateY(0); opacity: 1 }
.toast-leave-from { transform: translateY(0); opacity: 1 }
.toast-leave-to { transform: translateY(8px); opacity: 0 }
</style>
