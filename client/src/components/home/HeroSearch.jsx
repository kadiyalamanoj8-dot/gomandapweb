import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, PartyPopper } from 'lucide-react';
import AppleDateTimePicker from '../ui/AppleDateTimePicker';
import ApplePicker from '../ui/ApplePicker';
import { EVENT_TYPES } from '../../data/mockData';

const HeroSearch = () => {
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(null);
  const [guests, setGuests] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching:', { eventType, location, date, guests });
  };

  const eventOptions = EVENT_TYPES.map(type => ({ value: type, label: type }));

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
          <div className="search-field flex-1 min-w-[200px]">
            <ApplePicker
              options={eventOptions}
              value={eventType}
              onChange={setEventType}
              placeholder="Event Type"
              icon={PartyPopper}
              className="w-full"
            />
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
            <AppleDateTimePicker
              value={date}
              onChange={setDate}
              placeholder="Event Date"
              theme="light"
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
