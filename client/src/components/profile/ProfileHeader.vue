<template>
  <header class="profile-header">
    <div class="avatar" :aria-label="userName">{{ initials }}</div>
    <div class="user-info">
      <h1 class="user-name">{{ user?.name || '—' }}</h1>
      <p class="user-level">Livello: {{ user?.level || 'principiante' }}</p>
      <p class="user-email">{{ user?.email || '—' }}</p>
      <p class="user-role">{{ user?.role || 'user' }}</p>
    </div>
    <div class="profile-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    user: { type: Object, default: () => ({}) }
  },
  computed: {
    userName() { return this.user?.name || '' },
    initials() {
      const n = (this.userName || '').trim()
      if (!n) return 'TS'
      return n.split(' ').map(s => s[0].toUpperCase()).slice(0,2).join('')
    }
  }
}
</script>