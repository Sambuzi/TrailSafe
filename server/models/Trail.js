const mongoose = require('mongoose');

const TrailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, default: 'Medium' },
  status: { type: String, default: 'Aperto' },
  description: { type: String },
  length_km: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trail', TrailSchema);
