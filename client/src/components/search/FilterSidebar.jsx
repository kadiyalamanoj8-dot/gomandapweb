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

// Native fallback filters for each schema type
const NATIVE_FILTERS = {
  VENUE: [
    { name: 'capacity', title: 'Guest Capacity', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '100-500', label: '100-500 guests' },
      { value: '500-1000', label: '500-1000 guests' },
      { value: '1000-2000', label: '1000-2000 guests' },
      { value: '2000+', label: '2000+ guests' }
    ]},
    { name: 'priceRange', title: 'Budget Range', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '0-50000', label: '₹0 - ₹50,000' },
      { value: '50000-150000', label: '₹50,000 - ₹1,50,000' },
      { value: '150000-300000', label: '₹1,50,000 - ₹3,00,000' },
      { value: '300000+', label: '₹3,00,000+' }
    ]},
    { name: 'amenities', title: 'Amenities', type: 'CHECKBOX', options: [
      { value: 'parking', label: 'Parking Available' },
      { value: 'ac', label: 'Air Conditioning' },
      { value: 'inhouse-catering', label: 'In-house Catering' },
      { value: 'inhouse-decor', label: 'In-house Decor' },
      { value: 'inhouse-photography', label: 'In-house Photography' },
      { value: 'outdoor-space', label: 'Outdoor Space' },
      { value: 'lounge', label: 'Lounge Area' }
    ]}
  ],
  PHOTO: [
    { name: 'photoType', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'photography', label: 'Photography' },
      { value: 'videography', label: 'Videography' },
      { value: 'drone', label: 'Drone Shots' },
      { value: 'editing', label: 'Video Editing' },
      { value: 'album', label: 'Album Design' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '20000-50000', label: '₹20K - ₹50K' },
      { value: '50000-100000', label: '₹50K - ₹1L' },
      { value: '100000-200000', label: '₹1L - ₹2L' },
      { value: '200000+', label: '₹2L+' }
    ]}
  ],
  MAKEUP: [
    { name: 'makeupType', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'bridal', label: 'Bridal Makeup' },
      { value: 'mehndi', label: 'Mehndi' },
      { value: 'groom', label: 'Groom Makeup' },
      { value: 'guests', label: 'Guest Makeup' },
      { value: 'jewelry', label: 'Jewelry Services' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '5000-15000', label: '₹5K - ₹15K' },
      { value: '15000-30000', label: '₹15K - ₹30K' },
      { value: '30000-50000', label: '₹30K - ₹50K' },
      { value: '50000+', label: '₹50K+' }
    ]}
  ],
  CATERING: [
    { name: 'cuisineType', title: 'Cuisine Type', type: 'CHECKBOX', options: [
      { value: 'north-indian', label: 'North Indian' },
      { value: 'south-indian', label: 'South Indian' },
      { value: 'continental', label: 'Continental' },
      { value: 'chinese', label: 'Chinese' },
      { value: 'fusion', label: 'Fusion' },
      { value: 'vegan', label: 'Vegan Options' }
    ]},
    { name: 'pricePerPlate', title: 'Price Per Plate', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '300-500', label: '₹300 - ₹500' },
      { value: '500-1000', label: '₹500 - ₹1,000' },
      { value: '1000-1500', label: '₹1,000 - ₹1,500' },
      { value: '1500+', label: '₹1,500+' }
    ]}
  ],
  DECOR: [
    { name: 'decorType', title: 'Decor Type', type: 'CHECKBOX', options: [
      { value: 'traditional', label: 'Traditional' },
      { value: 'modern', label: 'Modern' },
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'floral', label: 'Floral Decor' },
      { value: 'lighting', label: 'LED/Lighting' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '50000-150000', label: '₹50K - ₹1.5L' },
      { value: '150000-300000', label: '₹1.5L - ₹3L' },
      { value: '300000-500000', label: '₹3L - ₹5L' },
      { value: '500000+', label: '₹5L+' }
    ]}
  ],
  DJ: [
    { name: 'serviceType', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'dj', label: 'DJ Services' },
      { value: 'live-band', label: 'Live Band' },
      { value: 'sound-system', label: 'Sound System' },
      { value: 'lighting-dj', label: 'Lighting' },
      { value: 'singers', label: 'Live Singers' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '10000-30000', label: '₹10K - ₹30K' },
      { value: '30000-60000', label: '₹30K - ₹60K' },
      { value: '60000-100000', label: '₹60K - ₹1L' },
      { value: '100000+', label: '₹1L+' }
    ]}
  ],
  JEWELRY: [
    { name: 'jewelryType', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'bridal-jewelry', label: 'Bridal Jewelry' },
      { value: 'clothing', label: 'Bridal Clothing' },
      { value: 'groom-wear', label: 'Groom Wear' },
      { value: 'accessories', label: 'Accessories' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '30000-100000', label: '₹30K - ₹1L' },
      { value: '100000-300000', label: '₹1L - ₹3L' },
      { value: '300000-500000', label: '₹3L - ₹5L' },
      { value: '500000+', label: '₹5L+' }
    ]}
  ],
  LOGISTICS: [
    { name: 'serviceType', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'invitation', label: 'Wedding Cards' },
      { value: 'transportation', label: 'Vehicles & Travel' },
      { value: 'astrologer', label: 'Astrology Services' },
      { value: 'honeymoon', label: 'Honeymoon Packages' }
    ]},
    { name: 'priceRange', title: 'Budget', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: '5000-25000', label: '₹5K - ₹25K' },
      { value: '25000-100000', label: '₹25K - ₹1L' },
      { value: '100000-300000', label: '₹1L - ₹3L' },
      { value: '300000+', label: '₹3L+' }
    ]}
  ]
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
  'Banquet Halls':               '/images/3d_venue.webp',
  'Kalyana Mandapams':           '/images/temple_mandap.webp',
  'Open Lawns & Farmhouses':     '/images/3d_lawn_farmhouse_1780657291134.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo.webp',
  '5-Star Hotels':               '/images/3d_5star_hotel_1780657276128.webp',
  'Party & Mini Halls':          '/images/neon_sangeet_stage.webp',
  'Temples & Ashrams':           '/images/temple_mandap.webp',
  'Catering Service':            '/images/3d_food.webp',
  'Stage & Venue Decor':         '/images/3d_decor.webp',
  'Photography & Videography':   '/images/3d_camera.webp',
  'DJs & Sound Systems':         '/images/3d_dj.webp',
  'Live Musicians / Band Baaja': '/images/3d_band.webp',
  'Makeup Artists (MUA)':        '/images/3d_makeup.webp',
  'Mehndi Designers':            '/images/3d_mehndi_1780657262687.webp',
  'Wedding Clothes / Boutiques': '/images/3d_clothes.webp',
  'Jewelry Shops':               '/images/3d_jewelry.webp',
  'Wedding Cards & Invites':     '/images/3d_invitation.webp',
  'Cars & Buses (Travel)':       '/images/3d_car.webp',
  'Astrologers / Pundits':       '/images/3d_astrologer.webp',
  'Honeymoon Packages':          '/images/3d_honeymoon.webp',
  'Event Planners':              '/images/3d_planner.webp',
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
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterError, setFilterError] = useState(false);

  React.useEffect(() => {
    const fetchFilters = async () => {
      // Use native filters for these schemas without API call
      const nativeSchemas = ['VENUE', 'PHOTO', 'MAKEUP', 'CATERING', 'DECOR', 'DJ', 'JEWELRY', 'LOGISTICS'];
      const nativeFilters = [];
      
      activeSchemas.forEach(schema => {
        if (NATIVE_FILTERS[schema]) {
          nativeFilters.push(...NATIVE_FILTERS[schema]);
        }
      });
      
      setDynamicFilters(nativeFilters);
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

        {/* Dynamic MongoDB Filters / Native Filters */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {dynamicFilters.length > 0 ? (
            dynamicFilters.map(block => renderDynamicBlock(block))
          ) : (
            <p className="text-xs font-bold text-gray-400 py-4 text-center">No additional filters available</p>
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
