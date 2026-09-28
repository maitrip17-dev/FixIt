const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('Warning: Neither MONGO_URI nor MONGODB_URI is defined in your backend/.env file.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas for FixIt!');
    console.log(`Database Host: ${conn.connection.host}`);
  } catch (error) {
    console.error('Connection error:', error.message);
  }
};

module.exports = connectDB;
