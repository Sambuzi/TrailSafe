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
import '../css/Settings.css';
export default {
  name: 'Settings'
}
</script>

