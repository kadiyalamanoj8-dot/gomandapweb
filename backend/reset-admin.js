const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    try {
      console.log('Connected to DB...');
      let admin = await Admin.findOne({ username: 'admin' });
      if (!admin) {
        admin = new Admin({ username: 'admin' });
        console.log('Admin user not found, creating new one...');
      } else {
        console.log('Found existing admin user, updating password...');
      }
      
      admin.password = 'Gomandap@587487';
      await admin.save(); // The pre('save') hook in Admin.js will handle the hashing
      
      console.log('Admin password successfully reset to: Gomandap@587487');
      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });
