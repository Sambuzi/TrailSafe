const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  level: { type: String, enum: ['principiante', 'intermedio', 'avanzato'], default: 'principiante' },
  notificationsEnabled: { type: Boolean, default: true },
  savedTrails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trail' }],
  plannedExcursions: [{
    trail: { type: mongoose.Schema.Types.ObjectId, ref: 'Trail' },
    date: { type: Date, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
