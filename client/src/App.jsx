import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SpatialNavbar from './components/layout/SpatialNavbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import { CartProvider } from './context/CartContext';
import { VendorProvider } from './context/VendorContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/auth/LoginModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import DynamicSEO from './components/DynamicSEO';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const VendorDetailsPage = lazy(() => import('./pages/VendorDetailsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

function AppContent() {
  const location = useLocation();
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
      {!isPreloading && (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          <DynamicSEO appTarget="client" pageName="global" />
          <SpatialNavbar />
          <main className="flex-grow w-full">
            <CartDrawer />
            <AnimatePresence mode="wait">
              <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/venues" element={<SearchPage />} />
                  <Route path="/vendors" element={<SearchPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/vendor/:id" element={<VendorDetailsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId="525881024479-s9c7umr8e5r5mrtqdld53o6o1mvar4l0.apps.googleusercontent.com">
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
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
