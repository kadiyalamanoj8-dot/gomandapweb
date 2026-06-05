import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EVENT_TYPES } from '../../data/mockData';
import CustomDropdown from '../ui/CustomDropdown';

const EVENT_CATEGORY_MAP = {
  'Pelli / Shaadi (The Grand Wedding)': ['Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 'Photography & Videography', 'Makeup Artists (MUA)'],
  'Engagement / Nishchithartham': ['Banquet Halls', 'Party & Mini Halls', 'Stage & Venue Decor', 'Photography & Videography', 'Makeup Artists (MUA)'],
  'Sangeet & Mehendi Night': ['Open Lawns & Farmhouses', 'Party & Mini Halls', 'Mehndi Designers', 'DJs & Sound Systems', 'Photography & Videography'],
  'Reception': ['Banquet Halls', '5-Star Hotels', 'Stage & Venue Decor', 'Catering Service', 'Live Musicians / Band Baaja'],
  'Half-Saree / Dhoti Functions': ['Party & Mini Halls', 'Temples & Ashrams', 'Catering Service', 'Photography & Videography', 'Makeup Artists (MUA)'],
  'Cradle Ceremony / Barasala': ['Party & Mini Halls', 'Catering Service', 'Photography & Videography', 'Event Planners'],
  'Birthday Parties & Anniversaries': ['Party & Mini Halls', 'Open Lawns & Farmhouses', 'Catering Service', 'Stage & Venue Decor', 'DJs & Sound Systems']
};

const EVENT_MANDAP_MAP = {
  'Pelli / Shaadi (The Grand Wedding)': '/images/.webp',
  'Engagement / Nishchithartham': '/images/.webp',
  'Sangeet & Mehendi Night': '/images/.webp',
  'Reception': '/images/.webp',
  'Half-Saree / Dhoti Functions': '/images/.webp',
  'Cradle Ceremony / Barasala': '/images/.webp',
  'Birthday Parties & Anniversaries': '/images/.webp'
};



const HeroParallax = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Location Autocomplete State
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3 || selectedLocation?.display_name.includes(locationQuery)) {
        setLocationResults([]);
        return;
    }
    const timer = setTimeout(async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=in&limit=5`);
            const data = await res.json();
            setLocationResults(data);
        } catch (e) {
            console.error(e);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery, selectedLocation]);

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.display_name.split(',')[0]);
    setLocationResults([]);
  };

  const handleAutoLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
            const data = await res.json();
            const locName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state_district || "Current Location";
            setSelectedLocation({
                lat: latitude,
                lon: longitude,
                display_name: data.display_name
            });
            setLocationQuery(locName);
            setLocationResults([]);
        } catch (error) {
            console.error("Error with reverse geocoding:", error);
            alert("Could not fetch location details.");
        }
      }, (error) => {
          alert("Please allow location access to use this feature.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = () => {
    // Default to the first category if none selected but an event is chosen
    let searchCategory = selectedCategory;
    if (!searchCategory && eventType && EVENT_CATEGORY_MAP[eventType]) {
        searchCategory = EVENT_CATEGORY_MAP[eventType][0];
    } else if (!searchCategory) {
        searchCategory = 'Banquet Halls'; // Fallback
    }

    let url = `/search?category=${encodeURIComponent(searchCategory)}`;
    if (selectedLocation) {
        url += `&lat=${selectedLocation.lat}&lng=${selectedLocation.lon}&locName=${encodeURIComponent(selectedLocation.display_name.split(',')[0])}`;
    }
    navigate(url);
  };

  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs
  const springConfig = { damping: 50, stiffness: 100, mass: 2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  
  // Parallax Transforms
  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const midX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const midY = useTransform(smoothY, [-1, 1], [-25, 25]);

  const frontX = useTransform(smoothX, [-1, 1], [-50, 50]);
  const frontY = useTransform(smoothY, [-1, 1], [-50, 50]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 2; 
      const y = (e.clientY / clientHeight - 0.5) * 2; 
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleOrientation = (e) => {
      if (!e.gamma || !e.beta) return;
      const x = Math.max(-1, Math.min(1, e.gamma / 45));
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [mouseX, mouseY]);

  const currentMandap = EVENT_MANDAP_MAP[eventType] || '/images/.webp';

  return (
    // FIX Z-INDEX & CLIPPING: Outer wrapper does NOT have overflow-hidden.
    // It provides a high z-index (z-40) to ensure dropdowns overlap sections below it.
    <div className="relative w-full h-screen min-h-[600px] md:min-h-[700px] z-40 select-none">
      
      {/* BACKGROUND 3D CONTAINER: This isolates overflow-hidden to just the parallax art */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0"
        style={{ perspective: '1200px' }}
      >
        <motion.div 
          animate={{ translateZ: 400 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        >
          {/* Layer 1: Background Temple (Z: -600) */}
          <motion.div style={{ x: bgX, y: bgY, translateZ: -600, scale: 2, willChange: 'transform' }} className="absolute inset-[-10%] z-0">
            <img src="/images/.webp" fetchPriority="high" decoding="async" alt="Background" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
          </motion.div>

          {/* Layer 2: Dynamic Mandap Frame (Z: -100) */}
          <motion.div style={{ x: midX, y: midY, translateZ: -100, scale: 1.2, willChange: 'transform' }} className="absolute inset-0 z-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentMandap}
                src={currentMandap} 
                fetchPriority="high" 
                decoding="async" 
                alt="Mandap" 
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute w-[100vw] md:w-[90vw] h-[80vh] md:h-[90vh] object-contain mix-blend-screen opacity-100" 
              />
            </AnimatePresence>
          </motion.div>

          {/* Layer 3: The Couple Appears (Z: 100) */}
          <motion.div style={{ x: frontX, y: frontY, translateZ: 100, scale: 1.1, willChange: 'transform' }} className="absolute inset-[-5%] z-30 flex items-center justify-center pt-[15vh] md:pt-[10vh]">
            <img 
              src="/images/.webp" 
              fetchPriority="high" 
              decoding="async"
              alt="Couple" 
              className="w-[90vw] md:w-[60vw] max-h-[50vh] md:max-h-[60vh] object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
          </motion.div>

          {/* Floating Particles (Z: 150) */}
          <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none" style={{ transform: "translateZ(150px)" }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "120vh", x: Math.random() * window.innerWidth, rotate: 0 }}
                animate={{ y: "-20vh", x: `calc(${Math.random() * 100}vw)`, rotate: 360 }}
                transition={{ duration: Math.random() * 8 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                className={`absolute w-3 h-3 bg-gradient-to-br ${
                  i % 3 === 0 ? 'from-[#FFC107] to-white shadow-[0_0_15px_#FFC107]' : 
                  'from-[#E91E63] to-[#F48FB1] shadow-[0_0_10px_#E91E63] rounded-tr-full rounded-bl-full' 
                } blur-[1px] opacity-80`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* FOREGROUND SEARCH UI CONTAINER: Not clipped by overflow-hidden! */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 z-[200] flex flex-col items-center justify-center text-center px-4 pt-20 pointer-events-none"
      >
        <div className="w-full max-w-5xl pointer-events-auto">
          
          <h1 className="text-4xl md:text-[64px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-4 tracking-tight leading-[1.1]">
            Your Dream Event, <br className="hidden md:block" />Perfectly Orchestrated
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-medium">
            Discover India's finest banquet halls, lawns, and top-tier wedding professionals.
          </p>

          {/* iOS Style Floating Pill Search Bar */}
          <div className="w-full bg-black/30 backdrop-blur-3xl rounded-[32px] md:rounded-full p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 flex flex-col md:flex-row items-center gap-1 md:gap-0 mx-auto">
            
            {/* iOS Segment: Event Type */}
            <div className="flex-1 w-full md:w-auto relative group rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <div className="px-6 py-2 md:py-3 flex flex-col items-start w-full">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-0.5 ml-1">Event Type</span>
                <CustomDropdown
                  options={EVENT_TYPES}
                  value={eventType}
                  onChange={setEventType}
                  placeholder="What are you planning?"
                  variant="glass"
                  className="!px-1 !py-1 !min-h-0 !bg-transparent text-white"
                  dropdownClassName="mt-6 w-full !left-0 md:w-[350px] md:!left-1/2 md:-translate-x-1/2"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>

            {/* iOS Segment: Location */}
            <div className="flex-1 w-full md:w-auto relative group rounded-full hover:bg-white/10 transition-colors cursor-text">
              <div className="px-6 py-2 md:py-3 flex flex-col items-start w-full">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-0.5 ml-1">Location</span>
                <div className="flex items-center gap-2 px-1 py-1 w-full relative">
                  <MapPin size={20} className="text-white shrink-0" strokeWidth={2.5} />
                  <input 
                    type="text" 
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      if (selectedLocation) setSelectedLocation(null);
                    }}
                    placeholder="Where is it?" 
                    className="w-full bg-transparent text-white font-semibold text-[17px] tracking-tight focus:outline-none placeholder-white/50" 
                  />
                  
                  {/* Locate Me Button */}
                  <button onClick={handleAutoLocate} className="p-1.5 text-brand-primary hover:bg-white/10 rounded-full transition-colors group relative shrink-0" title="Use Current Location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>

                  {/* Autocomplete Dropdown */}
                  {locationResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-4 w-full md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-black/70 backdrop-blur-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[24px] overflow-hidden divide-y divide-white/10 z-[9999]">
                      {locationResults.map((loc, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleLocationSelect(loc)}
                          className="px-5 py-3.5 cursor-pointer flex flex-col gap-0.5 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-white font-bold text-[16px] tracking-tight">{loc.display_name.split(',')[0]}</span>
                          <span className="text-white/60 text-xs truncate font-medium">{loc.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>

            {/* iOS Segment: Dates & Button */}
            <div className="flex-1 w-full md:w-auto relative group rounded-[28px] md:rounded-full hover:bg-white/10 transition-colors cursor-text flex items-center justify-between pr-2">
              <div className="px-6 py-2 md:py-3 flex flex-col items-start w-full">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-0.5 ml-1">Dates</span>
                <div className="flex items-center gap-2 px-1 py-1 w-full">
                  <Calendar size={20} className="text-white shrink-0" strokeWidth={2.5} />
                  <input 
                    type="text" 
                    placeholder="When?" 
                    onFocus={(e) => e.target.type = 'date'} 
                    onBlur={(e) => e.target.type = 'text'} 
                    className="w-full bg-transparent text-white font-semibold text-[17px] tracking-tight focus:outline-none placeholder-white/50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                  />
                </div>
              </div>
              
              {/* iOS Massive Search Button */}
              <button onClick={handleSearch} className="bg-brand-primary text-white rounded-full h-14 w-14 md:w-auto md:px-8 flex items-center justify-center gap-2 font-bold text-[17px] hover:scale-105 hover:bg-brand-secondary shadow-[0_8px_20px_rgba(255,193,7,0.4)] transition-all shrink-0">
                <Search size={22} strokeWidth={3} />
                <span className="hidden md:block">Search</span>
              </button>
            </div>

          </div>

          {/* Dynamic Category Chips Row */}
          {eventType && EVENT_CATEGORY_MAP[eventType] && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
            >
              {EVENT_CATEGORY_MAP[eventType].map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm md:text-base font-bold transition-all shadow-sm flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-brand-primary text-white border-none shadow-[0_4px_12px_rgba(239,68,68,0.4)]' 
                        : 'bg-black/40 backdrop-blur-md text-white/80 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default HeroParallax;
