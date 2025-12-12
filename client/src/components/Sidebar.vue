<template>
  <aside class="sidebar">
    <div class="logo">TRAIL<br/>SAFE</div>
    <nav>
      <router-link class="nav-item" to="/home">🏠<span>Home</span></router-link>
      <router-link class="nav-item" to="/trails">🔍<span>Explore</span></router-link>
      <router-link class="nav-item" to="/home">🗺️<span>Map</span></router-link>
      <router-link class="nav-item" to="/report">⚠️<span>Reports</span></router-link>
      <router-link class="nav-item" to="/home">👤<span>Profile</span></router-link>
    </nav>
    <div class="spacer"></div>
    <div class="bottom">v0.1</div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
.sidebar {
  width: 84px;
  height: 100vh;
  background: rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  box-sizing: border-box;
}
.logo {
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 18px;
  line-height: 1;
}
nav { display:flex; flex-direction:column; gap:10px; width:100%; align-items:center }
.nav-item {
  width: 56px; height:56px; border-radius:12px; border:none; background: rgba(255,255,255,0.08);
  color: white; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;
}
.nav-item span { display:none }
.spacer { flex:1 }
.bottom { color: rgba(255,255,255,0.7); font-size:12px }

/* make sidebar darker on green background */
.sidebar { background: rgba(0,0,0,0.12); }

@media (min-width: 900px) {
  .nav-item span { display:block; font-size:12px; margin-left:8px }
}
</style>
