const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(compression());

// ─── Rate Limiting ──────────────────────────────────────────────────────────
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  console.warn('[RateLimit] express-rate-limit not installed. Run: npm install express-rate-limit');
}

if (rateLimit) {
  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
  });

  // Strict limit for auth endpoints (prevents brute force)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
  });

  // Strict limit for inquiry submission (prevents spam)
  const inquiryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, message: 'Too many inquiries sent. Please wait a moment.' }
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api/inquiries', inquiryLimiter);
}

// ─── CORS ────────────────────────────────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGINS;
const allowedOrigins = corsOrigins
  ? corsOrigins.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server / curl / mobile (no Origin header)
    if (!origin) return callback(null, true);

    // SECURITY FIX: Use exact match only (startsWith was vulnerable to subdomain spoofing)
    const isAllowed = allowedOrigins.includes(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Basic health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Gomandap API is running...');
});

// ─── Routes ──────────────────────────────────────────────────────────────────
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api/vendors', vendorRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const marketingRoutes = require('./routes/marketingRoutes');
app.use('/api/marketing', marketingRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const cartOrderRoutes = require('./routes/cartOrderRoutes');
app.use('/api/cart-orders', cartOrderRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const contentRoutes = require('./routes/contentRoutes');
app.use('/api/content', contentRoutes);

const filterRoutes = require('./routes/filterRoutes');
app.use('/api/filters', filterRoutes);

const inquiryRoutes = require('./routes/inquiryRoutes');
app.use('/api/inquiries', inquiryRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const leadRoutes = require('./routes/leadRoutes');
app.use('/api/leads', leadRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const whatsappRoutes = require('./routes/whatsappRoutes');
app.use('/api/whatsapp', whatsappRoutes);

const adRoutes = require('./routes/adRoutes');
app.use('/api/ads', adRoutes);

const helpRequestRoutes = require('./routes/helpRequestRoutes');
app.use('/api/help-requests', helpRequestRoutes);

const testimonialRoutes = require('./routes/testimonialRoutes');
app.use('/api/testimonials', testimonialRoutes);

// ─── WhatsApp Service ─────────────────────────────────────────────────────────
const whatsappService = require('./services/whatsappService');
// Only initialize WhatsApp on the primary PM2 cluster instance (instance 0)
// to prevent Puppeteer session lock crashes across multiple threads.
if (process.env.NODE_APP_INSTANCE === '0' || typeof process.env.NODE_APP_INSTANCE === 'undefined') {
  whatsappService.initializeWhatsApp();
}

// ─── Security Warnings ────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('\n⚠️  SECURITY WARNING: JWT_SECRET is not set in .env! Using insecure fallback.\n');
}

const PORT = process.env.PORT || 5000;

// ─── Auto-seed Admin ──────────────────────────────────────────────────────────
const Admin = require('./models/Admin');
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const crypto = require('crypto');
      const initialPassword = crypto.randomBytes(12).toString('hex');
      await Admin.create({
        username: 'admin',
        password: initialPassword
      });
      console.log('\n✅ Admin user seeded successfully.');
      console.log(`   Username: admin`);
      console.log(`   Initial Password: ${initialPassword}`);
      console.log('   Please set up 2FA via the Admin panel immediately.\n');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};
seedAdmin();

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});
