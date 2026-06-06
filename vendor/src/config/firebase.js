import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
export const googleProvider = new GoogleAuthProvider();
