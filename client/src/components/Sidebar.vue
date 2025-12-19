<template>
  <BaseSidebar :items="items" :logo-src="logoSrc" />
</template>

<script>
import BaseSidebar from './BaseSidebar.vue'
import logo from '../assets/logo.png'

export default {
  name: 'Sidebar',
  components: { BaseSidebar },
  data() {
    return {
      items: [
        { to: '/home', icon: 'home', label: 'Home', title: 'Home' },
        { to: '/explore', icon: 'explore', label: 'Explore', title: 'Explore' },
        { to: '/map', icon: 'map', label: 'Map', title: 'Map' },
        { to: '/profile', icon: 'person', label: 'Profile', title: 'Profile' }
      ],
      logoSrc: logo
    }
  }
}
</script>


