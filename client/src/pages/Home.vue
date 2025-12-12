<template>
  <div class="home-root">
    <Sidebar />
    <main class="home-main">
      <div class="placeholder">
        <!-- future content -->
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
export default { components: { Sidebar } }
</script>

<style scoped>
.home-root { display:flex; min-height:100vh; background: linear-gradient(135deg, #1f4037, #6bbf9c); color: #fff }
.home-main { flex:1; padding: 28px }
.placeholder { border-radius:12px; background: rgba(255,255,255,0.06); height: 72vh }

@media (max-width: 600px) {
  .home-root { flex-direction:column }
  .home-main { padding:16px }
}
</style>
