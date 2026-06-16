import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CategorySettings = lazy(() => import('./pages/CategorySettings'));
const LanguageSettings = lazy(() => import('./pages/LanguageSettings'));
const ClientManager = lazy(() => import('./pages/ClientManager'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const ClientUISettings = lazy(() => import('./pages/ClientUISettings'));
const FooterSettings = lazy(() => import('./pages/FooterSettings'));
const LeadsCRM = lazy(() => import('./pages/LeadsCRM'));
const MarketingCRM = lazy(() => import('./pages/MarketingCRM'));
const WhatsAppBot = lazy(() => import('./pages/WhatsAppBot'));
const AdManager = lazy(() => import('./pages/AdManager'));
const HelpRequestsCRM = lazy(() => import('./pages/HelpRequestsCRM'));
const TestimonialsManager = lazy(() => import('./pages/TestimonialsManager'));
const HomeContentSettings = lazy(() => import('./pages/HomeContentSettings'));
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Guard component — redirects to /login if not authenticated
const AuthGuard = ({ children }) => {
  const { isLoggedIn } = useAdminAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn } = useAdminAuth();
  const location = useLocation();

  // Don't render the layout shell on login page
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between bg-[#111111] border-b border-white/5 p-4 shrink-0">
          <img src="/logo.svg" alt="Gomandap" className="h-7 w-auto object-contain" />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Navigate to="/vendors" replace />} />
                  <Route path="/login" element={<Navigate to="/vendors" replace />} />
                  <Route path="/vendors" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
                  <Route path="/dashboard" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
                  <Route path="/category-settings" element={<AuthGuard><CategorySettings /></AuthGuard>} />
                  <Route path="/language-settings" element={<AuthGuard><LanguageSettings /></AuthGuard>} />
                  <Route path="/clients" element={<AuthGuard><ClientManager /></AuthGuard>} />
                  <Route path="/client-ui" element={<AuthGuard><ClientUISettings /></AuthGuard>} />
                  <Route path="/footer-settings" element={<AuthGuard><FooterSettings /></AuthGuard>} />
                  <Route path="/leads" element={<AuthGuard><LeadsCRM /></AuthGuard>} />
                  <Route path="/marketing" element={<AuthGuard><MarketingCRM /></AuthGuard>} />
                  <Route path="/whatsapp-bot" element={<AuthGuard><WhatsAppBot /></AuthGuard>} />
                  <Route path="/ad-manager" element={<AuthGuard><AdManager /></AuthGuard>} />
                  <Route path="/help-requests" element={<AuthGuard><HelpRequestsCRM /></AuthGuard>} />
                  <Route path="/testimonials" element={<AuthGuard><TestimonialsManager /></AuthGuard>} />
                  <Route path="/home-content" element={<AuthGuard><HomeContentSettings /></AuthGuard>} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111111',
              color: '#fff',
              fontWeight: '700',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
