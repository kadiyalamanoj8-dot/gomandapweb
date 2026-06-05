import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SpatialNavbar from './components/layout/SpatialNavbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VendorDetailsPage from './pages/VendorDetailsPage';
import CartDrawer from './components/layout/CartDrawer';
import { CartProvider } from './context/CartContext';
import { VendorProvider } from './context/VendorContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';
import IntroScreen from './components/IntroScreen';
import Preloader from './components/Preloader';
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/auth/LoginModal';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const location = useLocation();
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
    
    // Safety timeout in case images hang or fail to load on a bad connection
    const safetyTimeout = setTimeout(() => {
      setIsPreloading(false);
    }, 8000);

    imagesToPreload.forEach(async (src) => {
      const img = new Image();
      img.src = src;
      
      try {
        // Force the browser to decode the image on a background thread
        // This completely eliminates the GPU stutter when the parallax first renders
        await img.decode();
        handleImageLoad();
      } catch (err) {
        console.warn(`Failed to decode ${src}`, err);
        handleImageLoad(); // Still proceed so we don't hang
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
        <div className="font-sans antialiased text-gray-900 bg-white min-h-screen pb-16 md:pb-0">
      <SpatialNavbar />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<SearchPage />} />
          <Route path="/vendors" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendor/:id" element={<VendorDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="*" element={<HomePage />} /> 
        </Routes>
      </AnimatePresence>
      <Footer />
      <MobileBottomNav />
    </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <VendorProvider>
            <CartProvider>
              <AppContent />
              <LoginModal />
            </CartProvider>
          </VendorProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
