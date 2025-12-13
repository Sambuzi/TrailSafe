<template>
  <div class="chat-page">
    <!-- AREA MESSAGGI -->
    <div class="chat-messages">
      <div class="message ai">
        👋 Ciao! Descrivimi il percorso che cerchi e ti aiuterò.
      </div>

      <div class="message user">
        Vorrei un trekking facile vicino al mare, massimo 10 km.
      </div>

      <div class="message ai">
        🌿 Ti consiglio un percorso costiero, difficoltà facile, 8 km,
        adatto a principianti e con bel panorama.
      </div>
    </div>

    <!-- INPUT CHAT -->
    <div class="chat-input">
      <input
        type="text"
        placeholder="Scrivi qui il tuo messaggio..."
      />
      <button>Invia</button>
    </div>
  </div>
</template>

<script>
import '../css/AIExplore.css'

export default {
  name: 'ChatAI'
}
</script>
