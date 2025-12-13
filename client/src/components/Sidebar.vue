<template>
  <aside class="sidebar">
    <div class="logo">
      <img src="../assets/logo.png" alt="TrailSafe logo" />
    </div>


    <nav>
      <router-link to="/home" class="item">
        <span class="material-symbols-rounded">home</span>
        <span class="label">Home</span>
      </router-link>

      <router-link to="/explore" class="item">
        <span class="material-symbols-rounded">explore</span>
        <span class="label">Explore</span>
      </router-link>

      <router-link to="/map" class="item">
        <span class="material-symbols-rounded">map</span>
        <span class="label">Map</span>
      </router-link>

      <router-link to="/profile" class="item">
        <span class="material-symbols-rounded">person</span>
        <span class="label">Profile</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 88px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  box-sizing: border-box;
}


nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1b5e20;
  text-decoration: none;
}

.item:hover,
.item.router-link-active {
  background: #e8f5e9;
}

.label {
  display: none;
}

/* Desktop */
@media (min-width: 900px) {
  .sidebar {
    width: 260px;
    align-items: flex-start;
    padding: 24px;
  }

  .item {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .label {
    display: inline;
    font-size: 15px;
  }
}

.logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

</style>
