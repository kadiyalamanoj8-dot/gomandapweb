import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

import { API_URL } from '../config/api';

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
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('gomandap_client_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      captureAndSendLocation(user._id);
    }
  }, []);


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
      
      if (res.ok && data.success) {
        setUser(data);
        localStorage.setItem('gomandap_client_user', JSON.stringify(data));
        setShowLoginModal(false);
        captureAndSendLocation(data._id); // ← silent location capture
        
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error("Google Login failed:", error);
      return { success: false, message: 'Network error or server unreachable' };
    }
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
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, requireAuth, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

