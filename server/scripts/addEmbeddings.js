const mongoose = require('mongoose');
const Trail = require('../models/Trail');
const { embedText } = require('../services/embeddingService');


(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/trailsafe');


    console.log('✅ MongoDB connected');

    const trails = await Trail.find();
    console.log(`📍 Found ${trails.length} trails`);
     console.log(trails.map(t => t.name));

    // qui poi aggiungerai gli embeddings

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Errore embedding:', err);
    process.exit(1);
  }
})();
