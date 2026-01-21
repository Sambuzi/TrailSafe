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


