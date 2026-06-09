require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Drop the problematic index
    await mongoose.connection.db.collection('users').dropIndex('phoneNumber_1');
    console.log('Successfully dropped phoneNumber_1 index');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('Index already dropped or does not exist');
    } else {
      console.error('Error dropping index:', error);
    }
  } finally {
    // Re-create indexes based on current schema
    const User = require('./models/User');
    await User.syncIndexes();
    console.log('Successfully synced indexes based on sparse:true schema');
    process.exit(0);
  }
}

fixIndex();
