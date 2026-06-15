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

const corsOrigins = process.env.CORS_ORIGINS;
if (corsOrigins) {
  const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => {
        return origin === allowed || origin.startsWith(allowed);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // Permissive fallback for dev environment if CORS_ORIGINS is not set
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Gomandap API is running...');
});


// Import Routes
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api/vendors', vendorRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

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
