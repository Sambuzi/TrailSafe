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
/* Mobile-first: bottom navigation */
.sidebar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 8px 12px;
  box-sizing: border-box;
  z-index: 30;
}

.logo {
  display: none; /* hide logo on very small nav to maximize space */
}

/* Ensure logo image is constrained and doesn't overflow */
.logo img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Mobile nav layout: make the nav a horizontal flex container */
nav {
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  flex-wrap: nowrap;
}

.item {
  min-width: 56px;
  height: 56px;
  border-radius: 14px;
  display: inline-flex; /* keep items inline within the horizontal nav */
  align-items: center;
  justify-content: center;
  color: #1b5e20;
  text-decoration: none;
  flex-direction: column;
  gap: 4px;
  padding: 4px 8px;
  flex: 0 0 auto; /* prevent item from growing/shrinking */
}


.item .label {
  display: none; /* hide labels on very small screens */
  font-size: 12px;
}

/* show the label of the active item for clarity on mobile */
.item.my-active .label {
  display: block;
  font-size: 12px;
  color: #0f4c3d;
}
.item:hover,
.item.my-active {
  background: #e8f5e9;
}

/* Desktop: left sidebar */
@media (min-width: 900px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 260px;
    height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
    justify-content: flex-start;
  }

  .logo {
    display: flex;
    width: 56px;
    height: 56px;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    overflow: hidden; /* hide any overflow from oversized images */
  }

  .logo img {
    width: 56px; /* enforce exact size on desktop */
    height: 56px;
    max-width: 56px;
    max-height: 56px;
    object-fit: contain;
    display: block;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .item {
    width: 100%;
    min-width: unset;
    height: auto;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 16px;
    flex-direction: row;
  }

  .item .label {
    display: inline;
    font-size: 15px;
  }
}

.material-symbols-rounded { font-size: 24px; }
</style>
