// app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const webhookRoutes = require('./routes/webhook.routes');
const teamRoutes = require('./routes/team.routes');
const authRoutes = require('./routes/auth.routes');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/webhook', webhookRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
