require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobRoutes = require('./routes/jobRoutes');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  errorFormat: 'pretty',
  log: ['query', 'error', 'info', 'warn'],
});

console.log("✅ jobRoutes loaded");

const app = express();
const PORT = process.env.PORT || 5050;

console.log('🚀 Initializing backend...');

app.use(cors());
app.use(express.json());
app.use(logger);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api', userRoutes);
app.use('/api', agentRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', jobRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});