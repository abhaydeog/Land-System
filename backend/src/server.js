if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
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


// ── ✅ Security Middleware ──
app.use(helmet({
  crossOriginResourcePolicy: false
}));


// ── ✅ CORS (FINAL WORKING) ──
const allowedOrigins = [
  "https://land-portal.netlify.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / curl

    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // ✅ true देना safe है
    } else {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// ✅ Preflight (CORS का main fix)
app.options('*', cors(corsOptions));


// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api', limiter);


// ── Body Parser ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ── Logging ──
app.use(morgan('dev'));


// ── Static Files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// ── ✅ ROOT ROUTE (ADD THIS) ──
app.get('/', (req, res) => {
  res.send('Bhumi Backend Running ✅');
});


// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);


// ── ✅ Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bhumi Backend',
    time: new Date()
  });
});


// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route nahi mili'
  });
});


// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});


// ── Server Start ──
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
