<template>
  <div class="chat-page">

    <div class="chat-messages">
      <div class="message ai">
        👋 Ciao! Descrivimi il percorso che cerchi e ti aiuterò.
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message', msg.type]"
      >
        {{ msg.text }}
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="userMessage"
        type="text"
        placeholder="Scrivi qui il tuo messaggio..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Invia</button>
    </div>

  </div>
</template>


<script>
import '../css/AIExplore.css'

export default {
  name: 'ChatAI',

  data() {
    return {
      userMessage: '',
      messages: []
    }
  },

  methods: {
    async sendMessage() {
      if (!this.userMessage.trim()) return;

      // 1️⃣ mostra messaggio utente
      this.messages.push({
        type: 'user',
        text: this.userMessage
      });

      const query = this.userMessage;
      this.userMessage = '';

      try {
        // 2️⃣ chiamata backend AI
        const res = await fetch('http://localhost:3000/api/ai/ai-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });

        const trails = await res.json();

        // 3️⃣ risposta AI
        if (trails.length === 0) {
          this.messages.push({
            type: 'ai',
            text: '😕 Non ho trovato percorsi adatti.'
          });
          return;
        }

        let response = '🌿 Ecco i percorsi più adatti:\n';
        trails.forEach((trail, index) => {
          response += `${index + 1}. "${trail.name}" - Difficoltà: ${trail.difficulty}, Lunghezza: ${trail.length_km} km\n`;
        });

        this.messages.push({
          type: 'ai',
          text: response
        });

      } catch (err) {
        console.error(err);
        this.messages.push({
          type: 'ai',
          text: '⚠️ Errore nel recupero dei percorsi.'
        });
      }
    }
  }
}
</script>

