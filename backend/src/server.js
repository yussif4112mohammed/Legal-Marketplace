require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes            = require('./routes/auth');
const lawyersRoutes         = require('./routes/lawyers');
const bookingsRoutes        = require('./routes/bookings');
const messagesRoutes        = require('./routes/messages');
const reviewsRoutes         = require('./routes/reviews');
const adminRoutes           = require('./routes/admin');
const specializationsRoutes = require('./routes/specializations');

const app  = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'https://lexbridge-ten.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,   // ← change this
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
});

app.use(globalLimiter);

// ─── Request Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',            authLimiter, authRoutes);
app.use('/api/lawyers',         lawyersRoutes);
app.use('/api/bookings',        bookingsRoutes);
app.use('/api/messages',        messagesRoutes);
app.use('/api/reviews',         reviewsRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/specializations', specializationsRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n🚀 Legal Marketplace API running on http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
