<template>
  <aside class="sidebar">
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
        :class="['item', { 'my-active': isActive(item) }]"
      >
        <span class="material-symbols-rounded">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
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

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 88px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  box-sizing: border-box;
}

.logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-text {
  font-weight: 700;
  color: #0f4c3d;
  background: #e8f5e9;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1b5e20;
  text-decoration: none;
}

.item:hover,
.item.my-active {
  background: #e8f5e9;
}

/* override default router-link automatic class to avoid undesired highlighting */
.item.router-link-active { background: transparent; }

.label {
  display: none;
}

@media (min-width: 900px) {
  .sidebar {
    width: 260px;
    align-items: flex-start;
    padding: 24px;
  }

  .item {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .label {
    display: inline;
    font-size: 15px;
  }
}

.material-symbols-rounded { font-size: 24px; }
</style>
