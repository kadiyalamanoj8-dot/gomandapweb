import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    // Check localStorage on load
    const storedUser = localStorage.getItem('gomandap_client_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (phoneNumber) => {
    try {
      const res = await fetch('https://gomandap-api.onrender.com/api/auth/user/sync', {
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
        // Execute pending action if exists (e.g., redirecting to vendor details)
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
      const res = await fetch('https://gomandap-api.onrender.com/api/auth/google', {
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
