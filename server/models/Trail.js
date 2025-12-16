const mongoose = require('mongoose');

const TrailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, default: 'Medium' },
  status: { type: String, default: 'Aperto' },
  length_km: { type: Number, min: 0 },


  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: {
      type: [[Number]], // [lng, lat]
      required: true
    }
  }
});

module.exports = mongoose.model('Trail', TrailSchema);
