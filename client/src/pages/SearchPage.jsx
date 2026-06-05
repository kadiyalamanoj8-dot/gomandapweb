import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../data/mockData';
import LiquidVendorCard from '../components/common/LiquidVendorCard';
import FilterSidebar from '../components/search/FilterSidebar';
import { SlidersHorizontal, ChevronRight, Home, ArrowUpDown } from 'lucide-react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import CustomDropdown from '../components/ui/CustomDropdown';

const SearchPage = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Read category and location from URL query param
  // Fallback to "Banquet Halls"
  const targetCategoryLabel = searchParams.get('category') || 'Banquet Halls';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const locName = searchParams.get('locName');
  
  const [sortOption, setSortOption] = useState('Popularity');
  
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const inHouseCatering = searchParams.get('inHouseCatering') === 'true';
        const inHousePhotography = searchParams.get('inHousePhotography') === 'true';
        const inHouseDecorations = searchParams.get('inHouseDecorations') === 'true';

        let url = `http://localhost:5000/api/vendors?category=${encodeURIComponent(targetCategoryLabel)}`;
        if (inHouseCatering) url += `&inHouseCatering=true`;
        if (inHousePhotography) url += `&inHousePhotography=true`;
        if (inHouseDecorations) url += `&inHouseDecorations=true`;
        
        if (lat && lng) {
          url += `&lat=${lat}&lng=${lng}&radiusInKm=50`;
        } else if (locName) {
          url += `&locName=${encodeURIComponent(locName)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          // Map MongoDB schema to the shape expected by LiquidVendorCard
          const mappedData = data.data.map(v => ({
            id: v._id,
            name: v.name,
            category: v.category,
            location: v.address?.city ? `${v.address.city}, India` : 'India',
            imageUrl: v.portfolioImages?.length > 0 ? v.portfolioImages[0] : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
            pricePerPlate: v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
            rating: v.rating || 5.0,
            reviewsCount: v.reviewsCount || 0,
            // Keep original deep structure for VendorDetailsPage
            deepFeatures: v.deepFeatures,
            portfolioImages: v.portfolioImages,
            contact: v.contact,
            pricingPackages: v.customBlocks?.pricingPackages || []
          }));
          setSearchResults(mappedData);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, [targetCategoryLabel, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-28 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumbs (WeddingBazaar Style) */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest overflow-x-auto no-scrollbar pb-1">
          <Link to="/" className="hover:text-brand-primary flex items-center gap-1 transition-colors shrink-0">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="shrink-0">Vendors</span>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-brand-primary shrink-0">{targetCategoryLabel}</span>
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {targetCategoryLabel} {locName ? `near ${locName}` : 'in India'}
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">
              Showing {searchResults.length} handpicked {targetCategoryLabel.toLowerCase()}
            </p>
          </div>
          
          <div className="flex w-full md:w-auto items-center justify-between gap-3">
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex flex-1 justify-center items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-3 rounded-xl text-sm font-black text-brand-primary shadow-sm hover:bg-brand-primary/20 transition-colors"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex flex-1 md:flex-none justify-between md:justify-start items-center gap-3">
              <span className="text-sm text-gray-500 font-bold hidden md:inline whitespace-nowrap">Sort by:</span>
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

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative items-start">
          
          {/* Sidebar */}
          <FilterSidebar isMobileOpen={isMobileFiltersOpen} setIsMobileOpen={setIsMobileFiltersOpen} selectedCategory={targetCategoryLabel} />

          {/* Results List (WeddingBazaar uses massive horizontal lists, not grids) */}
          <div className="flex-1 w-full">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="py-20 text-center text-gray-500 font-bold text-lg animate-pulse">Loading verified vendors...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-bold text-lg">No vendors found in this category yet. Be the first to join!</div>
              ) : (
                searchResults.map((vendor) => (
                  <LiquidVendorCard key={vendor.id} vendor={vendor} layout="list" />
                ))
              )}
            </div>
            
            {/* Pagination / Load More */}
            <div className="mt-8 flex justify-center pb-8">
              <button className="bg-white border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-xl font-black hover:bg-brand-primary hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Load More Results
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
