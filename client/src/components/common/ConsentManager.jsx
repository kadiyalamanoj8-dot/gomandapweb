import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConsentManager = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('gomandap_cookie_consent');
    if (!hasConsented) {
      // Delay showing it slightly so it doesn't interrupt the initial hero animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('gomandap_cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('gomandap_cookie_consent', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[450px] z-[9999]"
        >
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden relative">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent pointer-events-none" />
            
            <button 
              onClick={handleReject}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                  We Value Your Privacy
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your browsing experience, serve personalized recommendations, and analyze our traffic. 
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleAcceptAll}
                    className="flex-1 bg-brand-primary text-black font-bold py-2.5 rounded-xl hover:bg-[#E6B000] transition-colors shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                  >
                    Accept All
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Essential Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentManager;
