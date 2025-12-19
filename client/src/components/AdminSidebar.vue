<template>
  <BaseSidebar :items="items" :logo-src="logoSrc" />
</template>

<script>
import BaseSidebar from './BaseSidebar.vue'
import logo from '../assets/logo.png'

export default {
  name: 'AdminSidebar',
  components: { BaseSidebar },
  data() {
    return {
      items: [
        { to: '/admin', icon: 'terrain', label: 'Percorsi', title: 'Percorsi' },
        { to: '/admin/reports', icon: 'report_problem', label: 'Segnalazioni', title: 'Segnalazioni' },
        { to: '/admin/profile', icon: 'admin_panel_settings', label: 'Profilo', title: 'Profilo admin' }
      ],
      logoSrc: logo
    }
  }
}
</script>

<style scoped>
</style>
