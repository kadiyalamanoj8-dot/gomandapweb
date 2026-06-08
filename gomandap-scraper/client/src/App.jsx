import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

function App() {
  const [user, setUser] = useState(null);

  // Check local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('scraperUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('scraperUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scraperUser');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (user.role === 'employee') {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
  }

  // Fallback
  return <Login onLogin={handleLogin} />;
}

export default App;
