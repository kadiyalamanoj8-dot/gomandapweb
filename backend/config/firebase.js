const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized Successfully");
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 not found in .env. Push notifications will be disabled.");
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!admin.apps.length) return false;
  
  try {
    const message = {
      notification: { title, body },
      data,
      token: fcmToken
    };
    
    const response = await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

module.exports = { admin, sendPushNotification };
