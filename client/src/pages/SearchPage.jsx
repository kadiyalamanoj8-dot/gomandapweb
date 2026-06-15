import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search as SearchIcon, MapPin, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles, TrendingUp, Award, Crown } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimatedVendorCard from '../components/search/AnimatedVendorCard';
import PromotedVendorCard from '../components/search/PromotedVendorCard';
import { generateFakeVendors, CATEGORIES } from '../data/mockData';
import FilterSidebar from '../components/search/FilterSidebar';
import CustomDropdown from '../components/ui/CustomDropdown';

// Quick access to mock data for the lanes
const setFirstAsAd = (vendors) => vendors.map((v, i) => i === 0 ? { ...v, isAd: true } : v);

const MOCK_RECOMMENDED = setFirstAsAd(generateFakeVendors('Banquet Halls', 6));
const MOCK_TRENDING = setFirstAsAd(generateFakeVendors('Photography & Videography', 8));
const MOCK_LUXURY = setFirstAsAd(generateFakeVendors('5-Star Hotels', 5));
const MOCK_CATERING = generateFakeVendors('Catering Service', 6);
const MOCK_DECOR = generateFakeVendors('Stage & Venue Decor', 5);

const HorizontalLane = ({ title, subtitle, icon: Icon, vendors }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6 px-4 md:px-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={20} className="text-brand-primary" />}
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-sm font-semibold text-gray-500">{subtitle}</p>}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:text-brand-primary transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollRight} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:text-brand-primary transition-all shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-8 pb-8 no-scrollbar snap-x scroll-smooth"
      >
        {vendors.map((vendor, idx) => (
          <div key={idx} className="snap-start shrink-0">
            {vendor.isAd ? (
              <PromotedVendorCard vendor={vendor} />
            ) : (
              <AnimatedVendorCard vendor={vendor} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroSearchBanner = ({ searchParams, setSearchParams }) => {
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');
  const [localLoc, setLocalLoc] = useState(searchParams.get('locName') || '');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (localQuery) p.set('q', localQuery); else p.delete('q');
    if (localLoc) p.set('locName', localLoc); else p.delete('locName');
    setSearchParams(p);
  };

  return (
    <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-black flex items-center justify-center">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0a1?w=1600&q=80" alt="Search Hero" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-brand-gold text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md">
            Discover Excellence
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
            Find Your <span className="text-brand-gold">Perfect</span> Match
          </h1>
          <p className="text-sm md:text-lg text-white/80 font-medium max-w-2xl mx-auto">
            Browse through thousands of verified venues and vendors for your grand celebration.
          </p>
        </motion.div>

        {/* Hero Search Bar */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="bg-white p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.15)] max-w-4xl mx-auto border border-white/20"
        >
          <div className="flex-1 flex items-center bg-gray-50 md:bg-transparent rounded-xl md:rounded-l-full px-4 py-3 md:py-0 border md:border-none border-gray-100">
            <SearchIcon className="text-brand-primary" size={20} />
            <input 
              type="text" 
              placeholder="What are you looking for? (e.g. Banquet Halls)" 
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-200 my-auto" />
          <div className="flex-1 flex items-center bg-gray-50 md:bg-transparent rounded-xl px-4 py-3 md:py-0 border md:border-none border-gray-100">
            <MapPin className="text-brand-primary" size={20} />
            <input 
              type="text" 
              placeholder="Where? (e.g. Mumbai)" 
              value={localLoc}
              onChange={e => setLocalLoc(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
          <button type="submit" className="bg-brand-primary text-white px-8 py-3.5 rounded-xl md:rounded-full font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg active:scale-95 whitespace-nowrap">
            Search Now
          </button>
        </motion.form>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Categories Filter state
  const targetCategories = searchParams.getAll('category');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const TABS = [
    { id: 'all', label: 'All Discoveries' },
    { id: 'venues', label: 'Function Places' },
    { id: 'vendors', label: 'Services & Vendors' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <HeroSearchBanner searchParams={searchParams} setSearchParams={setSearchParams} />

      {/* Sticky Filter Tabs */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex overflow-x-auto gap-2 no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full text-sm font-bold text-gray-700 shrink-0"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[140px]">
              <FilterSidebar
                isMobileOpen={isMobileFiltersOpen}
                setIsMobileOpen={setIsMobileFiltersOpen}
                selectedCategories={targetCategories}
                toggleCategory={() => {}}
              />
            </div>
          </div>

          {/* Main Content Lanes */}
          <div className="flex-1 min-w-0 pb-20">
            {activeTab === 'all' || activeTab === 'venues' ? (
              <>
                <HorizontalLane 
                  title="Recommended for You" 
                  subtitle="Based on your search preferences"
                  icon={Sparkles}
                  vendors={MOCK_RECOMMENDED} 
                />
                <HorizontalLane 
                  title="Trending Venues" 
                  subtitle="Most booked locations this month"
                  icon={TrendingUp}
                  vendors={MOCK_LUXURY} 
                />
              </>
            ) : null}

            {activeTab === 'all' || activeTab === 'vendors' ? (
              <>
                <HorizontalLane 
                  title="Top Rated Photography" 
                  subtitle="Capture your best moments"
                  icon={Award}
                  vendors={MOCK_TRENDING} 
                />
                <HorizontalLane 
                  title="Premium Catering" 
                  subtitle="Delicious menus for your guests"
                  icon={Crown}
                  vendors={MOCK_CATERING} 
                />
                <HorizontalLane 
                  title="Stunning Decorators" 
                  subtitle="Transform your venue into a dream"
                  icon={Sparkles}
                  vendors={MOCK_DECOR} 
                />
              </>
            ) : null}

            {/* End of results message */}
            <div className="text-center py-12 border-t border-gray-100 mt-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-4">
                <SearchIcon size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Can't find what you're looking for?</h3>
              <p className="text-gray-500 font-semibold mb-6">Adjust your filters or try a different search term.</p>
              <button className="px-8 py-3 bg-white border-2 border-brand-primary text-brand-primary rounded-xl font-black hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
