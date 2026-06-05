import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="navbar-logo">
            Gomandap
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            <Link to="/venues" className="nav-item">Venues</Link>
            <Link to="/vendors" className="nav-item">Vendors</Link>
            <Link to="/real-weddings" className="nav-item">Real Weddings</Link>
            <Link to="/blog" className="nav-item">Blog</Link>
            <button className="btn btn-primary">
              <User size={18} />
              Sign In
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/venues" className="nav-item" onClick={toggleMenu}>Venues</Link>
        <Link to="/vendors" className="nav-item" onClick={toggleMenu}>Vendors</Link>
        <Link to="/real-weddings" className="nav-item" onClick={toggleMenu}>Real Weddings</Link>
        <Link to="/blog" className="nav-item" onClick={toggleMenu}>Blog</Link>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <User size={18} />
          Sign In
        </button>
      </div>
    </>
  );
};

export default Navbar;
