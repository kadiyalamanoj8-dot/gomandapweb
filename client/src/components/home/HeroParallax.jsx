import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, m, LazyMotion, domAnimation, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Search, MapPin, Calendar, PartyPopper, X, ShieldCheck, Lock, LayoutDashboard, Camera, Sparkles, Utensils, Music, Car, Brush, Building, Tent, Star } from 'lucide-react';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EVENT_TYPES } from '../../data/mockData';
import { usePermissions } from '../../context/PermissionContext';
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
  'Birthday Parties & Anniversaries': ['Party & Mini Halls', 'Open Lawns & Farmhouses', 'Catering Service', 'Stage & Venue Decor', 'DJs & Sound Systems'],
  'Corporate Events & MICE': ['5-Star Hotels', 'Resorts & Destination Venues', 'Banquet Halls', 'Open Lawns & Farmhouses', 'Stage & Venue Decor', 'Catering Service', 'Event Planners', 'Photography & Videography', 'DJs & Sound Systems', 'Cars & Buses (Travel)']
};

const CATEGORY_ICONS = {
  'Banquet Halls': Building,
  'Kalyana Mandapams': Building,
  'Open Lawns & Farmhouses': Tent,
  'Photography & Videography': Camera,
  'Photographers': Camera,
  'Makeup Artists (MUA)': Brush,
  'Makeup Artists': Brush,
  'Party & Mini Halls': PartyPopper,
  'Stage & Venue Decor': Sparkles,
  'Decorators': Sparkles,
  'Mehndi Designers': Brush,
  'DJs & Sound Systems': Music,
  '5-Star Hotels': Star,
  'Catering Service': Utensils,
  'Caterers': Utensils,
  'Live Musicians / Band Baaja': Music,
  'Temples & Ashrams': Building,
  'Event Planners': Calendar,
  'Resorts & Destination Venues': Tent,
  'Cars & Buses (Travel)': Car
};

