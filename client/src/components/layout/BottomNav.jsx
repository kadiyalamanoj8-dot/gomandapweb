import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Calendar, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={24} />
        <span>Saved</span>
      </NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>Bookings</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
