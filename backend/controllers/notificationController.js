const webpush = require('web-push');

// In a real app, you would store subscriptions in the database.
// For now, we will store them in memory or a simple DB model if needed.
// Let's create a quick in-memory store for demo purposes, but ideally it should be in DB.
// Since Admin is a single user or small group, we can just save it.
let subscriptions = [];

// Initialize VAPID keys from env
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:support@gomandap.com',
    publicVapidKey,
    privateVapidKey
  );
}

// 1. Get VAPID Public Key
exports.getPublicKey = (req, res) => {
  if (!publicVapidKey) {
    return res.status(500).json({ error: 'VAPID keys not configured in .env' });
  }
  res.json({ publicKey: publicVapidKey });
};

// 2. Subscribe to Push Notifications
exports.subscribe = (req, res) => {
  const subscription = req.body;
  
  // Save subscription (in-memory for now, can be moved to DB)
  const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }

  res.status(201).json({ message: 'Subscribed successfully.' });
};

// 3. Broadcast Notification (Internal helper)
exports.broadcastNotification = async (payload) => {
  if (!publicVapidKey || !privateVapidKey) return;
  
  const promises = subscriptions.map(sub => 
    webpush.sendNotification(sub, JSON.stringify(payload))
      .catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or removed
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
  );

  await Promise.all(promises);
};

// Route to manually test notification from admin panel
exports.testNotification = async (req, res) => {
  try {
    await exports.broadcastNotification({
      title: 'Test Notification',
      body: 'Push notifications are working perfectly!',
      url: '/admin'
    });
    res.json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
