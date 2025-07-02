const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger'); // ✅ NEW
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// Start message
console.log('Initializing backend...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger); // ✅ NEW: log all requests

// Routes
app.use('/api', userRoutes);
app.use('/api', agentRoutes);

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
