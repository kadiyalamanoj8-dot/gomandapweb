import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VendorProvider } from './context/VendorContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';

// Pages
import VendorLandingPage from './pages/vendor/VendorLandingPage';
import VendorOnboarding from './pages/vendor/VendorOnboarding';
import VendorPending from './pages/vendor/VendorPending';
import VendorDashboard from './pages/vendor/VendorDashboard';
import IntroScreen from './components/IntroScreen';
import Preloader from './components/Preloader';
import { HelmetProvider } from 'react-helmet-async';
import DynamicSEO from './components/DynamicSEO';

function AppContent() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const MINIMUM_LOAD_TIME = 3500; // Force loader for 3.5 seconds minimum

    // Heavy assets that cause layout pop-in on first load
    const imagesToPreload = [
      '/images/temple_background.webp',
      '/images/temple_mandap.webp',
      '/images/couple_transparent.webp',
      '/images/real_temple_doors.webp'
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
      <AnimatePresence>
        {!isPreloading && !hasEntered && <IntroScreen onComplete={() => setHasEntered(true)} />}
      </AnimatePresence>
      {!isPreloading && hasEntered && (
        <div className="font-sans antialiased text-gray-900 bg-white min-h-screen">
          <DynamicSEO appTarget="vendor" pageName="global" />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<VendorLandingPage />} />
              <Route path="/onboarding" element={<VendorOnboarding />} />
              <Route path="/pending" element={<VendorPending />} />
              <Route path="/dashboard" element={<VendorDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} /> 
            </Routes>
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
