import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCklTI3GoM1RCavT62rzVx7kv6fInIfW9Y",
  authDomain: "gomandap-60eed.firebaseapp.com",
  projectId: "gomandap-60eed",
  storageBucket: "gomandap-60eed.firebasestorage.app",
  messagingSenderId: "565529529704",
  appId: "1:565529529704:web:52f25036eab8f3a80cdadd",
  measurementId: "G-EDN5BTHWHC"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
