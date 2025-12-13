<template>
  <div class="home-container">
    <!-- SEZIONE SINISTRA -->
    <section class="home-left">
      <!-- Barra di ricerca -->
      <div class="card search-card">
        <h2>Cerca un percorso</h2>
        <input
          type="text"
          placeholder="Descrivi il percorso che cerchi..."
          class="search-input"
        />
      </div>

      <!-- Meteo -->
      <div class="card weather-card">
        <h2>Meteo</h2>
        <p>Condizioni attuali nella tua zona</p>
        <!-- placeholder -->
        <div class="weather-info">
          ☁️ Nuvoloso – 12°C  
        </div>
      </div>
    </section>

    <!-- SEZIONE DESTRA -->
    <section class="home-right">
      <div class="card announcements-card">
        <h2>Annunci</h2>
        <ul>
          <li>⚠️ Sentiero Lago Verde chiuso per manutenzione</li>
          <li>🌧️ Allerta meteo prevista per domani</li>
          <li>ℹ️ Nuovi percorsi disponibili</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import '../css/Home.css'

export default {
  name: 'Home'
}
</script>
