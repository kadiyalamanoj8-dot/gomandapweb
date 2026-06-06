import React, { useMemo, useState } from 'react';
import { X, SlidersHorizontal, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, CATEGORY_BUCKETS } from '../../data/mockData';
import { useSettings } from '../../context/SettingsContext';
import * as Icons from 'lucide-react';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

const VENUE_CATEGORIES = ['Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams'];
const PHOTO_CATEGORIES = ['Photography & Videography'];
const MAKEUP_CATEGORIES = ['Makeup Artists (MUA)', 'Mehndi Designers'];
const CATERING_CATEGORIES = ['Catering Service'];
const DECOR_CATEGORIES = ['Stage & Venue Decor', 'Event Planners'];
const DJ_CATEGORIES = ['DJs & Sound Systems', 'Live Musicians / Band Baaja'];
const JEWELRY_CATEGORIES = ['Wedding Clothes / Boutiques', 'Jewelry Shops'];
const LOGISTICS_CATEGORIES = ['Wedding Cards & Invites', 'Cars & Buses (Travel)', 'Astrologers / Pundits', 'Honeymoon Packages'];

const ICON_MAP = {
  'Banquet Halls':               '/images/3d_venue copy.webp',
  'Kalyana Mandapams':           '/images/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':     '/images/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.webp',
  '5-Star Hotels':               '/images/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':          '/images/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':           '/images/temple_mandap copy.webp',
  'Catering Service':            '/images/3d_food copy.webp',
  'Stage & Venue Decor':         '/images/3d_decor copy.webp',
  'Photography & Videography':   '/images/3d_camera copy.webp',
  'DJs & Sound Systems':         '/images/3d_dj copy.webp',
  'Live Musicians / Band Baaja': '/images/3d_band copy.webp',
  'Makeup Artists (MUA)':        '/images/3d_makeup copy.webp',
  'Mehndi Designers':            '/images/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques': '/images/3d_clothes copy.webp',
  'Jewelry Shops':               '/images/3d_jewelry copy.webp',
  'Wedding Cards & Invites':     '/images/3d_invitation copy.webp',
  'Cars & Buses (Travel)':       '/images/3d_car copy.webp',
  'Astrologers / Pundits':       '/images/3d_astrologer copy.webp',
  'Honeymoon Packages':          '/images/3d_honeymoon copy.webp',
  'Event Planners':              '/images/3d_planner copy.webp',
};

