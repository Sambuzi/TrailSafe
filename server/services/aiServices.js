const OpenAI = require("openai");
const { askGemini } = require('./gemini');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function embedText(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}

function trailToText(trail) {
  return `
    ${trail.name}.
    Difficoltà ${trail.difficulty}.
    Lunghezza ${trail.length_km} km.
    Stato ${trail.status || 'non specificato'}.
  `;
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  // protezione contro divisione per zero
  if (normA === 0 || normB === 0) return 0;

  return dot / (normA * normB);
}

async function rankTrails(query, trails) {
  if (!query) return [];

  // Se USE_GEMINI è impostato, usa Gemini per classificare i percorsi
  if (process.env.USE_GEMINI === '1') {
    // Limiti: non inviare troppi dati al modello in produzione;
    // qui inviamo solo un breve riepilogo di ogni percorso
    const items = trails.map(t => ({
      id: t._id || t.id,
      name: t.name,
      difficulty: t.difficulty || 'n/a',
      length_km: t.length_km || null,
      status: t.status || 'non specificato'
    }));

    // limit number of items sent to the model to reduce token usage
    const itemsToSend = items.slice(0, 30);
    const listText = itemsToSend.map(i => `ID:${i.id} | ${i.name} | Difficoltà:${i.difficulty} | Km:${i.length_km || 'n/s'}`).join('\n');

    const prompt = `Sei un assistente che, dato un elenco di percorsi e una richiesta utente, restituisce i percorsi più rilevanti. Importante: RISPOSTA SOLO JSON.\n\nElenco percorsi:\n${listText}\n\nRichiesta utente: "${query}"\n\nRestituisci SOLO un JSON con una proprietà "results" (array) con al massimo 5 elementi, ciascuno {"id","name","score","explanation"}. "score" tra 0 e 1. Non aggiungere altro testo.`;

    try {
      // low temperature and short output to limit cost
      const reply = await askGemini(prompt, { maxOutputTokens: 200, temperature: 0 });

      // Proviamo a fare il parsing della risposta JSON in modo sicuro
      let parsed = null;
      try {
        parsed = JSON.parse(reply);
      } catch (err) {
        const jsonMatch = reply && reply.match && reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { parsed = null; }
        }
      }

      if (parsed && Array.isArray(parsed.results)) {
        return parsed.results.map(r => {
          const original = itemsToSend.find(i => String(i.id) === String(r.id) || i.name === r.name) || {};
          return {
            ...original,
            score: typeof r.score === 'number' ? r.score : 0,
            explanation: r.explanation || ''
          };
        });
      }

      // se Gemini ha risposto ma non in formato previsto, logghiamo e ritorniamo vuoto (Gemini-only mode)
      console.warn('Gemini returned unexpected format, reply:', reply);
      return [];
    } catch (err) {
      console.error('Gemini ranking failed:', err && err.message ? err.message : err);
      // In Gemini-only mode return an empty array and bubble up the error to log
      return [];
    }
  }

  // --- FALLBACK: metodo a embedding con OpenAI ---
  // calcola embedding della query
  const qEmb = await embedText(query);

  // per ogni percorso usa embedding precomputato se disponibile, altrimenti lo calcola
  const scored = await Promise.all(trails.map(async (trail) => {
    let tEmb = trail.embedding;
    if (!tEmb) {
      const text = trailToText(trail);
      tEmb = await embedText(text);
    }

    // protezione contro vettori non validi
    if (!Array.isArray(tEmb) || tEmb.length === 0) {
      return { ...trail, score: -Infinity };
    }

    const score = cosineSimilarity(qEmb, tEmb);
    return { ...trail, score };
  }));

  // ordina dal più rilevante al meno rilevante
  return scored.sort((a, b) => b.score - a.score);
}

module.exports = { embedText, trailToText, cosineSimilarity, rankTrails };

