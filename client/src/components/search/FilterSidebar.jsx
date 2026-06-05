import React, { useMemo } from 'react';
import { X, SlidersHorizontal, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockData';
import { useSettings } from '../../context/SettingsContext';

const VENUE_CATEGORIES = ['Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams'];
const PHOTO_CATEGORIES = ['Photography & Videography'];
const MAKEUP_CATEGORIES = ['Makeup Artists (MUA)', 'Mehndi Designers'];
const CATERING_CATEGORIES = ['Catering Service'];
const DECOR_CATEGORIES = ['Stage & Venue Decor', 'Event Planners'];
const DJ_CATEGORIES = ['DJs & Sound Systems', 'Live Musicians / Band Baaja'];
const JEWELRY_CATEGORIES = ['Wedding Clothes / Boutiques', 'Jewelry Shops'];
const LOGISTICS_CATEGORIES = ['Wedding Cards & Invites', 'Cars & Buses (Travel)', 'Astrologers / Pundits', 'Honeymoon Packages'];

const FilterSidebar = ({ isMobileOpen, setIsMobileOpen, selectedCategories = [] }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCategoryEnabled } = useSettings();
  const activeCategories = CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  const inHouseCatering = searchParams.get('inHouseCatering') === 'true';
  const inHousePhotography = searchParams.get('inHousePhotography') === 'true';
  const inHouseDecorations = searchParams.get('inHouseDecorations') === 'true';

  const handleInHouseChange = (field, checked) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) newParams.set(field, 'true');
    else newParams.delete(field);
    setSearchParams(newParams);
  };

  const mobileClasses = isMobileOpen 
    ? 'fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col' 
    : 'hidden md:block';

  const activeSchemas = useMemo(() => {
    const schemas = new Set();
    
    // Default to VENUE if nothing selected to show something
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

  // Fetch dynamic filters from MongoDB when active schemas change
  React.useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const groupsParam = activeSchemas.join(',');
        const res = await fetch(`http://localhost:5000/api/filters?groups=${groupsParam}`);
        const data = await res.json();
        
        if (data.success) {
          // Combine all filters from all matching schemas
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

  // Helper to render dynamic filter blocks
  const renderDynamicBlock = (block) => {
    if (block.type === 'RADIO') {
      return (
        <div key={block.name} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt, idx) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name={block.name} 
                  value={opt.value}
                  defaultChecked={idx === 0} 
                  className="w-4 h-4 accent-brand-primary cursor-pointer" 
                  onChange={(e) => handleInHouseChange(block.name, e.target.value)}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'CHECKBOX') {
      return (
        <div key={block.name} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={opt.value}
                  className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" 
                  onChange={(e) => {
                    // Handling array logic for checkboxes is complex via URL params without a helper, 
                    // keeping simple toggle for now or using a generic handleFilterChange
                  }}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    return null;
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
        
        {/* Locality Search - Common for all */}
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

        {/* We removed the static list of categories here because it's now in the massive horizontal scroll above the search results! */}

        {/* Dynamic MongoDB Filters */}
        <div className="space-y-2">
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
      
      {/* Mobile Sticky Apply Button */}
      {isMobileOpen && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 mt-auto">
          <button 
            className="w-full bg-brand-primary text-white py-4 rounded-xl font-black shadow-3d hover:shadow-3d-hover active:scale-95 transition-all text-lg"
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
