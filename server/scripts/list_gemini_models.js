require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fetch = require('node-fetch');

(async () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('No GEMINI_API_KEY in .env');
    process.exit(1);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const text = await res.text();
    console.log('Status', res.status);
    try {
      const json = JSON.parse(text);
      console.log('Models response keys:', Object.keys(json));
      if (json.models) {
        json.models.forEach(m => {
          console.log('---');
          console.log('name:', m.name);
          console.log('displayName:', m.displayName);
          console.log('supportedMethods:', m.supportedMethods || m.supported_methods || 'n/a');
          console.log('description:', m.description && m.description.slice ? m.description.slice(0,200) : m.description);
        });
      } else {
        console.log('Raw response:', JSON.stringify(json, null, 2).slice(0, 1000));
      }
    } catch (e) {
      console.log('Non-json response:', text);
    }
  } catch (err) {
    console.error('Fetch error:', err && err.message ? err.message : err);
  }
})();