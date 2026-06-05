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

const FilterSidebar = ({ isMobileOpen, setIsMobileOpen, selectedCategory }) => {
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

  const filterSchema = useMemo(() => {
    let type = 'VENUE';
    if (PHOTO_CATEGORIES.includes(selectedCategory)) type = 'PHOTO';
    else if (MAKEUP_CATEGORIES.includes(selectedCategory)) type = 'MAKEUP';
    else if (CATERING_CATEGORIES.includes(selectedCategory)) type = 'CATERING';
    else if (DECOR_CATEGORIES.includes(selectedCategory)) type = 'DECOR';
    else if (DJ_CATEGORIES.includes(selectedCategory)) type = 'DJ';
    else if (JEWELRY_CATEGORIES.includes(selectedCategory)) type = 'JEWELRY';
    else if (LOGISTICS_CATEGORIES.includes(selectedCategory)) type = 'LOGISTICS';
    return type;
  }, [selectedCategory]);

  // Helper to render radio groups
  const renderRadioGroup = (title, options, name) => (
    <div>
      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt, idx) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" name={name} defaultChecked={idx === 0} className="w-4 h-4 accent-brand-primary cursor-pointer" />
            <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Helper to render checkbox groups
  const renderCheckboxGroup = (title, options) => (
    <div>
      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" />
            <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

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

        {/* Vendor Category Filter */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Explore Categories</h3>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto no-scrollbar pr-2">
            {activeCategories.slice(0, 10).map(cat => (
              <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={cat.label === selectedCategory} 
                    onChange={() => navigate(`/search?category=${encodeURIComponent(cat.label)}`)}
                    className="w-4 h-4 accent-brand-primary border-gray-300 cursor-pointer" 
                  />
                  <span className={`text-sm font-bold transition-colors ${cat.label === selectedCategory ? 'text-brand-primary' : 'text-gray-600 group-hover:text-brand-primary'}`}>{cat.label}</span>
                </div>
              </label>
            ))}
          </div>
          <button className="text-xs font-bold text-brand-primary mt-3 hover:underline">View all categories</button>
        </div>

        {/* Dynamic Filters Based on Category Type */}
        {filterSchema === 'VENUE' && (
          <>
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">In-House Services</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={inHouseCatering} onChange={(e) => handleInHouseChange('inHouseCatering', e.target.checked)} className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">Has In-house Catering</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={inHousePhotography} onChange={(e) => handleInHouseChange('inHousePhotography', e.target.checked)} className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">Has In-house Photography</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={inHouseDecorations} onChange={(e) => handleInHouseChange('inHouseDecorations', e.target.checked)} className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">Has In-house Decorations</span>
                </label>
              </div>
            </div>
            {renderCheckboxGroup('Guest Capacity', ['Less than 100', '100 to 250', '250 to 500', '500 to 1000', '1000 and above'])}
            {renderRadioGroup('Price Range (Per Plate/Rental)', ['Any Budget', '₹500 - ₹1,000', '₹1,000 - ₹2,000', '₹2,000 - ₹3,000', '₹3,000 +'], 'venue_price')}
            {renderCheckboxGroup('Amenities & Rules', ['Air Conditioned', 'Rooms Available', 'In-house Catering Only', 'Outside Decorators Allowed', 'Liquor Allowed', 'Valet Parking'])}
            {renderCheckboxGroup('Setting Type', ['Indoor Banquet', 'Outdoor Lawn', 'Poolside'])}
          </>
        )}

        {filterSchema === 'PHOTO' && (
          <>
            {renderCheckboxGroup('Services Offered', ['Traditional Photography', 'Candid Photography', 'Cinematic Videography', 'Pre-wedding Shoot', 'Drone Shoot'])}
            {renderRadioGroup('Price Range (Per Day)', ['Any Budget', 'Under ₹50,000', '₹50,000 - ₹1 Lakh', '₹1 Lakh - ₹2 Lakhs', '₹2 Lakhs +'], 'photo_price')}
            {renderCheckboxGroup('Features', ['Photo Album Included', 'Same Day Edit'])}
          </>
        )}

        {filterSchema === 'MAKEUP' && (
          <>
            {renderCheckboxGroup('Makeup Type', ['HD Makeup', 'Airbrush Makeup', 'Traditional', 'Party Makeup'])}
            {renderRadioGroup('Price Range (Per Event)', ['Any Budget', 'Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 +'], 'makeup_price')}
            {renderCheckboxGroup('Services Included', ['Travels to Venue', 'Trial Available', 'Hair Styling Included', 'Draping Included'])}
          </>
        )}

        {filterSchema === 'CATERING' && (
          <>
            {renderCheckboxGroup('Cuisine Types', ['Pure Veg Only', 'South Indian', 'North Indian', 'Continental', 'Multi-Cuisine'])}
            {renderRadioGroup('Price (Per Plate)', ['Any Budget', 'Under ₹500', '₹500 - ₹1,000', '₹1,000 +'], 'catering_price')}
            {renderCheckboxGroup('Special Features', ['Live Counters', 'Dessert Stations', 'Welcome Drinks'])}
          </>
        )}

        {filterSchema === 'DECOR' && (
          <>
            {renderCheckboxGroup('Core Services', ['Floral Decor', 'Mandap Setup', 'Lighting & Sound', 'Stage Backdrop'])}
            {renderCheckboxGroup('Style / Theme', ['Traditional', 'Modern', 'Minimalist', 'Royal Heritage'])}
            {renderRadioGroup('Budget Range', ['Any Budget', 'Under ₹1 Lakh', '₹1 Lakh - ₹3 Lakhs', '₹3 Lakhs +'], 'decor_budget')}
          </>
        )}

        {filterSchema === 'DJ' && (
          <>
            {renderCheckboxGroup('Music Genres', ['Bollywood', 'EDM / House', 'Regional / Folk', 'Classical / Instrumental'])}
            {renderCheckboxGroup('Setup Included', ['Sound System', 'LED Screens', 'Dance Floor Lighting', 'Smoke Machine'])}
            {renderRadioGroup('Price Range', ['Any Budget', 'Under ₹20,000', '₹20,000 - ₹50,000', '₹50,000 +'], 'dj_price')}
          </>
        )}

        {filterSchema === 'JEWELRY' && (
          <>
            {renderCheckboxGroup('Purchase Type', ['Buy', 'Rent'])}
            {renderCheckboxGroup('Style', ['Antique / Temple', 'Modern Contemporary', 'Kundan / Polki', 'Diamond'])}
            {renderRadioGroup('Price Range', ['Any Budget', 'Under ₹50,000', '₹50,000 - ₹1 Lakh', '₹1 Lakh +'], 'jewelry_price')}
          </>
        )}

        {filterSchema === 'LOGISTICS' && (
          <>
            {renderCheckboxGroup('Service Category', ['Luxury Cars', 'Vintage Cars', 'AC Buses', 'Digital Invites', 'Printed Box Invites'])}
            {renderCheckboxGroup('Features', ['Driver Included', 'Floral Decoration on Car', 'Custom Animations (Invites)'])}
            {renderRadioGroup('Price Range', ['Any Budget', 'Under ₹10,000', '₹10,000 - ₹30,000', '₹30,000 +'], 'logistics_price')}
          </>
        )}

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
