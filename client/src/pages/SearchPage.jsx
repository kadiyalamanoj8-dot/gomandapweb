import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATEGORIES } from '../data/mockData';
import LiquidVendorCard from '../components/common/LiquidVendorCard';
import FilterSidebar from '../components/search/FilterSidebar';
import { MapPin, SlidersHorizontal, Search as SearchIcon, ArrowLeft, ChevronRight, Home, ArrowUpDown, Navigation } from 'lucide-react';
import { API_URL } from '../config/api';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import CustomDropdown from '../components/ui/CustomDropdown';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { usePermissions } from '../context/PermissionContext';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

const ICON_MAP = {
  'Banquet Halls':               '/images/resized/3d_venue copy.webp',
  'Kalyana Mandapams':           '/images/resized/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':     '/images/resized/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/resized/modern_gazebo copy.webp',
  '5-Star Hotels':               '/images/resized/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':          '/images/resized/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':           '/images/resized/temple_mandap copy.webp',
  'Catering Service':            '/images/resized/3d_food copy.webp',
  'Stage & Venue Decor':         '/images/resized/3d_decor copy.webp',
  'Photography & Videography':   '/images/resized/3d_camera copy.webp',
  'DJs & Sound Systems':         '/images/resized/3d_dj copy.webp',
  'Live Musicians / Band Baaja': '/images/resized/3d_band copy.webp',
  'Makeup Artists (MUA)':        '/images/resized/3d_makeup copy.webp',
  'Mehndi Designers':            '/images/resized/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques': '/images/resized/3d_clothes copy.webp',
  'Jewelry Shops':               '/images/resized/3d_jewelry copy.webp',
  'Wedding Cards & Invites':     '/images/resized/3d_invitation copy.webp',
  'Cars & Buses (Travel)':       '/images/resized/3d_car copy.webp',
  'Astrologers / Pundits':       '/images/resized/3d_astrologer copy.webp',
  'Honeymoon Packages':          '/images/resized/3d_honeymoon copy.webp',
  'Event Planners':              '/images/resized/3d_planner copy.webp',
};

