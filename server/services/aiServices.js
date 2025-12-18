const OpenAI = require("openai");

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

