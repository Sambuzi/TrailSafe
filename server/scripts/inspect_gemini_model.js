require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  const candidates = ['gemini-1.5','text-bison-001','gemini-1.5-flash'];
  for (const c of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: c });
      console.log('Candidate:', c);
      console.log('Model keys:', Object.keys(model));
      // show prototype methods
      console.log('Model proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(model)));
    } catch (err) {
      console.error('Error getting model', c, err && err.message ? err.message : err);
    }
    console.log('----');
  }
})();