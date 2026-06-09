import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, m, LazyMotion, domAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Search, MapPin, Calendar, PartyPopper, X } from 'lucide-react';
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

const HeroParallax = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsHeroVisible(entry.isIntersecting), { threshold: 0.05 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);
  
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
            setSelectedLocation({ lat: latitude, lon: longitude, display_name: data.display_name });
            setLocationQuery(locName);
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
    setIsMobileSearchOpen(false);
    navigate(url);
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  
  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-10, 10]);
  const doorsX = useTransform(smoothX, [-1, 1], [-15, 15]);
  const doorsY = useTransform(smoothY, [-1, 1], [-15, 15]);
  const midX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const midY = useTransform(smoothY, [-1, 1], [-25, 25]);
  const frontX = useTransform(smoothX, [-1, 1], [-35, 35]);
  const frontY = useTransform(smoothY, [-1, 1], [-35, 35]);
  const floatX1 = useTransform(smoothX, [-1, 1], [40, -40]);
  const floatY1 = useTransform(smoothY, [-1, 1], [40, -40]);
  const floatX2 = useTransform(smoothX, [-1, 1], [-50, 50]);
  const floatY2 = useTransform(smoothY, [-1, 1], [-50, 50]);

  useEffect(() => {
    if (!isHeroVisible) return;
    const handleMouseMove = (e) => {
      // Disabled desktop mouse parallax as requested
      return;
    };

    let rAF;
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
        baselineX += (x - baselineX) * 0.05;
        baselineY += (y - baselineY) * 0.05;
        const deltaX = x - baselineX;
        const deltaY = y - baselineY;
        const mobileScale = isMobile ? 0.3 : 1;
        mouseX.set(Math.max(-1, Math.min(1, deltaX / 45)) * mobileScale);
        mouseY.set(Math.max(-1, Math.min(1, deltaY / 45)) * mobileScale);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [mouseX, mouseY, isHeroVisible, isMobile]);

  const searchContent = (
    <>
      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-pointer py-2 md:pt-3 md:pb-1">
        <div className="px-3 sm:px-6 flex flex-col items-start w-full">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_event_type')}</span>
          <div className="w-full z-[300]">
            <ApplePicker
              options={EVENT_TYPES.map(tOption => ({label: tOption, value: tOption}))}
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
      <div className="block md:hidden h-px w-[90%] bg-white/10 mx-auto my-2"></div>

      <div className="flex-1 w-full md:w-auto relative group rounded-[24px] md:rounded-full hover:bg-white/5 transition-colors cursor-text flex items-center justify-between pr-2 py-2 md:py-3">
        <div className="px-3 sm:px-6 flex flex-col items-start w-full">
          <span className="text-[10px] font-bold text-[#FFD700]/70 uppercase tracking-[0.18em] mb-0.5 ml-1">{t('search_dates')}</span>
          <div className="px-1 py-1 w-full">
            <AppleDateTimePicker value={selectedDate} onChange={setSelectedDate} placeholder="When?" theme="dark" position="bottom" />
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
        className="relative w-full h-screen h-[100dvh] min-h-[600px] bg-black z-40 focus-within:z-[60] select-none overflow-hidden"
      >
      
        {/* Layer 1: Deep Background */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 perspective-[1200px]">
          <m.div style={{ x: isMobile ? 0 : bgX, y: isMobile ? 0 : bgY }} className="absolute inset-[-10%] w-[120%] h-[120%] z-0">
            <img src="/images/temple_background.webp" alt="Background" className="w-full h-full object-cover opacity-60" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          </m.div>

          <m.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-0 w-full h-full flex items-center justify-center">
            
            {/* Layer 2: Temple Doors Framing */}
            <m.div style={{ x: doorsX, y: doorsY, translateZ: -100 }} className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-screen hidden md:block">
               <img src="/images/real_temple_doors.webp" className="w-full h-full object-cover" alt="" />
            </m.div>

            {/* Layer 4: Text */}
            <m.div style={{ x: midX, y: midY, translateZ: 30 }} className="absolute top-[20%] md:top-[25%] w-full z-[25] flex flex-col items-center justify-start text-center px-4 pointer-events-none">
              <h1 className="text-4xl md:text-[64px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-4 tracking-tight leading-[1.2] md:leading-[1.35]" dangerouslySetInnerHTML={{ __html: t('hero_title') }} />
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-medium">{t('hero_desc')}</p>
            </m.div>

            {/* Layer 5: The Couple */}
            <m.div style={{ x: frontX, y: frontY, translateZ: 80, scale: 1.05 }} className="absolute inset-0 z-30 flex items-center justify-center pt-[10vh] md:pt-[5vh]">
              <img src="/images/couple_transparent.webp" alt="Couple" className="w-[85vw] md:w-[70vw] max-h-[65vh] md:max-h-[70vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(255,193,7,0.6)] pointer-events-none" />
            </m.div>
          </m.div>
        </div>

        {/* Desktop UI: Centered Glass Pill */}
        <div className="hidden md:flex absolute top-[60%] w-full z-[200] flex-col items-center justify-start px-4 pointer-events-none">
          <div className="w-full max-w-5xl pointer-events-auto bg-white/10 backdrop-blur-xl shadow-[inset_0_2px_15px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.6)] border border-white/20 border-t-white/40 rounded-full p-2.5 flex flex-row items-center mx-auto transition-all duration-300 hover:shadow-[inset_0_2px_15px_rgba(255,255,255,0.5),0_30px_70px_rgba(0,0,0,0.7)] hover:bg-white/15">
            {searchContent}
          </div>
        </div>

        {/* Mobile UI: Compact Bottom Pill (Airbnb Style) */}
        <div className="md:hidden absolute bottom-[15%] w-full z-[200] px-4 pointer-events-auto">
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="w-full bg-white/10 backdrop-blur-3xl shadow-[inset_0_2px_15px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.7)] border border-white/20 border-t-white/40 rounded-[32px] py-4 px-6 flex items-center justify-between text-white active:scale-95 transition-transform"
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
              <div className="p-6 pb-24 h-full flex flex-col">
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
      </div>
    </LazyMotion>
  );
};

export default HeroParallax;
