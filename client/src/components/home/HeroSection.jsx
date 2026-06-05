import React, { useState } from 'react';
import { Search, MapPin, Grid } from 'lucide-react';

const HeroSection = () => {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', category, 'in', location);
  };

  return (
    <header className="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1 className="hero-title">Your Dream Event, Perfectly Orchestrated</h1>
        <p className="hero-subtitle">
          Discover India's finest banquet halls, lawns, and top-tier wedding professionals.
        </p>

        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-field">
            <MapPin size={20} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="City or Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="search-divider"></div>
          
          <div className="search-field">
            <Grid size={20} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Category (e.g. Banquet, Catering)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <Search size={20} />
            Search
          </button>
        </form>
      </div>
    </header>
  );
};

export default HeroSection;
