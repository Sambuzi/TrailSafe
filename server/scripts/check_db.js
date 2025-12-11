const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in environment. Copy .env.example to .env and set it.');
  process.exit(2);
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err && err.message ? err.message : err);
    process.exit(1);
  });
