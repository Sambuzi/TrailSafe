require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { askGemini } = require('../services/gemini');

(async () => {
  try {
    const r = await askGemini('Dami una risposta di prova: quali modelli hai a disposizione?');
    console.log('Gemini reply:', r);
  } catch (err) {
    console.error('Gemini test error:', err);
  }
})();