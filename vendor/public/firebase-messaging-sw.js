import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyC-ro9gGqJQpb-z1NcgEWmwi4XeosFfveg",
  authDomain: "gomandap-60eed.firebaseapp.com",
  projectId: "gomandap-60eed",
  storageBucket: "gomandap-60eed.firebasestorage.app",
  messagingSenderId: "565529529704",
  appId: "1:565529529704:web:52f25036eab8f3a80cdadd"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
