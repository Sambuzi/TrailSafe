const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Optional MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MONGODB_URI not set — running without DB (in-memory samples)');
}

// Simple status route
// Simple status route with DB info
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    db: {
      readyState: dbState,
      connected: dbState === 1
    }
  });
});

// Trails routes (in-memory sample)
app.use('/api/trails', require('./routes/trails'));

// Auth routes
app.use('/api/auth', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
