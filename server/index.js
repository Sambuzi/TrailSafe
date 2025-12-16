const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load .env explicitly from this directory so running the server
// from the repo root still picks up server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;

// Optional MongoDB connection
const startServer = async () => {
  let connectedToRealMongo = false;
  let mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
      connectedToRealMongo = true;
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }

  // If no real Mongo connection, start an in-memory MongoDB for development
  if (!connectedToRealMongo) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('Started in-memory MongoDB for development');
      // keep reference so it won't be gc'd
      app.locals._mongod = mongod;
    } catch (err) {
      console.error('Failed to start in-memory MongoDB, falling back to in-memory samples:', err);
    }
  }

  // Simple status route with DB info
  app.get('/api/status', (req, res) => {
    const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
    res.json({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      db: {
        readyState: dbState,
        connected: dbState === 1,
        uri: process.env.MONGODB_URI ? 'external' : (mongoUri ? 'in-memory' : 'none')
      }
    });
  });

  // Routes
  app.use('/api/trails', require('./routes/trails'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/weather', require('./routes/weather'));
  app.use('/api/ai', require('./routes/ai'));


  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
