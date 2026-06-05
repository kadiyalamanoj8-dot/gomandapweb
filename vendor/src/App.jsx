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

function AppContent() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!hasEntered && <IntroScreen onComplete={() => setHasEntered(true)} />}
      </AnimatePresence>
      {hasEntered && (
        <div className="font-sans antialiased text-gray-900 bg-white min-h-screen">
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
    <Router>
      <SettingsProvider>
        <VendorProvider>
          <AppContent />
        </VendorProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
