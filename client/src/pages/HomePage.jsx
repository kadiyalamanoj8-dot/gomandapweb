import { Suspense, lazy } from 'react';
import HeroParallax from '../components/home/HeroParallax';

const VisualCategoryGrid = lazy(() => import('../components/home/VisualCategoryGrid'));
const VendorCarousel = lazy(() => import('../components/home/VendorCarousel'));
import { CATEGORY_BUCKETS, FEATURED_VENDORS, generateFakeVendors } from '../data/mockData';

const HomePage = () => {
  return (
    <main className="w-full overflow-x-hidden bg-white">
      <HeroParallax />
      <div className="relative z-30 -mt-4 md:-mt-10 bg-white rounded-t-3xl md:rounded-none">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Categories...</div>}>
          <VisualCategoryGrid />
        </Suspense>
      </div>
    </main>
  );
};

export default HomePage;
