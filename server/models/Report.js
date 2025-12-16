const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  text: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },

  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  location: {
    lat: Number,
    lng: Number
  },

  imageUrl: String,

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Report', ReportSchema);