const SearchPage = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { requestPermission } = usePermissions();

  const targetCategories = searchParams.getAll('category');
  if (targetCategories.length === 0) {
    targetCategories.push('Banquet Halls');
  }

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const locName = searchParams.get('locName');

  const [sortOption, setSortOption] = useState('Popularity');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedResults, setRecommendedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const previousSearchParamsRef = useRef(searchParams.toString());

  const toggleCategory = (catLabel) => {
    const newParams = new URLSearchParams(searchParams);
    const currentCats = newParams.getAll('category');
    newParams.delete('category');
    if (currentCats.includes(catLabel)) {
      const remaining = currentCats.filter(c => c !== catLabel);
      if (remaining.length > 0) {
        remaining.forEach(c => newParams.append('category', c));
      } else {
        newParams.append('category', catLabel);
      }
    } else {
      currentCats.forEach(c => newParams.append('category', c));
      newParams.append('category', catLabel);
    }
    setSearchParams(newParams);
  };

  const handleAutoLocate = async () => {
    if ("geolocation" in navigator) {
      const granted = await requestPermission('location');
      if (!granted) return;

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
            const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const locName = result.address_components?.find(c => c.types.includes('locality'))?.short_name || result.name || "Current Location";
              
              const newParams = new URLSearchParams(searchParams);
              newParams.set('lat', latitude);
              newParams.set('lng', longitude);
              newParams.set('locName', locName);
              setSearchParams(newParams);
            }
        } catch (error) {
            console.error(error);
        }
      }, () => alert("Please allow location access to use this feature."));
    } else alert("Geolocation is not supported by your browser.");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const inHouseCatering    = searchParams.get('inHouseCatering')    === 'true';
        const inHousePhotography = searchParams.get('inHousePhotography') === 'true';
        const inHouseDecorations = searchParams.get('inHouseDecorations') === 'true';
        const date = searchParams.get('date');
        const q = searchParams.get('q');
        const capacity = searchParams.get('capacity');

        let url = `${API_URL}/api/vendors?categories=${encodeURIComponent(targetCategories.join(','))}`;
        if (inHouseCatering)    url += `&inHouseCatering=true`;
        if (inHousePhotography) url += `&inHousePhotography=true`;
        if (inHouseDecorations) url += `&inHouseDecorations=true`;
        if (date) url += `&date=${encodeURIComponent(date)}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (lat && lng)  url += `&lat=${lat}&lng=${lng}&radiusInKm=50`;
        else if (locName) url += `&locName=${encodeURIComponent(locName)}`;
        if (capacity) url += `&capacity=${encodeURIComponent(capacity)}`;

        searchParams.forEach((val, key) => {
          if (key.startsWith('dynamic_')) {
            url += `&${key}=${encodeURIComponent(val)}`;
          }
        });

        // Pagination
        const currentSearchParamsStr = searchParams.toString();
        let currentPage = page;
        if (currentSearchParamsStr !== previousSearchParamsRef.current) {
          currentPage = 1;
          setPage(1);
          previousSearchParamsRef.current = currentSearchParamsStr;
        }
        url += `&page=${currentPage}&limit=20`;

        const res  = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const mappedData = data.data.map(v => ({
            id:             v._id,
            name:           v.name,
            category:       v.category,
            location:       v.address?.city ? `${v.address.city}, India` : 'India',
            imageUrl:       v.portfolioImages?.length > 0 ? v.portfolioImages[0] : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
            pricePerPlate:  v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
            rating:         v.rating || 5.0,
            reviewsCount:   v.reviewsCount || 0,
            deepFeatures:   v.deepFeatures,
            portfolioImages:v.portfolioImages,
            contact:        v.contact,
            pricingPackages:v.customBlocks?.pricingPackages || [],
            isFeatured:     v.isFeatured,
          }));
          const recommended = mappedData.filter(v => v.rating >= 4.8 || v.isFeatured);
          const standard    = mappedData.filter(v => !(v.rating >= 4.8 || v.isFeatured));
          
          setHasMore(data.page < data.pages);

          if (currentPage === 1) {
            setRecommendedResults(recommended);
            setSearchResults(standard.length > 0 ? standard : mappedData);
          } else {
            setSearchResults(prev => [...prev, ...(standard.length > 0 ? standard : mappedData)]);
          }
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, [searchParams, page]);

  const memoizedRecommended = useMemo(() => recommendedResults.map(vendor => (
    <LiquidVendorCard key={vendor.id} vendor={vendor} layout="carousel" />
  )), [recommendedResults]);

  const sortedSearchResults = useMemo(() => {
    let sorted = [...searchResults];
    if (sortOption === 'Highest Rated') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'Popularity') {
      sorted.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortOption === 'Price: Low to High') {
      sorted.sort((a, b) => {
        const pA = parseInt(a.pricePerPlate) || Infinity;
        const pB = parseInt(b.pricePerPlate) || Infinity;
        return pA - pB;
      });
    } else if (sortOption === 'Price: High to Low') {
      sorted.sort((a, b) => {
        const pA = parseInt(a.pricePerPlate) || 0;
        const pB = parseInt(b.pricePerPlate) || 0;
        return pB - pA;
      });
    }
    return sorted;
  }, [searchResults, sortOption]);

  const memoizedSearch = useMemo(() => sortedSearchResults.map(vendor => (
    <LiquidVendorCard key={vendor.id} vendor={vendor} layout="list" />
  )), [sortedSearchResults]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-28 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest overflow-x-auto no-scrollbar pb-1">
          <Link to="/" className="hover:text-brand-primary flex items-center gap-1 transition-colors shrink-0">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="shrink-0">Vendors</span>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-brand-primary shrink-0">{targetCategories.join(' & ')}</span>
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {targetCategories.length > 1 ? 'Multiple Categories' : targetCategories[0]}{' '}
              {locName ? `near ${locName}` : 'in India'}
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">
              Showing {searchResults.length + recommendedResults.length} handpicked professionals
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center justify-between gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex flex-1 justify-center items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-3 rounded-xl text-sm font-black text-brand-primary shadow-sm hover:bg-brand-primary/20 transition-colors"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>

            <div className="flex flex-1 md:flex-none justify-between md:justify-start items-center gap-3">
              <button 
                onClick={handleAutoLocate}
                className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary px-4 py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
              >
                <Navigation size={16} /> <span className="hidden md:inline">Near Me</span>
              </button>
              
              <span className="text-sm text-gray-500 font-bold hidden md:inline whitespace-nowrap ml-2">Sort by:</span>
              <div className="w-full md:w-48">
                <CustomDropdown
                  options={['Popularity', 'Highest Rated', 'Price: Low to High', 'Price: High to Low']}
                  value={sortOption}
                  onChange={setSortOption}
                  placeholder="Sort by"
                  variant="light"
                  icon={ArrowUpDown}
                  className="bg-gray-50 border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative items-start">
          <FilterSidebar
            isMobileOpen={isMobileFiltersOpen}
            setIsMobileOpen={setIsMobileFiltersOpen}
            selectedCategories={targetCategories}
            toggleCategory={toggleCategory}
          />

          <div className="flex-1 w-full min-w-0">
            {/* Recommended Carousel */}
            {!isLoading && recommendedResults.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-brand-gold/10 rounded-lg">
                    <Icons.Award size={18} className="text-brand-gold" />
                  </div>
                  <h2 className="text-lg font-black text-gray-900">Recommended for You</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                  {memoizedRecommended}
                </div>
              </div>
            )}

            {/* All Results */}
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-gray-900 mb-4">All Results</h2>
              {isLoading ? (
                <div className="py-20 text-center text-gray-500 font-bold text-lg animate-pulse">
                  Loading verified professionals...
                </div>
              ) : searchResults.length === 0 && recommendedResults.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 mb-5 rounded-full bg-brand-primary/8 flex items-center justify-center">
                    <Icons.SearchX size={36} className="text-brand-primary/50" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">We're expanding here!</h3>
                  <p className="text-sm font-semibold text-gray-500 max-w-sm mb-6">
                    We are actively working right now to acquire the best <span className="text-brand-primary font-black">{targetCategories.join(' or ')}</span> vendors in your area. Please be patient, and we will inform you once we launch in your location.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => window.history.back()}
                      className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-all"
                    >
                      ← Go Back
                    </button>
                    <button
                      onClick={() => { const p = new URLSearchParams(); p.set('category','Banquet Halls'); window.location.search = p.toString(); }}
                      className="px-5 py-2.5 btn-liquid text-white rounded-xl text-sm font-black hover:bg-brand-primary/90 transition-all shadow-sm"
                    >
                      Browse Available Venues
                    </button>
                  </div>
                </div>
              ) : (
                memoizedSearch
              )}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center pb-8">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={isLoading}
                  className="bg-white border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-xl font-black hover:bg-brand-primary hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Results'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SearchPage;
