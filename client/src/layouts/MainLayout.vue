<template>
  <div class="layout">
    <Sidebar />

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import '../css/MainLayout.css'

export default {
  name: 'MainLayout',
  components: { Sidebar }
}
</script>
