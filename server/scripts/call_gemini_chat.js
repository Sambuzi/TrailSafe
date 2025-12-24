require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  const candidates = ['gemini-1.5','gemini-1.5-flash','text-bison-001'];
  for (const c of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: c });
      console.log('Trying startChat with model:', c);
      const chat = await model.startChat({
        messages: [
          { role: 'user', content: [{ type: 'text', text: 'Rispondi solo con: {"results": []}' }] }
        ]
      });

      console.log('Chat output keys:', Object.keys(chat || {}));
      if (chat.output && chat.output.length) {
        console.log('Chat output[0].content:', JSON.stringify(chat.output[0].content).slice(0,1000));
      } else if (chat?.response?.text) {
        console.log('Chat response text:', chat.response.text());
      } else {
        console.log('Chat raw:', JSON.stringify(chat).slice(0,1000));
      }
    } catch (err) {
      console.error('startChat error for', c, err && err.message ? err.message : err);
    }
    console.log('----');
  }
})();