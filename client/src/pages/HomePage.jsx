import { Suspense, lazy } from 'react';
import HeroParallax from '../components/home/HeroParallax';

const VisualCategoryGrid = lazy(() => import('../components/home/VisualCategoryGrid'));
const VendorCarousel = lazy(() => import('../components/home/VendorCarousel'));
import { CATEGORY_BUCKETS, FEATURED_VENDORS, generateFakeVendors } from '../data/mockData';

const HomePage = () => {
  return (
    <div className="w-full">
      {/* Hero — full viewport height, dark background fills edge to edge */}
      <HeroParallax />

      {/* Categories — white card starts below hero, no overlap */}
      <div className="relative z-[50] bg-white rounded-t-[1.5rem] sm:rounded-t-[2rem] mt-0 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <VisualCategoryGrid />
          </Suspense>
        </div>

        {/* --- RICH DATA SECTION (Premium Lanes) --- */}
        <div className="mt-8 space-y-12">
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 mx-4 md:mx-8 rounded-2xl"></div>}>
            <VendorCarousel 
              title="Trending this Week" 
              subtitle="The most sought-after venues and vendors across India."
              vendors={generateFakeVendors('All', 6).map(v => ({...v, isFeatured: true}))} 
              bgColor="bg-transparent"
            />
          </Suspense>

          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 mx-4 md:mx-8 rounded-2xl"></div>}>
            <div className="bg-gray-50 py-4 border-y border-gray-100">
              <VendorCarousel 
                title="Top Rated Photographers" 
                subtitle="Capture your perfect moments with elite studios."
                vendors={generateFakeVendors('Photographers', 6).map(v => ({...v, rating: '4.9'}))} 
                bgColor="bg-transparent"
              />
            </div>
          </Suspense>

          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 mx-4 md:mx-8 rounded-2xl"></div>}>
            <VendorCarousel 
              title="Budget Friendly Venues" 
              subtitle="Beautiful locations that won't break the bank."
              vendors={generateFakeVendors('Venues', 6).map(v => ({...v, pricePerPlate: '₹800'}))} 
              bgColor="bg-transparent"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
