import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import HeroParallax from '../components/home/HeroParallax';
import WhyGoMandap from '../components/home/WhyGoMandap';
import Testimonials from '../components/home/Testimonials';

const VisualCategoryGrid = lazy(() => import('../components/home/VisualCategoryGrid'));

const HomePage = () => {
  return (
    <div className="w-full">
      {/* Hero — full viewport height, dark background fills edge to edge */}
      <HeroParallax />

      {/* Categories — white card starts below hero, no overlap */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-[50] bg-white rounded-t-[1.5rem] sm:rounded-t-[2rem] mt-0 shadow-[0_-8px_32px_rgba(0,0,0,0.15)]"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <VisualCategoryGrid />
          </Suspense>
        </div>
      </motion.div>

      {/* New Why GoMandap and Testimonials Sections */}
      <WhyGoMandap />
      <Testimonials />
    </div>
  );
};

export default HomePage;
