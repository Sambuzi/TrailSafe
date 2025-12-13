<template>
  <div class="layout">
    <Sidebar />

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-right">
          <SettingsButton />
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import SettingsButton from '../components/SettingsButton.vue'
import '../css/MainLayout.css'

export default {
  name: 'MainLayout',
  components: { Sidebar, SettingsButton }
}
</script>
