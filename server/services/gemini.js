const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function stripCodeFences(s) {
  if (!s) return s;
  return s.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
}

async function askGemini(prompt, opts = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }

  // Candidate model names based on available list; prefer 2.x Flash/Pro
  const candidates = [
    'models/gemini-2.5-flash',
    'models/gemini-2.5-pro',
    'models/gemini-2.0-flash',
    'models/gemini-2.0-flash-001',
    'models/gemini-2.5-flash-lite',
  ];

  // allow caller to override generation constraints
  const maxOutputTokens = opts.maxOutputTokens || 200;
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.0;

  for (const candidate of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: candidate });

      // Start a chat session with conservative generation settings to limit cost
      const chat = await model.startChat({ params: { generationConfig: { maxOutputTokens, temperature } } });

      // send prompt as string; SDK returns result object
      const result = await chat.sendMessage(prompt);

      // try to extract human-readable text
      const resp = result && result.response;
      if (!resp) {
        console.warn(`No response from model ${candidate}`);
        continue;
      }

      // prefer `text` if present
      if (resp.text && typeof resp.text === 'string' && resp.text.trim()) {
        return stripCodeFences(resp.text);
      }

      // try candidates content (array)
      if (Array.isArray(resp.candidates) && resp.candidates[0]) {
        const cand = resp.candidates[0];
        const content = cand.content;
        // content may be { parts: [{text: '...'}] }
        if (content) {
          if (Array.isArray(content.parts)) {
            const joined = content.parts.map(p => p.text || '').join(' ');
            return stripCodeFences(joined);
          }
          // or it might be an array of segments
          if (Array.isArray(content)) {
            return stripCodeFences(content.map(p => p.text || '').join(' '));
          }
          // otherwise stringify
          return stripCodeFences(String(content));
        }
      }

      // fallback to stringifying the whole response
      return stripCodeFences(JSON.stringify(resp));
    } catch (err) {
      console.warn(`askGemini: candidate ${candidate} error:`, err && err.message ? err.message : err);
      continue; // try next candidate
    }
  }

  throw new Error('No Gemini-compatible model succeeded. See server logs for details.');
}

module.exports = { askGemini };
