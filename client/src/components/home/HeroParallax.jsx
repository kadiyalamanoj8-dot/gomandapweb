import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, m, LazyMotion, domAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Search, MapPin, Calendar, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EVENT_TYPES } from '../../data/mockData';
import ApplePicker from '../ui/ApplePicker';
import AppleDateTimePicker from '../ui/AppleDateTimePicker';
import HeroMarquee from './HeroMarquee';

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
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [isEventPickerOpen, setIsEventPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [clientUI, setClientUI] = useState({ 
    use3DCarousel: true, 
    carouselImages: [],
    marqueeWidth: '100vw',
    marqueeHeight: '100%',
    marqueePositionY: '0px',
    marqueeSpeed: 3
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com'}/api/settings`);
        const data = await res.json();
        if (data.success && data.data?.clientUI) {
          setClientUI(data.data.clientUI);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    return () => observer.disconnect();
  }, []);
  
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
    if (!isHeroVisible) return;

    const handleMouseMove = (e) => {
      if (isMobile) return; // Ignore mouse on mobile
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 2; 
      const y = (e.clientY / clientHeight - 0.5) * 2; 
      mouseX.set(x);
      mouseY.set(y);
    };

    // Baseline tracking for auto-centering gyro
    let rAF;
    let baselineX = 0;
    let baselineY = 0;
    let hasBaseline = false;

    const handleOrientation = (e) => {
      if (!e.gamma || !e.beta) return;
      
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        let x = 0;
        let y = 0;
        
        const orientation = window.orientation || 0;
        
        if (orientation === 90) {
          x = e.beta;
          y = -e.gamma;
        } else if (orientation === -90) {
          x = -e.beta;
          y = e.gamma;
        } else {
          x = e.gamma;
          y = e.beta - 45;
        }

        if (!hasBaseline) {
          baselineX = x;
          baselineY = y;
          hasBaseline = true;
        }

        // Slowly pull the baseline towards the current value (auto-centering)
        baselineX += (x - baselineX) * 0.03;
        baselineY += (y - baselineY) * 0.03;

        const deltaX = x - baselineX;
        const deltaY = y - baselineY;

        // Very light moving on mobile (scale 0.2)
        const mobileScale = isMobile ? 0.2 : 1;

        const normalizedX = Math.max(-1, Math.min(1, deltaX / 45)) * mobileScale;
        const normalizedY = Math.max(-1, Math.min(1, deltaY / 45)) * mobileScale;
        
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
  }, [mouseX, mouseY, isHeroVisible, isMobile]);

  const background3D = useMemo(() => (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0"
    >
      {/* Layer 1: Background Temple — plain absolute fill, NO 3D translateZ (that shrinks it) */}
      <m.div
        style={{ x: isMobile ? 0 : bgX, y: isMobile ? 0 : bgY }}
        className="absolute inset-[-10%] w-[120%] h-[120%] z-0"
      >
        <img
          src="/images/temple_background.webp"
          fetchPriority="high"
          decoding="async"
          alt="Temple Background"
          className="w-full h-full object-cover opacity-80"
          style={{ willChange: isMobile ? 'auto' : 'transform' }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
      </m.div>

      {/* 3D Perspective container for mandap + couple only */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ perspective: '1200px' }}
      >
        <m.div
          style={{ 
            rotateX: rotateX, 
            rotateY: rotateY, 
            transformStyle: "preserve-3d" 
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {/* Layer 2: Dynamic Stop-and-Go Marquee */}
          {clientUI.use3DCarousel && (
            <m.div 
              style={{ 
                x: midX, 
                y: midY, 
                translateZ: 0, 
                willChange: isMobile ? 'auto' : 'transform' 
              }} 
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <HeroMarquee 
                images={clientUI.carouselImages} 
                width={clientUI.marqueeWidth}
                height={clientUI.marqueeHeight}
                positionY={clientUI.marqueePositionY}
                speed={clientUI.marqueeSpeed}
                isMobile={isMobile}
              />
            </m.div>
          )}

          {/* Layer 2.5: Hero Text (Behind the Couple) */}
          <m.div 
            style={{ 
              x: midX, 
              y: midY, 
              translateZ: 30, 
              willChange: isMobile ? 'auto' : 'transform' 
            }} 
            className="absolute inset-0 z-[25] flex flex-col items-center justify-center text-center px-3 sm:px-4 pt-16 sm:pt-20 pointer-events-none"
          >
            <m.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full max-w-5xl pointer-events-none mt-[-150px] sm:mt-[-200px]"
            >
              <h1 
                className="text-2xl sm:text-4xl md:text-[64px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-2 sm:mb-4 tracking-tight leading-[1.15] sm:leading-[1.2] md:leading-[1.35]"
                dangerouslySetInnerHTML={{ __html: t('hero_title') }}
              />
              <p className="text-sm sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-medium px-2">
                {t('hero_desc')}
              </p>
            </m.div>
          </m.div>

          {/* Layer 3: The Couple */}
          <m.div 
            style={{ 
              x: frontX, 
              y: frontY, 
              translateZ: 80, 
              scale: 1.05, 
              willChange: isMobile ? 'auto' : 'transform' 
            }} 
            className="absolute inset-0 z-30 flex items-center justify-center pt-[15vh] sm:pt-[10vh] md:pt-[5vh]"
          >
            <img 
              src="/images/couple_transparent.webp" 
              fetchPriority="high" 
              alt="Couple"
              className="w-[90vw] sm:w-[80vw] md:w-[70vw] max-h-[60vh] md:max-h-[70vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(255,193,7,0.6)] pointer-events-none" 
              style={{ willChange: isMobile ? 'auto' : 'transform' }}
              loading="eager"
            />
          </m.div>
        </m.div>
      </div>
    </div>
  ), [rotateX, rotateY, bgX, bgY, midX, midY, frontX, frontY, isMobile, clientUI]);


  return (
    <LazyMotion features={domAnimation}>
      <div 
        ref={heroRef}
        className="relative w-full h-screen h-[100dvh] min-h-[600px] bg-black z-40 focus-within:z-[60] select-none overflow-hidden"
      >
      
      {background3D}

      {/* FOREGROUND SEARCH UI CONTAINER: Not clipped by overflow-hidden! */}
      <m.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 z-[200] flex flex-col items-center justify-center px-3 sm:px-4 pointer-events-none mt-[100px] sm:mt-[150px]"
      >
        <div className="w-full max-w-5xl pointer-events-auto">

          {/* Liquid Glass Pill Search Bar */}
          <div className="w-full bg-white/5 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.5)] border border-white/30 border-t-white/50 rounded-[24px] md:rounded-full p-1.5 sm:p-2.5 flex flex-col md:flex-row items-center gap-1 md:gap-0 mx-auto relative z-[200]">
                        {/* iOS Segment: Event Type */}
              <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-pointer py-2 md:pt-3 md:pb-1">
                <div className="px-3 sm:px-6 flex flex-col items-start w-full">
                  <span className="text-[8px] sm:text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_event_type')}</span>
                  <div className="w-full z-[300]">
                    <ApplePicker
                      options={EVENT_TYPES.map(tOption => ({label: tOption, value: tOption}))}
                      value={eventType}
                      onChange={setEventType}
                      placeholder={t('search_event_placeholder')}
                      icon={PartyPopper}
                      position="top"
                      className="w-full"
                      buttonClassName="!bg-transparent !border-none !shadow-none !px-1 !py-1 w-full text-[17px] font-semibold text-[#FFD700] tracking-tight"
                    />
                  </div>
                </div>
              </div>

            <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>

            {/* iOS Segment: Location */}
            <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text py-2 md:py-3">
              <div className="px-3 sm:px-6 flex flex-col items-start w-full">
                <span className="text-[8px] sm:text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_location')}</span>
                <div className="flex items-center gap-1 sm:gap-2 px-1 py-1 w-full relative">
                  <MapPin size={16} strokeWidth={2} className="text-[#FFD700]/80 shrink-0 sm:size-[18px]" />
                  <input 
                    type="text" 
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      if (selectedLocation) setSelectedLocation(null);
                    }}
                    placeholder={t('search_location_placeholder')} 
                    className="w-full bg-transparent text-[#FFD700] font-semibold text-[14px] sm:text-[17px] tracking-tight focus:outline-none placeholder-[#FFD700]/50" 
                  />
                  
                  {/* Locate Me Button */}
                  <button onClick={handleAutoLocate} className="p-1 sm:p-1.5 text-brand-primary hover:bg-white/10 rounded-full transition-colors group relative shrink-0 touch-manipulation" title="Use Current Location" aria-label="Use current location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 sm:w-[18px] sm:h-[18px]">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  {/* Autocomplete Dropdown */}
                  {locationResults.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 sm:mb-3 w-full md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-black/20 backdrop-blur-xl border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.25),0_30px_60px_rgba(0,0,0,0.7)] rounded-[20px] md:rounded-[24px] overflow-hidden z-[9999] max-h-[40vh] sm:max-h-[60vh] overflow-y-auto">
                      {locationResults.map((loc, i) => (
                        <div 
                           key={i} 
                          onClick={() => handleLocationSelect(loc)}
                          className="px-3 sm:px-5 py-2 sm:py-3.5 cursor-pointer flex items-center gap-2 sm:gap-3 hover:bg-white/10 active:bg-white/20 transition-colors border-b border-white/10 last:border-b-0 touch-manipulation"
                        >
                          <MapPin size={14} className="text-white/50 shrink-0 sm:size-[15px]" />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-white font-bold text-[13px] sm:text-[15px] tracking-tight truncate">{loc.display_name.split(',')[0]}</span>
                            <span className="text-white/50 text-[10px] sm:text-[11px] truncate font-medium">{loc.display_name}</span>
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
            <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text flex items-center justify-between pr-1 sm:pr-2 py-2 md:py-3">
              <div className="px-3 sm:px-6 flex flex-col items-start w-full">
                <span className="text-[8px] sm:text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_dates')}</span>
                <div className="px-1 py-1 w-full">
                  <AppleDateTimePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="When?"
                    theme="dark"
                    position="top"
                  />
                </div>
              </div>
              
              {/* Search Button — sole brand red accent */}
                <button 
                  onClick={handleSearch} 
                  className="btn-liquid text-white rounded-full h-12 sm:h-14 w-12 sm:w-14 md:w-auto md:px-6 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-[14px] sm:text-[16px] shrink-0 mr-0 sm:mr-1 md:mr-0 touch-manipulation"
                  aria-label="Search"
                >
                  <Search size={18} strokeWidth={3} className="sm:size-[22px]" />
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
