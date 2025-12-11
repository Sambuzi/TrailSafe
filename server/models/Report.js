const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  severity: { type: String, enum: ['low','medium','high'], default: 'low' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
