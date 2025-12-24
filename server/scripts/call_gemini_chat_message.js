require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5' });
    const chat = await model.startChat();

    // send a message (string is accepted) and wait for the model reply
    await chat.sendMessage('Rispondi esattamente con {"results": []}');

    // get history and try to extract the assistant message
    const hist = chat.getHistory();
    console.log('History:', JSON.stringify(hist, null, 2));

    // attempt to find the assistant's last message
    const assistant = hist.find(h => h.role === 'assistant');
    if (assistant) {
      console.log('Assistant content:', JSON.stringify(assistant.content, null, 2));
      // find text segments
      const text = (assistant.content || []).map(c => c.text || '').join(' ');
      console.log('Assistant text:', text);
    }
  } catch (err) {
    console.error('startChat message error:', err && err.message ? err.message : err);
  }
})();