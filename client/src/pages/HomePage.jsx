import React, { useMemo } from 'react';
import HeroParallax from '../components/home/HeroParallax';
import VisualCategoryGrid from '../components/home/VisualCategoryGrid';
import VendorCarousel from '../components/home/VendorCarousel';
import { CATEGORY_BUCKETS, FEATURED_VENDORS, generateFakeVendors } from '../data/mockData';

const HomePage = () => {
  return (
    <main className="w-full overflow-x-hidden bg-white -mt-[72px]">
      <HeroParallax />
      <div className="relative z-30 -mt-4 md:-mt-10 bg-white rounded-t-3xl md:rounded-none">
        <VisualCategoryGrid />
        
      </div>
    </main>
  );
};

export default HomePage;
