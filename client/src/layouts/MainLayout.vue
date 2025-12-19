<template>
  <div class="layout">
    <component :is="isAdmin ? 'AdminSidebar' : 'Sidebar'" />

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
import AdminSidebar from '../components/AdminSidebar.vue'
import SettingsButton from '../components/SettingsButton.vue'
import '../css/MainLayout.css'

export default {
  name: 'MainLayout',
  components: { Sidebar, AdminSidebar, SettingsButton },
  data() {
    return { isAdmin: false };
  },
  mounted() {
    try {
      const raw = localStorage.getItem('ts_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed && parsed.user ? parsed.user : parsed;
        this.isAdmin = user && user.role === 'admin';
      }
    } catch (e) {
      this.isAdmin = false;
    }
  }
}
</script>
