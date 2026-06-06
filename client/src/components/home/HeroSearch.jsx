import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, PartyPopper } from 'lucide-react';
import GlassDatePicker from '../ui/GlassDatePicker';

const HeroSearch = () => {
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(null);
  const [guests, setGuests] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching:', { eventType, location, date, guests });
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

        <form className="advanced-search-bar" onSubmit={handleSearch}>
          <div className="search-field">
            <PartyPopper size={20} className="search-icon" />
            <select 
              className="search-input" 
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="" disabled>Event Type</option>
              <option value="wedding">Wedding</option>
              <option value="reception">Reception</option>
              <option value="corporate">Corporate Event</option>
              <option value="birthday">Birthday Party</option>
            </select>
          </div>
          
          <div className="search-divider"></div>
          
          <div className="search-field">
            <MapPin size={20} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Location or City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="search-divider"></div>
          
          <div className="search-field">
            <GlassDatePicker
              value={date}
              onChange={setDate}
              placeholder="Event Date"
              variant="light"
            />
          </div>

          <div className="search-divider"></div>
          
          <div className="search-field">
            <Users size={20} className="search-icon" />
            <input 
              type="number" 
              className="search-input" 
              placeholder="Guests (e.g. 500)"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
            />
          </div>

          <button type="submit" className="btn btn-primary search-submit-btn">
            <Search size={20} />
            <span className="search-btn-text">Search</span>
          </button>
        </form>
      </div>
    </header>
  );
};

export default HeroSearch;
