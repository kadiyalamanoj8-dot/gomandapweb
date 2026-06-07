import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, m, LazyMotion, domAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Search, MapPin, Calendar, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EVENT_TYPES } from '../../data/mockData';
import ApplePicker from '../ui/ApplePicker';
import GlassDatePicker from '../ui/GlassDatePicker';

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
  'Pelli / Shaadi (The Grand Wedding)': '/images/temple_mandap.webp',
  'Engagement / Nishchithartham': '/images/royal_arch_mandap.webp',
  'Sangeet & Mehendi Night': '/images/neon_sangeet_stage.webp',
  'Reception': '/images/royal_arch_mandap.webp',
  'Half-Saree / Dhoti Functions': '/images/temple_mandap.webp',
  'Cradle Ceremony / Barasala': '/images/modern_gazebo.webp',
  'Birthday Parties & Anniversaries': '/images/modern_gazebo.webp'
};



const HeroParallax = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [isEventPickerOpen, setIsEventPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  
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

  // Smooth springs - highly responsive for mobile gyro
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  
  // Parallax Transforms
  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const midX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const midY = useTransform(smoothY, [-1, 1], [-25, 25]);

  const frontX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const frontY = useTransform(smoothY, [-1, 1], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 2; 
      const y = (e.clientY / clientHeight - 0.5) * 2; 
      mouseX.set(x);
      mouseY.set(y);
    };

    // Industry standard gyroscope handler with orientation compensation
    let rAF;
    const handleOrientation = (e) => {
      if (!e.gamma || !e.beta) return;
      
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        let x = 0;
        let y = 0;
        
        // Compensate for device orientation (portrait vs landscape)
        const orientation = window.orientation || 0;
        
        if (orientation === 90) {
          x = e.beta;
          y = -e.gamma;
        } else if (orientation === -90) {
          x = -e.beta;
          y = e.gamma;
        } else {
          x = e.gamma;
          // In portrait, the phone is usually held at a 45 degree angle. Center around 45.
          y = e.beta - 45;
        }

        // Clamp values and normalize to [-1, 1]
        // Lock horizontal almost entirely (divide by 240) and enhance vertical (divide by 30)
        const normalizedX = Math.max(-1, Math.min(1, x / 240));
        const normalizedY = Math.max(-1, Math.min(1, y / 30));
        
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [mouseX, mouseY]);

  const currentMandap = EVENT_MANDAP_MAP[eventType] || '/images/temple_mandap.webp';

  const background3D = useMemo(() => (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0"
    >
      {/* Layer 1: Background Temple — plain absolute fill, NO 3D translateZ (that shrinks it) */}
      <m.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-[-10%] w-[120%] h-[120%] z-0"
      >
        <img
          src="/images/temple_background.webp"
          fetchPriority="high"
          decoding="async"
          alt="Background"
          className="w-full h-full object-cover opacity-80"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
      </m.div>

      {/* 3D Perspective container for mandap + couple only */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ perspective: '1200px' }}
      >
        <m.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {/* Layer 2: Dynamic Mandap Frame */}
          <m.div style={{ x: midX, y: midY, translateZ: 0, willChange: 'transform' }} className="absolute inset-0 z-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <m.img 
                key={currentMandap}
                src={currentMandap} 
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute w-[110vw] md:w-[100vw] h-[90vh] md:h-[100vh] object-contain mix-blend-screen opacity-100" 
                style={{ willChange: 'transform, opacity, filter' }}
              />
            </AnimatePresence>
          </m.div>

          {/* Layer 3: The Couple */}
          <m.div style={{ x: frontX, y: frontY, translateZ: 80, scale: 1.05, willChange: 'transform' }} className="absolute inset-0 z-30 flex items-center justify-center pt-[10vh] md:pt-[5vh]">
            <img src="/images/couple_transparent.webp" fetchPriority="high" alt="Couple" className="w-[100vw] md:w-[70vw] max-h-[65vh] md:max-h-[70vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(255,193,7,0.6)]" style={{ willChange: 'transform' }} />
          </m.div>

          {/* Floating Particles */}
          <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none" style={{ transform: "translateZ(150px)" }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <m.div
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
        </m.div>
      </div>
    </div>
  ), [currentMandap, rotateX, rotateY, bgX, bgY, midX, midY, frontX, frontY]);


  return (
    <LazyMotion features={domAnimation}>
      <div className="relative w-full h-screen h-[100dvh] min-h-[600px] z-40 focus-within:z-[60] select-none overflow-hidden">
      
      {background3D}

      {/* FOREGROUND SEARCH UI CONTAINER: Not clipped by overflow-hidden! */}
      <m.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 z-[200] flex flex-col items-center justify-center text-center px-4 pt-20 pointer-events-none"
      >
        <div className="w-full max-w-5xl pointer-events-auto">
          
          <h1 
            className="text-4xl md:text-[64px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-4 tracking-tight leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: t('hero_title') }}
          />
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-medium">
            {t('hero_desc')}
          </p>

          {/* Liquid Glass Pill Search Bar */}
          <div className="w-full bg-white/5 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.5)] border border-white/30 border-t-white/50 rounded-[32px] md:rounded-full p-2.5 flex flex-col md:flex-row items-center gap-1 md:gap-0 mx-auto relative z-[200]">
                        {/* iOS Segment: Event Type */}
              <div className="flex-1 w-full md:w-auto relative group rounded-[32px] md:rounded-full hover:bg-white/5 transition-colors cursor-pointer pt-2 md:pt-3 pb-1">
                <div className="px-6 flex flex-col items-start w-full">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-0 ml-1">{t('search_event_type')}</span>
                  <div className="w-full -ml-3 z-[300]">
                    <ApplePicker
                      options={EVENT_TYPES.map(tOption => ({label: tOption, value: tOption}))}
                      value={eventType}
                      onChange={setEventType}
                      placeholder={t('search_event_placeholder')}
                      className="w-full"
                      buttonClassName="!bg-transparent !border-none !shadow-none !px-4 !py-1 w-full text-[17px] font-semibold text-white tracking-tight"
                    />
                  </div>
                </div>
              </div>

            <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>

            {/* iOS Segment: Location */}
            <div className="flex-1 w-full md:w-auto relative group rounded-full hover:bg-white/5 transition-colors cursor-text">
              <div className="px-6 py-2 md:py-3 flex flex-col items-start w-full">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_location')}</span>
                <div className="flex items-center gap-2 px-1 py-1 w-full relative">
                  <MapPin size={18} strokeWidth={2} className="text-white/60 shrink-0" />
                  <input 
                    type="text" 
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      if (selectedLocation) setSelectedLocation(null);
                    }}
                    placeholder={t('search_location_placeholder')} 
                    className="w-full bg-transparent text-white font-semibold text-[17px] tracking-tight focus:outline-none placeholder-white/40" 
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
                    <div className="absolute top-full left-0 mt-3 w-full md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-black/20 backdrop-blur-xl border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.25),0_30px_60px_rgba(0,0,0,0.7)] rounded-[24px] overflow-hidden z-[9999]">
                      {locationResults.map((loc, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleLocationSelect(loc)}
                          className="px-5 py-3.5 cursor-pointer flex items-center gap-3 hover:bg-white/10 active:bg-white/20 transition-colors border-b border-white/10 last:border-b-0"
                        >
                          <MapPin size={15} className="text-white/50 shrink-0" />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-white font-bold text-[15px] tracking-tight truncate">{loc.display_name.split(',')[0]}</span>
                            <span className="text-white/50 text-[11px] truncate font-medium">{loc.display_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>

            {/* iOS Segment: Dates & Button */}
            <div className="flex-1 w-full md:w-auto relative group rounded-[28px] md:rounded-full hover:bg-white/5 transition-colors cursor-text flex items-center justify-between pr-2">
              <div className="px-6 py-2 md:py-3 flex flex-col items-start w-full">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_dates')}</span>
                <div className="px-1 py-1 w-full">
                  <GlassDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="When?"
                    variant="glass"
                  />
                </div>
              </div>
              
              {/* Search Button — sole brand red accent */}
                <button onClick={handleSearch} className="btn-liquid text-white rounded-full h-14 w-14 md:w-auto md:px-7 flex items-center justify-center gap-2 font-bold text-[16px] shrink-0 mr-1 md:mr-0">
                  <Search size={22} strokeWidth={3} />
                  <span className="hidden md:block">{t('search_btn')}</span>
                </button>
            </div>

          </div>

        </div>
      </m.div>
    </div>
    </LazyMotion>
  );
};

export default HeroParallax;
