import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassLanguageSelector from '../ui/GlassLanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="navbar-logo flex items-center">
            <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-8 md:h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            <Link to="/venues" className="nav-item">{t('nav_venues')}</Link>
            <Link to="/vendors" className="nav-item">{t('nav_vendors')}</Link>
            <Link to="/real-weddings" className="nav-item">{t('nav_real_weddings')}</Link>
            <Link to="/blog" className="nav-item">{t('nav_blog')}</Link>
            <GlassLanguageSelector />
            <button className="btn btn-primary">
              <User size={18} />
              {t('nav_signin')}
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
        <div className="flex justify-between items-center px-4 pt-4 mb-4">
          <GlassLanguageSelector />
        </div>
        <Link to="/venues" className="nav-item" onClick={toggleMenu}>{t('nav_venues')}</Link>
        <Link to="/vendors" className="nav-item" onClick={toggleMenu}>{t('nav_vendors')}</Link>
        <Link to="/real-weddings" className="nav-item" onClick={toggleMenu}>{t('nav_real_weddings')}</Link>
        <Link to="/blog" className="nav-item" onClick={toggleMenu}>{t('nav_blog')}</Link>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <User size={18} />
          {t('nav_signin')}
        </button>
      </div>
    </>
  );
};

export default Navbar;
