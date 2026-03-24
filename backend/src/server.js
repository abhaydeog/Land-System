require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const complaintRoutes = require('./routes/complaint.routes');
const officerRoutes = require('./routes/officer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Bahut zyada requests. Thodi der baad try karen.' }
});
app.use('/api', limiter);

// ── Body Parser ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Static Files (uploads) ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/complaints',  complaintRoutes);
app.use('/api/officers',    officerRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/reports',     reportRoutes);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Bhumi Backend' });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route nahi mili' });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error. Dobara try karen.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Bhumi Backend Server chal raha hai: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄  Database: PostgreSQL\n`);
});

module.exports = app;
