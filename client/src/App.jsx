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

// Routes where the Footer should be hidden on MOBILE (bottom nav is enough)
const MOBILE_NO_FOOTER_ROUTES = ['/profile', '/saved'];

function AppContent() {
  const location = useLocation();
  const hideMobileFooter = MOBILE_NO_FOOTER_ROUTES.some(r => location.pathname === r) || location.pathname.startsWith('/vendor/');

  React.useEffect(() => {
    // Heavy assets that cause layout pop-in on first load
    const imagesToPreload = [
      '/images/temple_background.webp',
      '/images/temple_mandap.webp',
      '/images/couple_transparent.webp'
    ];

    imagesToPreload.forEach(async (src) => {
      const img = new Image();
      img.src = src;
      try {
        // Force the browser to decode the image on a background thread
        // This eliminates the GPU stutter when the parallax first renders
        await img.decode();
      } catch (err) {
        // Silently ignore decode errors
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <DynamicSEO appTarget="client" pageName="global" />
      <SpatialNavbar />
      <main className="flex-grow w-full">
        <CartDrawer />
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="min-h-screen w-full bg-black flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
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
      {/* Hide footer on mobile for profile/vendor-detail — bottom nav handles it */}
      <div className={hideMobileFooter ? 'hidden md:block' : 'block'}>
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
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
