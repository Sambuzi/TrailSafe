<template>
  <aside class="admin-sidebar">
    <div class="logo">TS</div>

    <nav>
      <router-link :to="{ path: '/admin', query: { section: 'trails' } }" class="item" title="Percorsi">
        <span class="material-symbols-rounded">terrain</span>
        <span class="label">Percorsi</span>
      </router-link>

      <router-link :to="{ path: '/admin', query: { section: 'reports' } }" class="item" title="Segnalazioni">
        <span class="material-symbols-rounded">report_problem</span>
        <span class="label">Segnalazioni</span>
      </router-link>

      <router-link :to="{ path: '/admin', query: { section: 'profile' } }" class="item" title="Profilo admin">
        <span class="material-symbols-rounded">admin_panel_settings</span>
        <span class="label">Profilo</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar'
}
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 88px;
  background: linear-gradient(180deg, #ffffff, #f7f8fb);
  border-right: 1px solid #e6e6ef;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  box-sizing: border-box;
}

.logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  font-weight: 700;
  color: #0f4c3d;
  background: #e8f5e9;
  border-radius: 12px;
}

nav { display:flex; flex-direction: column; gap: 12px; }

.item {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f4c3d;
  text-decoration: none;
}

.item:hover, .item.router-link-active { background: #e0f2f1; }

.label { display: none; }

@media (min-width: 900px) {
  .admin-sidebar { width: 220px; align-items: flex-start; padding: 24px; }
  .item { width: 100%; justify-content: flex-start; gap: 12px; padding: 12px 16px; }
  .label { display: inline; font-size: 15px; }
}

.material-symbols-rounded { font-size: 24px; }

</style>
