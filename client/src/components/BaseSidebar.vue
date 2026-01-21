<template>
  <aside class="sidebar" role="navigation" aria-label="Main navigation">
    <div class="logo">
      <img v-if="logoSrc" :src="logoSrc" alt="TrailSafe logo" />
      <div v-else class="logo-text">{{ logoText }}</div>
    </div>

    <nav>
      <router-link
        v-for="(item, idx) in items"
        :key="idx"
        :to="item.to"
        :title="item.title"
        :aria-label="item.label"
        :class="['item', { 'my-active': isActive(item) }]"
      >
        <span class="material-symbols-rounded">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
import '../css/BaseSidebar.css';

export default {
  name: 'BaseSidebar',
  props: {
    items: { type: Array, required: true },
    logoSrc: { type: String, default: '' },
    logoText: { type: String, default: '' }
  },
  methods: {
    isActive(item) {
      const route = this.$route || {}
      if (typeof item.to === 'string') {
        return route.path === item.to
      }
      const to = item.to || {}
      const toPath = to.path || ''
      const toQuery = to.query || {}
      // compare path
      if (route.path !== toPath) return false
      // compare query keys/values (simple deep equal)
      const rQuery = route.query || {}
      const toKeys = Object.keys(toQuery).sort()
      const rKeys = Object.keys(rQuery).sort()
      if (toKeys.length !== rKeys.length) return false
      for (let i = 0; i < toKeys.length; i++) {
        const k = toKeys[i]
        if (rQuery[k] !== String(toQuery[k])) return false
      }
      return true
    }
  }
}
</script>


