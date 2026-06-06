import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VendorProvider } from './context/VendorContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';

// Pages
const VendorLandingPage = lazy(() => import('./pages/vendor/VendorLandingPage'));
const VendorOnboarding = lazy(() => import('./pages/vendor/VendorOnboarding'));
const VendorPending = lazy(() => import('./pages/vendor/VendorPending'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorTerms = lazy(() => import('./pages/vendor/VendorTerms'));
const VendorPrivacy = lazy(() => import('./pages/vendor/VendorPrivacy'));
import Preloader from './components/Preloader';
import { HelmetProvider } from 'react-helmet-async';
import DynamicSEO from './components/DynamicSEO';

function AppContent() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const MINIMUM_LOAD_TIME = 500; // Small delay for smooth fade out

    // Heavy assets that cause layout pop-in on first load
    const imagesToPreload = [
      '/images/temple_background.webp',
      '/images/temple_mandap.webp',
      '/images/couple_transparent.webp'
    ];

    let loadedCount = 0;
    
    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      setIsPreloading(false);
    }, 8000);

    imagesToPreload.forEach(async (src) => {
      const img = new Image();
      img.src = src;
      
      try {
        await img.decode();
        handleImageLoad();
      } catch (err) {
        console.warn(`Failed to decode ${src}`, err);
        handleImageLoad();
      }
    });

    function handleImageLoad() {
      loadedCount++;
      const currentProgress = Math.round((loadedCount / imagesToPreload.length) * 100);
      setPreloadProgress(currentProgress);
      
      if (loadedCount === imagesToPreload.length) {
        clearTimeout(safetyTimeout);
        const elapsedTime = Date.now() - startTime;
        const timeToWait = Math.max(0, MINIMUM_LOAD_TIME - elapsedTime);
        
        // Ensure the progress bar visually hits 100% and stays for a moment
        setTimeout(() => setIsPreloading(false), timeToWait);
      }
    }
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isPreloading && <Preloader progress={preloadProgress} />}
      </AnimatePresence>
      {!isPreloading && (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-x-hidden">
          <DynamicSEO appTarget="vendor" pageName="global" />
          <AnimatePresence mode="wait">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]"><div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
                <Route path="/" element={<VendorLandingPage />} />
                <Route path="/onboarding" element={<VendorOnboarding />} />
                <Route path="/pending" element={<VendorPending />} />
                <Route path="/dashboard" element={<VendorDashboard />} />
                <Route path="/terms" element={<VendorTerms />} />
                <Route path="/privacy" element={<VendorPrivacy />} />
                <Route path="*" element={<Navigate to="/" replace />} /> 
              </Routes>
            </Suspense>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <SettingsProvider>
          <VendorProvider>
            <AppContent />
          </VendorProvider>
        </SettingsProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
