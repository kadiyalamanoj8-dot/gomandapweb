require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Gomandap API is running...');
});

// Proxy Scraper Requests to local scraper process
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api/scraper-app', createProxyMiddleware({
  target: 'http://127.0.0.1:5002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/scraper-app': '/api'
  },
  on: {
    error: (err, req, res) => {
      console.error('[Proxy Error] Failed to connect to Scraper Server:', err.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Scraper Server is offline or unreachable', details: err.message }));
    }
  }
}));

// Import Routes
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api/vendors', vendorRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const filterRoutes = require('./routes/filterRoutes');
app.use('/api/filters', filterRoutes);

const inquiryRoutes = require('./routes/inquiryRoutes');
app.use('/api/inquiries', inquiryRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const leadRoutes = require('./routes/leadRoutes');
app.use('/api/leads', leadRoutes);

const PORT = process.env.PORT || 5000;

// Auto-seed Admin
const Admin = require('./models/Admin');
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        password: 'Gomandap@587487'
      });
      console.log('Admin user seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};
seedAdmin();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
