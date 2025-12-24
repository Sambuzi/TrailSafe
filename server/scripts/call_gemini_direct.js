require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  const candidates = ['gemini-1.5','text-bison-001','gemini-1.5-flash'];
  for (const c of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: c });
      console.log('Trying model:', c);
      const resp = await model.generateContent('Restituisci semplicemente: {"results":[]}');
      try {
        const text = resp.response?.text ? resp.response.text() : JSON.stringify(resp);
        console.log('Response text:', text);
      } catch (e) {
        console.log('Response raw:', resp);
      }
    } catch (err) {
      console.error('Model call error for', c, err && err.message ? err.message : err);
    }
    console.log('----');
  }
})();