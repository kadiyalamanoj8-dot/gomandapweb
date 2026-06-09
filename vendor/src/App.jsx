import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VendorProvider } from './context/VendorContext';
import { SettingsProvider } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';

// Pages
const VendorLandingPage = lazy(() => import('./pages/vendor/VendorLandingPage'));
const VendorLogin = lazy(() => import('./pages/vendor/VendorLogin'));
const VendorOnboarding = lazy(() => import('./pages/vendor/VendorOnboarding'));
const CategoryOnboarding = lazy(() => import('./pages/vendor/CategoryOnboarding'));
const VendorPending = lazy(() => import('./pages/vendor/VendorPending'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorTerms = lazy(() => import('./pages/vendor/VendorTerms'));
const VendorPrivacy = lazy(() => import('./pages/vendor/VendorPrivacy'));
import Preloader from './components/Preloader';
import { HelmetProvider } from 'react-helmet-async';
import DynamicSEO from './components/DynamicSEO';
import { Toaster } from 'react-hot-toast';

function AppContent() {
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
        await img.decode();
      } catch (err) {
        // Silently ignore decode errors
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <DynamicSEO appTarget="vendor" pageName="global" />
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]"><div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<VendorLandingPage />} />
            <Route path="/login" element={<VendorLogin />} />
            <Route path="/onboarding" element={<VendorOnboarding />} />
            <Route path="/onboarding/:category" element={<CategoryOnboarding />} />
            <Route path="/pending" element={<VendorPending />} />
            <Route path="/dashboard" element={<VendorDashboard />} />
            <Route path="/terms" element={<VendorTerms />} />
            <Route path="/privacy" element={<VendorPrivacy />} />
            <Route path="*" element={<Navigate to="/" replace />} /> 
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

import { GoogleOAuthProvider } from '@react-oauth/google';

import { GOOGLE_CLIENT_ID } from './config/api';

function App() {
  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <SettingsProvider>
            <VendorProvider>
              <AppContent />
            </VendorProvider>
          </SettingsProvider>
        </Router>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
