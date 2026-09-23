const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health Check Handlers (available at /health and /api/health)
const healthCheckHandler = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    message: 'FixIt API is healthy and running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// Root API route placeholder
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to FixIt API',
  });
});

// Central 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FixIt backend server running on port ${PORT}`);
});
