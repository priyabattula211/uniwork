const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  return mongoose.connection;
}

module.exports = connectDB;