const HeroParallax = () => {
  const { t } = useTranslation();
  const { requestPermission } = usePermissions();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState(['Banquet Halls', 'Photographers', 'Caterers', 'Decorators', 'Makeup Artists']);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [activeBadgeIndex, setActiveBadgeIndex] = useState(0);
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
        const res = await fetch(`${API_URL}/api/settings`);
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.clientUI) setClientUI(data.data.clientUI);
          if (data.data.eventTypes) setClientUI(prev => ({ ...prev, eventTypes: data.data.eventTypes }));
          // Generate exhaustive list of categories and venue types
          const allCats = [
            'Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 
            'Photography & Videography', 'Makeup Artists (MUA)', 'Party & Mini Halls', 
            'Stage & Venue Decor', 'Mehndi Designers', 'DJs & Sound Systems', 
            '5-Star Hotels', 'Catering Service', 'Live Musicians / Band Baaja', 
            'Temples & Ashrams', 'Event Planners', 'Resorts & Destination Venues', 
            'Cars & Buses (Travel)'
          ];
          
          if (data.data.disabledCategories) {
            const active = allCats.filter(c => !data.data.disabledCategories.includes(c));
            if (active.length > 0) setActiveCategories(active);
            else setActiveCategories(allCats);
          } else {
            setActiveCategories(allCats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) return;
    const interval = setInterval(() => {
      setCategoryIndex(prev => (prev + 1) % activeCategories.length);
    }, 3000); // Exactly 3 seconds
    return () => clearInterval(interval);
  }, [activeCategories.length]);

  useEffect(() => {
    const badgeInterval = setInterval(() => {
      setActiveBadgeIndex(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(badgeInterval);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cinematic, deep luxury gradients instead of flat hex colors
  const cinematicColors = [
    'linear-gradient(to right, #D4AF37, #FFD700, #D4AF37)', // Deep Gold
    'linear-gradient(to right, #E6E6FA, #FFFFFF, #E6E6FA)', // Pearl White
    'linear-gradient(to right, #FFB6C1, #FFE4E1, #FFB6C1)', // Rose Quartz
    'linear-gradient(to right, #F7E7CE, #FFFFFF, #F7E7CE)', // Champagne
  ];

  // Removed floatingParticles block

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsHeroVisible(entry.isIntersecting), { threshold: 0.05 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);
  
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3 || selectedLocation?.description?.includes(locationQuery)) {
        setLocationResults([]);
        return;
    }
    const timer = setTimeout(async () => {
        try {
            const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
            const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(locationQuery)}&api_key=${apiKey}`);
            const data = await res.json();
            if (data.predictions) {
              setLocationResults(data.predictions);
            }
        } catch (e) {
            console.error(e);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery, selectedLocation]);

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.structured_formatting?.main_text || loc.description.split(',')[0]);
    setLocationResults([]);
  };

  const handleAutoLocate = async () => {
    if ("geolocation" in navigator) {
      // Show our beautiful Gomandap UI modal first
      const granted = await requestPermission('location');
      if (!granted) return; // User clicked "Not Now" in our UI, so we stop here and avoid permanently blocking it in the browser

      // Only trigger the ugly browser prompt if they clicked "Allow" in our UI
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
            const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const locName = result.address_components?.find(c => c.types.includes('locality'))?.short_name || result.name || "Current Location";
              setSelectedLocation({ description: result.formatted_address });
              setLocationQuery(locName);
            }
            setLocationResults([]);
        } catch (error) {
            console.error(error);
        }
      }, () => alert("Please allow location access to use this feature."));
    } else alert("Geolocation is not supported by your browser.");
  };

  const handleSearch = () => {
    let searchCategory = selectedCategory;
    if (!searchCategory && eventType && EVENT_CATEGORY_MAP[eventType]) searchCategory = EVENT_CATEGORY_MAP[eventType][0];
    else if (!searchCategory) searchCategory = 'Banquet Halls';

    let url = `/search?category=${encodeURIComponent(searchCategory)}`;
    if (selectedLocation) url += `&lat=${selectedLocation.lat}&lng=${selectedLocation.lon}&locName=${encodeURIComponent(selectedLocation.display_name.split(',')[0])}`;
    if (capacity) url += `&capacity=${encodeURIComponent(capacity)}`;
    setIsMobileSearchOpen(false);
    navigate(url);
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }; // Fast, smooth, no bounce
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [-5, 5]); // Vertical gyro
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]); // Horizontal gyro
  
  const { scrollY } = useScroll();
  const bgScrollY = useTransform(scrollY, [0, 1000], [0, 400]);
  const textScrollY = useTransform(scrollY, [0, 1000], [0, 200]);
  const coupleScrollY = useTransform(scrollY, [0, 1000], [0, -100]);

  useEffect(() => {
    if (!isHeroVisible) return;
    let rAF;
    let idleTimeout;

    const resetToCenter = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    const handleMouseMove = (e) => {
      if (rAF) cancelAnimationFrame(rAF);
      clearTimeout(idleTimeout);
      rAF = requestAnimationFrame(() => {
        // Normalize mouse coordinates to [-1, 1] relative to center
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        const desktopScale = isMobile ? 0 : 1;
        mouseX.set(x * desktopScale);
        mouseY.set(y * desktopScale);
      });
      // Very quick rubber band effect on desktop
      idleTimeout = setTimeout(resetToCenter, 200);
    };

    let baselineX = 0, baselineY = 0, hasBaseline = false;
    const handleOrientation = (e) => {
      if (!e.gamma || !e.beta) return;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        let x = 0, y = 0;
        const orientation = window.orientation || 0;
        if (orientation === 90) { x = e.beta; y = -e.gamma; } 
        else if (orientation === -90) { x = -e.beta; y = e.gamma; } 
        else { x = e.gamma; y = e.beta - 45; }

        if (!hasBaseline) { baselineX = x; baselineY = y; hasBaseline = true; }
        // Fast decay causes a quick rubber band effect to center on mobile
        baselineX += (x - baselineX) * 0.15;
        baselineY += (y - baselineY) * 0.15;
        const deltaX = x - baselineX;
        const deltaY = y - baselineY;
        const mobileScale = isMobile ? 0.3 : 1; 
        mouseX.set(Math.max(-1, Math.min(1, deltaX / 30)) * mobileScale);
        mouseY.set(Math.max(-1, Math.min(1, deltaY / 30)) * mobileScale);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', resetToCenter);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', resetToCenter);
      window.removeEventListener('deviceorientation', handleOrientation);
      clearTimeout(idleTimeout);
      if (rAF) cancelAnimationFrame(rAF);
    };
  }, [mouseX, mouseY, isHeroVisible, isMobile]);

  const searchContent = (
    <>
      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-pointer py-2 md:pt-3 md:pb-1">
        <div className="px-3 sm:px-6 flex flex-col items-start w-full">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_event_type')}</span>
          <div className="w-full z-[300]">
            <ApplePicker
              options={(clientUI.eventTypes || EVENT_TYPES).map(tOption => ({label: tOption, value: tOption}))}
              value={eventType}
              onChange={setEventType}
              placeholder={t('search_event_placeholder')}
              icon={PartyPopper}
              position="bottom"
              className="w-full"
              buttonClassName="!bg-transparent !border-none !shadow-none !px-1 !py-1 w-full text-[17px] font-semibold text-[#FFD700] tracking-tight"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>
      <div className="block md:hidden h-px w-[90%] bg-white/10 mx-auto my-2"></div>

      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text py-2 md:py-3">
        <div className="px-3 sm:px-6 flex flex-col items-start w-full">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_location')}</span>
          <div className="flex items-center gap-1 sm:gap-2 px-1 py-1 w-full relative">
            <MapPin size={18} strokeWidth={2} className="text-[#FFD700]/80 shrink-0" />
            <input 
              type="text" 
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                if (selectedLocation) setSelectedLocation(null);
              }}
              placeholder={t('search_location_placeholder')} 
              className="w-full bg-transparent text-[#FFD700] font-semibold text-[17px] tracking-tight focus:outline-none placeholder-[#FFD700]/50" 
            />
            <button onClick={handleAutoLocate} className="p-1.5 text-brand-primary hover:bg-white/10 rounded-full transition-colors group relative shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            {locationResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[20px] md:rounded-[24px] overflow-hidden z-[9999] max-h-[40vh] sm:max-h-[60vh] overflow-y-auto">
                {locationResults.map((loc, i) => (
                  <div key={i} onClick={() => handleLocationSelect(loc)} className="px-5 py-3.5 cursor-pointer flex items-center gap-3 hover:bg-white/10 active:bg-white/20 transition-colors border-b border-white/10 last:border-b-0">
                    <MapPin size={15} className="text-white/50 shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-white font-bold text-[15px] tracking-tight truncate">{loc.structured_formatting?.main_text || loc.description?.split(',')[0]}</span>
                      <span className="text-white/50 text-[11px] truncate font-medium">{loc.structured_formatting?.secondary_text || loc.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>
      <div className="block md:hidden h-px w-[90%] bg-white/10 mx-auto my-2"></div>

      {/* Capacity Block */}
      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text py-2 md:py-3">
        <div className="px-3 sm:px-6 flex flex-col items-start w-full">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">CAPACITY (GUESTS)</span>
          <div className="flex items-center gap-1 sm:gap-2 px-1 py-1 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFD700]/80 shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <input 
              type="number" 
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 300" 
              className="w-full bg-transparent text-[#FFD700] font-semibold text-[17px] tracking-tight focus:outline-none placeholder-[#FFD700]/50" 
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-white/20 mx-2"></div>
      <div className="block md:hidden h-px w-[90%] bg-white/10 mx-auto my-2"></div>

      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text flex items-center justify-between pl-3 sm:pl-6 pr-2 sm:pr-3 py-2 md:py-3">
        <div className="flex flex-col items-start w-full pr-2">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_dates')}</span>
          <div className="px-1 py-1 w-full">
            <AppleDateTimePicker value={selectedDate} onChange={setSelectedDate} placeholder="When?" theme="dark" position={isMobile ? "top" : "bottom"} />
          </div>
        </div>
        <button onClick={handleSearch} className="btn-liquid text-white rounded-full h-12 md:h-14 w-12 md:w-auto md:px-6 flex items-center justify-center gap-2 font-bold text-[16px] shrink-0 touch-manipulation">
          <Search size={22} strokeWidth={3} />
          <span className="hidden md:block">{t('search_btn')}</span>
        </button>
      </div>
    </>
  );

  return (
    <LazyMotion features={domAnimation}>
      <div 
        ref={heroRef} 
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="relative w-full h-[100dvh] min-h-[600px] bg-[#0A0A0A] z-[60] select-none overflow-hidden"
      >

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
      
        {/* Layer 1: Deep Background */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 perspective-[1200px]">
          <m.div style={{ translateZ: -250, y: bgScrollY }} className="absolute inset-[-15%] w-[130%] h-[130%] z-0 scale-[1.3] origin-center">
            <img src="/images/south_indian_mandap.webp" alt="South Indian Mandap Background" className="w-full h-full object-cover opacity-100" loading="eager" fetchpriority="high" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0A0A0A] z-10" />
          </m.div>

          <m.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-0 w-full h-full flex items-center justify-center">

            {/* Layer 4: Text */}
            <m.div style={{ translateZ: 80, y: textScrollY }} className="absolute inset-0 top-[-25%] md:top-[-25%] left-0 right-0 w-full z-[40] flex flex-col items-center justify-center text-center px-4 pointer-events-none origin-center">
              <div className="relative w-full h-[200px] flex flex-col items-center justify-center">
                <m.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute flex flex-col items-center justify-center w-full"
                >
                  <div className="mb-4 md:mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <div className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">India's First App for Instant Bookings</span>
                  </div>
                  <h1 
                    className="text-5xl md:text-[72px] lg:text-[80px] font-['Playfair_Display'] font-black drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] mb-4 tracking-tight leading-[1.1] text-transparent bg-clip-text" 
                    style={{ backgroundImage: cinematicColors[0], paddingRight: '15px' }}
                  >
                    Elevating Every Grand <br/> Celebration.
                  </h1>
                  <p className="text-[10px] md:text-[13px] font-['Montserrat'] text-[#FFD700] max-w-4xl mx-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-black tracking-[0.3em] uppercase mt-2 mb-4">
                    Weddings • Engagements • Birthdays • Corporate Events
                  </p>
                  <p className="text-xs md:text-lg font-['Montserrat'] text-white/90 max-w-4xl mx-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-medium tracking-[0.2em] uppercase">
                    Book India's Most Premium Event Vendors
                  </p>
                </m.div>
              </div>
            </m.div>

            {/* Layer 5: The Couple */}
            <m.div style={{ translateZ: 250, scale: 0.9, y: coupleScrollY }} className="absolute inset-0 left-0 right-0 z-30 flex items-center justify-center pt-[20vh] md:pt-[15vh] origin-center">
              <img src="/images/couple_transparent.webp" alt="Couple" className="w-[85vw] md:w-[70vw] max-h-[65vh] md:max-h-[70vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(255,193,7,0.6)] pointer-events-none" />
            </m.div>
          </m.div>
        </div>
        </div>

        {/* Desktop UI: Centered Glass Pill */}
        <div className="hidden md:flex absolute top-[65%] w-full z-[200] flex-col items-center justify-start px-4 pointer-events-none">
          <div className="w-full max-w-5xl pointer-events-auto bg-white/10 backdrop-blur-xl shadow-[inset_0_2px_15px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.6)] border border-white/20 border-t-white/40 rounded-full p-2.5 flex flex-row items-center mx-auto transition-all duration-300 hover:shadow-[inset_0_2px_15px_rgba(255,255,255,0.5),0_30px_70px_rgba(0,0,0,0.7)] hover:bg-white/15">
            {searchContent}
          </div>
        </div>

        {/* Mobile UI: Compact Bottom Pill (Airbnb Style) */}
        <div className="md:hidden absolute bottom-[180px] w-full z-[200] px-4 pointer-events-auto">
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="w-full bg-white/5 backdrop-blur-md shadow-[inset_0_2px_15px_rgba(255,255,255,0.5),inset_0_-1px_10px_rgba(255,255,255,0.1),0_25px_50px_rgba(0,0,0,0.5)] border border-white/20 border-t-white/40 rounded-[32px] py-4 px-6 flex items-center justify-between text-white active:scale-95 transition-transform"
          >
            <div className="flex flex-col items-start text-left">
              <span className="font-extrabold text-[17px] tracking-tight text-white drop-shadow-md">Where to?</span>
              <span className="text-[12px] text-white/80 font-medium mt-0.5">Any Event • Anywhere • Any Week</span>
            </div>
            <div className="bg-gradient-to-br from-[#FFD700] to-[#FACC15] p-3 rounded-full text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <Search size={22} strokeWidth={3} />
            </div>
          </button>
        </div>

        {/* Mobile Full Screen Search Modal */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <m.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[9999] bg-[#121212]/95 backdrop-blur-3xl overflow-y-auto"
            >
              <div className="px-6 pt-24 pb-32 h-[100dvh] overflow-y-auto flex flex-col">
                <button 
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="mb-8 p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-white inline-flex self-start"
                >
                  <X size={24} />
                </button>
                <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Plan your event</h2>
                
                <div className="bg-white/10 border border-white/20 rounded-[32px] p-2 flex flex-col shadow-2xl">
                  {searchContent}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Sleek 2D Trust Badges - Positioned Below Search Bar (Highest z-index) */}
        <div className="absolute bottom-[130px] md:bottom-auto md:top-[76%] left-0 right-0 w-full z-[300] flex justify-center pointer-events-none px-4">
          <div className="flex items-center gap-4 md:gap-8 opacity-80 scale-90 md:scale-100">
            {/* Verified Badge */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
              <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">100% Verified Vendors</span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-white/20"></div>

            {/* Secure Badge */}
            <div className="flex items-center gap-2">
              <Lock className="text-blue-400 w-4 h-4 md:w-5 md:h-5" />
              <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">Secure Booking</span>
            </div>

            <div className="hidden md:block w-1 h-1 rounded-full bg-white/20"></div>

            {/* Smart Panel Badge (Desktop only) */}
            <div className="hidden md:flex items-center gap-2">
              <LayoutDashboard className="text-purple-400 w-4 h-4 md:w-5 md:h-5" />
              <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">Smart Client Panel</span>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default HeroParallax;
