const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/users', userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;