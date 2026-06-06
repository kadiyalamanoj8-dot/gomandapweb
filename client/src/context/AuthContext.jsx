import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

export const useAuth = () => useContext(AuthContext);

// Silently acquire GPS + reverse-geocode, then patch the backend
const captureAndSendLocation = async (userId) => {
  if (!userId || !navigator.geolocation) return;
  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000, maximumAge: 300000, enableHighAccuracy: false
      })
    );
    const { latitude, longitude } = position.coords;

    // Free reverse geocoding — no API key needed
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const geoData = await geoRes.json();
    const addr = geoData.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';

    // Fire-and-forget — don't block the UI
    fetch(`${API_URL}/api/auth/user/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, latitude, longitude, city, state, country })
    }).catch(() => {}); // Silent fail
  } catch {
    // Permission denied or timeout — silently ignore
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    // Check localStorage on load
    const storedUser = localStorage.getItem('gomandap_client_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Re-capture location on every app load to keep it fresh
      captureAndSendLocation(parsed._id);
    }
  }, []);

  const login = async (phoneNumber) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          deviceInfo: navigator.userAgent
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        localStorage.setItem('gomandap_client_user', JSON.stringify(data));
        setShowLoginModal(false);
        captureAndSendLocation(data._id); // ← silent location capture
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    return false;
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: googleToken,
          deviceInfo: navigator.userAgent
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        localStorage.setItem('gomandap_client_user', JSON.stringify(data));
        setShowLoginModal(false);
        captureAndSendLocation(data._id); // ← silent location capture
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return true;
      }
    } catch (error) {
      console.error("Google Login failed:", error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gomandap_client_user');
  };

  const requireAuth = (actionCallback) => {
    if (user) {
      actionCallback();
    } else {
      setPendingAction(() => actionCallback);
      setShowLoginModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, requireAuth, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

