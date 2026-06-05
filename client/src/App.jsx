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

function AppContent() {
  const location = useLocation();
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!hasEntered && <IntroScreen onComplete={() => setHasEntered(true)} />}
      </AnimatePresence>
      {hasEntered && (
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
      <SettingsProvider>
        <VendorProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </VendorProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