const FilterSidebar = ({ isMobileOpen, setIsMobileOpen, selectedCategories = [], toggleCategory }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCategoryEnabled } = useSettings();
  
  const inHouseCatering = searchParams.get('inHouseCatering') === 'true';
  const inHousePhotography = searchParams.get('inHousePhotography') === 'true';
  const inHouseDecorations = searchParams.get('inHouseDecorations') === 'true';

  const handleInHouseChange = (field, checked) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) newParams.set(field, 'true');
    else newParams.delete(field);
    setSearchParams(newParams);
  };

  const handleDynamicFilterChange = (field, value, type, checked) => {
    const newParams = new URLSearchParams(searchParams);
    const paramKey = `dynamic_${field}`;
    
    if (type === 'RADIO') {
      newParams.set(paramKey, value);
    } else if (type === 'CHECKBOX') {
      const currentVals = newParams.getAll(paramKey);
      newParams.delete(paramKey);
      let newVals = [...currentVals];
      if (checked) newVals.push(value);
      else newVals = newVals.filter(v => v !== value);
      newVals.forEach(v => newParams.append(paramKey, v));
    }
    setSearchParams(newParams);
  };

  const mobileClasses = isMobileOpen 
    ? 'fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col' 
    : 'hidden md:block';

  const activeSchemas = useMemo(() => {
    const schemas = new Set();
    
    if (selectedCategories.length === 0) {
      schemas.add('VENUE');
      return Array.from(schemas);
    }

    selectedCategories.forEach(cat => {
      if (VENUE_CATEGORIES.includes(cat)) schemas.add('VENUE');
      if (PHOTO_CATEGORIES.includes(cat)) schemas.add('PHOTO');
      if (MAKEUP_CATEGORIES.includes(cat)) schemas.add('MAKEUP');
      if (CATERING_CATEGORIES.includes(cat)) schemas.add('CATERING');
      if (DECOR_CATEGORIES.includes(cat)) schemas.add('DECOR');
      if (DJ_CATEGORIES.includes(cat)) schemas.add('DJ');
      if (JEWELRY_CATEGORIES.includes(cat)) schemas.add('JEWELRY');
      if (LOGISTICS_CATEGORIES.includes(cat)) schemas.add('LOGISTICS');
    });
    
    return Array.from(schemas);
  }, [selectedCategories]);

  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  React.useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const groupsParam = activeSchemas.join(',');
        const res = await fetch(`https://gomandap-api.onrender.com/api/filters?groups=${groupsParam}`);
        const data = await res.json();
        
        if (data.success) {
          const combinedFilters = data.data.flatMap(schema => schema.filters);
          setDynamicFilters(combinedFilters);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic filters", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    fetchFilters();
  }, [activeSchemas]);

  const renderDynamicBlock = (block) => {
    if (block.type === 'RADIO') {
      return (
        <div key={block.name} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt, idx) => {
              const paramKey = `dynamic_${block.name}`;
              const isChecked = searchParams.get(paramKey) === opt.value || (!searchParams.has(paramKey) && idx === 0);
              return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name={block.name} 
                  value={opt.value}
                  checked={isChecked} 
                  className="w-4 h-4 accent-brand-primary cursor-pointer" 
                  onChange={(e) => handleDynamicFilterChange(block.name, e.target.value, 'RADIO')}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            )})}
          </div>
        </div>
      );
    }

    if (block.type === 'CHECKBOX') {
      return (
        <div key={block.name} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt) => {
              const paramKey = `dynamic_${block.name}`;
              const isChecked = searchParams.getAll(paramKey).includes(opt.value);
              return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={opt.value}
                  checked={isChecked}
                  className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" 
                  onChange={(e) => handleDynamicFilterChange(block.name, e.target.value, 'CHECKBOX', e.target.checked)}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            )})}
          </div>
        </div>
      );
    }
    return null;
  };

  const [expandedBuckets, setExpandedBuckets] = useState(
    CATEGORY_BUCKETS.reduce((acc, bucket) => ({ ...acc, [bucket.id]: true }), {})
  );

  const toggleBucket = (id) => {
    setExpandedBuckets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`${mobileClasses} md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:w-1/4 lg:w-[25%] md:overflow-y-auto no-scrollbar md:bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:border md:border-gray-100 shrink-0`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
          <SlidersHorizontal size={20} className="text-brand-primary" /> Filters
        </h2>
        <button 
          className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-8 md:space-y-6">
        
        {/* Locality Search */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Locality / City</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by area (e.g. Bandra)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-gray-700 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Browse Categories</h3>
          <div className="flex flex-col gap-4">
            {CATEGORY_BUCKETS.map(bucket => {
              const isActive = bucket.categories.some(c => selectedCategories.includes(c.label));
              const isExpanded = expandedBuckets[bucket.id];
              return (
                <div key={bucket.id} className="flex flex-col">
                  <button 
                    onClick={() => toggleBucket(bucket.id)}
                    className="flex justify-between items-center w-full text-left py-1 group"
                  >
                    <span className={`text-sm font-bold transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-800 group-hover:text-brand-primary'}`}>
                      {bucket.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="flex flex-col gap-1.5 mt-2 ml-1">
                      {bucket.categories.map(cat => {
                        if (!isCategoryEnabled(cat.label)) return null;
                        const isSelected = selectedCategories.includes(cat.label);
                        const icon3d = ICON_MAP[cat.label];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory && toggleCategory(cat.label)}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                              isSelected 
                                ? 'bg-brand-primary/10 border border-brand-primary/20' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                              {icon3d ? (
                                <img src={icon3d} alt={cat.label} className="w-full h-full object-contain drop-shadow-sm" />
                              ) : (
                                <IconComponent name={cat.iconName} size={16} className={isSelected ? 'text-brand-primary' : 'text-gray-500'} />
                              )}
                            </div>
                            <span className={`text-xs font-bold text-left leading-tight ${isSelected ? 'text-brand-primary' : 'text-gray-600'}`}>
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic MongoDB Filters */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {isLoadingFilters ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-bold text-gray-400">Loading dynamic filters...</p>
            </div>
          ) : (
            dynamicFilters.map(block => renderDynamicBlock(block))
          )}
        </div>

      </div>
      
      {isMobileOpen && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 mt-auto">
          <button 
            className="w-full btn-liquid text-white py-4 rounded-xl font-black shadow-3d hover:shadow-3d-hover active:scale-95 transition-all text-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
