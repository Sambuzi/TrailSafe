require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  try {
    const modelName = 'models/gemini-2.5-flash';
    console.log('Trying model:', modelName);
    const model = genAI.getGenerativeModel({ model: modelName });

    const chat = await model.startChat({
      params: { generationConfig: { maxOutputTokens: 200, temperature: 0 } }
    });

    const prompt = 'Restituisci esattamente JSON: {"results": []}';

    const result = await chat.sendMessage(prompt);
    console.log('sendMessage result keys:', Object.keys(result || {}));
    console.log('sendMessage result.response keys:', result && result.response ? Object.keys(result.response) : 'n/a');

    // If SDK included candidates array, try to extract text
    const candidates = result && result.response && result.response.candidates;
    if (Array.isArray(candidates) && candidates[0]) {
      const content = candidates[0].content;
      if (Array.isArray(content)) {
        console.log('Candidate content segments:', content.map(s => s.text).join(' '));
      } else {
        console.log('Candidate content:', content);
      }
    }

    // Also try to read history
    const hist = chat.getHistory();
    console.log('History raw:', JSON.stringify(hist, null, 2));

  } catch (err) {
    console.error('Error calling model:', err && err.message ? err.message : err);
  }
})();