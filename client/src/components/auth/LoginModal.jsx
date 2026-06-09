import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsLoading(true);
    
    const result = await loginWithGoogle(credentialResponse.credential);
    
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login popup was closed or failed to initialize.');
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div 
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-[32px]"
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setError(null);
              }}
              disabled={isLoading}
              className="absolute z-10 p-2 text-gray-400 transition-colors rounded-full bg-gray-50 top-5 right-5 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              aria-label="Close Login Modal"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 flex flex-col items-center">
              {/* Logo / Icon */}
              <div className="mb-6 flex justify-center">
                 <div className="w-20 h-20 bg-brand-primary/10 rounded-[24px] flex items-center justify-center p-4 shadow-sm border border-brand-primary/20">
                   <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain drop-shadow-sm" />
                 </div>
              </div>
              
              <div className="text-center mb-8 w-full">
                <h2 className="text-[28px] font-black text-gray-900 mb-3 tracking-tight leading-tight">
                  Welcome to Gomandap
                </h2>
                <p className="text-[15px] text-gray-500 font-medium leading-relaxed">
                  Sign in with Google to contact vendors, save venues, and unlock exclusive deals.
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="w-full bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-2xl flex items-start gap-3 border border-red-100"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Area */}
              <div className="w-full flex flex-col items-center relative min-h-[50px]">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex flex-col items-center justify-center py-2"
                  >
                    <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-3"></div>
                    <span className="text-sm font-bold text-gray-600 animate-pulse">Verifying securely...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex justify-center"
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false} // Disable oneTap inside modal to avoid UX confusion
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      width="340px"
                      text="continue_with"
                    />
                  </motion.div>
                )}
              </div>
              
              <div className="mt-8 text-[11px] font-bold text-gray-400 text-center px-4 uppercase tracking-widest leading-loose">
                Secure Authentication <br/>
                <span className="normal-case tracking-normal font-medium text-gray-400 text-xs mt-1 block">
                  By continuing, you agree to our <a href="/terms" className="text-brand-primary hover:underline">Terms</a> & <a href="/privacy" className="text-brand-primary hover:underline">Privacy Policy</a>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
