<template>
  <div class="settings" @click.outside="open = false">
    <button class="gear" @click="goToSettings" aria-label="Settings">
      <!-- Material 3 'settings' filled icon -->
      <svg class="m3-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.4.12-.6l-1.92-3.32c-.11-.19-.34-.26-.54-.19l-2.39.96a7.007 7.007 0 0 0-1.6-.94l-.36-2.54A.486.486 0 0 0 14 2h-4c-.24 0-.44.17-.48.41l-.36 2.54c-.57.23-1.11.54-1.6.94l-2.39-.96a.5.5 0 0 0-.54.19L2.71 8.9c-.11.2-.06.46.12.6l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 15.5a.5.5 0 0 0-.12.6l1.92 3.32c.11.19.34.26.54.19l2.39-.96c.49.4 1.03.71 1.6.94l.36 2.54c.04.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.57-.23 1.11-.54 1.6-.94l2.39.96c.2.08.43 0 .54-.19l1.92-3.32a.5.5 0 0 0-.12-.6l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
      </svg>
    </button>

    <div v-if="open" class="dropdown">
      <router-link to="/profile" class="item" @click="open = false">Profilo</router-link>
      <router-link to="/settings" class="item" @click="open = false">Impostazioni</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsButton',
  data() {
    return { open: false }
  },
  methods: {
    toggle() {
      this.open = !this.open
    },
    goToSettings() {
      this.$router.push('/settings')
      this.open = false
    }
  },
  directives: {
    // simple click-outside directive for this component
    outside: {
      beforeMount(el, binding) {
        el.__clickOutsideHandler__ = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event)
          }
        }
        document.addEventListener('click', el.__clickOutsideHandler__)
      },
      unmounted(el) {
        document.removeEventListener('click', el.__clickOutsideHandler__)
        delete el.__clickOutsideHandler__
      }
    }
  }
}
</script>

<style scoped>
.settings { position: relative; display: inline-block }
.gear { background: var(--m3-surface, rgba(255,255,255,0.06)); border: none; color: var(--m3-on-surface, #fff); cursor: pointer; padding: 8px; border-radius: 12px; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; box-shadow: none }
.gear:hover { background: rgba(255,255,255,0.12) }
.m3-icon { width: 20px; height: 20px; display: block }
.dropdown { position: absolute; right: 0; top: 50px; background: #fff; color: #222; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); min-width: 160px; overflow: hidden }
.dropdown .item { display: block; padding: 8px 12px; text-decoration: none; color: inherit }
.dropdown .item:hover { background: #f5f5f5 }
</style>
