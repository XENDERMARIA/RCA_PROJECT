const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const rcaRoutes = require('./routes/rcaRoutes');
const aiRoutes = require('./routes/aiRoutes');
const solverRoutes = require('./routes/solverRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rca-system')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/rca', rcaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/solver', solverRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'RCA System API is running',
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check configuration (remove in production)
app.get('/api/debug/config', (req, res) => {
  res.json({
    mongoConnected: mongoose.connection.readyState === 1,
    aiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    aiKeyPrefix: process.env.ANTHROPIC_API_KEY ? 
      process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Features: ${process.env.ANTHROPIC_API_KEY ? 'ENABLED' : 'DISABLED (no API key)'}`);
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY.substring(0, 15)}...`);
  }
});
