import { Suspense, lazy } from 'react';
import HeroParallax from '../components/home/HeroParallax';

const VisualCategoryGrid = lazy(() => import('../components/home/VisualCategoryGrid'));
const VendorCarousel = lazy(() => import('../components/home/VendorCarousel'));
import { CATEGORY_BUCKETS, FEATURED_VENDORS, generateFakeVendors } from '../data/mockData';

const HomePage = () => {
  return (
    <main className="w-full overflow-x-hidden">
      <HeroParallax />
      <div className="relative z-[50] bg-white rounded-t-3xl -mt-10 md:-mt-16 pt-6 md:pt-10">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Categories...</div>}>
          <VisualCategoryGrid />
        </Suspense>
      </div>
    </main>
  );
};

export default HomePage;
