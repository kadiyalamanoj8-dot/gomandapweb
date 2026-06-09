import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import ScraperDashboard from './ScraperDashboard';
import EmployeeDashboard from './EmployeeDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gomandap_scraper_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gomandap_scraper_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gomandap_scraper_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <ScraperDashboard onLogout={handleLogout} />;
  }

  if (user.role === 'employee') {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
  }

  // Fallback
  return <Login onLogin={handleLogin} />;
}

export default function AppWrapper() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <App />
    </>
  );
}


