<template>
  <div class="settings-page">
    <div class="settings-card">
      <h2>Impostazioni</h2>

      <!-- Placeholder sections: replace or extend as needed -->
      <section class="setting-section">
        <h3>Account</h3>
        <p>Qui potrai gestire le impostazioni del tuo account.</p>
      </section>

      <section class="setting-section">
        <h3>Preferenze</h3>
        <p>Lingua, unità di misura e preferenze dell'app.</p>
      </section>

      <section class="setting-section">
        <h3>Privacy</h3>
        <p>Opzioni per condivisione dati e privacy.</p>
      </section>

      <div class="actions">
        <button class="btn-primary" @click="$router.back()">Torna indietro</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings'
}
</script>

<style scoped>
.settings-page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.settings-card {
  width: 100%;
  max-width: 920px;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.setting-section { margin-bottom: 16px }
.setting-section h3 { margin: 0 0 8px 0 }

.actions { display:flex; justify-content:flex-end; gap:12px }
.btn-primary { background: #1b5e20; color: #fff; padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer }
</style>
