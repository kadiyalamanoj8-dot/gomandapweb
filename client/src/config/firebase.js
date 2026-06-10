import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-ro9gGqJQpb-z1NcgEWmwi4XeosFfveg",
  authDomain: "gomandap-60eed.firebaseapp.com",
  projectId: "gomandap-60eed",
  storageBucket: "gomandap-60eed.firebasestorage.app",
  messagingSenderId: "565529529704",
  appId: "1:565529529704:web:52f25036eab8f3a80cdadd",
  measurementId: "G-EDN5BTHWHC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const { getToken } = await import('firebase/messaging');
      // VAPID key is usually needed here, but omitting it will use the default sender ID
      const token = await getToken(messaging);
      return token;
    }
  } catch (error) {
    console.error('Push notification permission denied', error);
  }
  return null;
};
