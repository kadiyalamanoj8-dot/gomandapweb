import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setError(null);
      setIsLoading(true);
      
      const result = await loginWithGoogle(tokenResponse.access_token);
      
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.message || 'Authentication failed. Please try again.');
      }
    },
    onError: () => {
      setError('Google login popup was closed or failed to initialize.');
    }
  });



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
            className="relative w-full max-w-[850px] overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] rounded-[32px] flex flex-col md:flex-row"
          >
            {/* Left Side: Branding / Image */}
            <div className="hidden md:flex md:w-5/12 bg-gray-900 relative flex-col justify-between p-8 border-r border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/temple_background.webp')] opacity-20 mix-blend-screen object-cover pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0" />
              
              <div className="relative z-10">
                <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-8 w-auto object-contain mb-8 filter brightness-0 invert" />
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-black text-white leading-tight mb-3">
                  Your perfect event starts here.
                </h3>
                <p className="text-sm font-medium text-white/70 leading-relaxed">
                  Join thousands of families connecting with India's elite venues and vendors instantly.
                </p>
                <div className="mt-8 flex items-center gap-2">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800"><img src="https://i.pravatar.cc/100?img=10" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-700"><img src="https://i.pravatar.cc/100?img=11" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-600"><img src="https://i.pravatar.cc/100?img=12" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
                  </div>
                  <span className="text-xs font-bold text-white/80 ml-2">Trusted by 10k+ users</span>
                </div>
              </div>
            </div>
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

            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative bg-white">
              {/* Logo / Icon for Mobile Only */}
              <div className="mb-6 flex justify-center md:hidden">
                 <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center p-3 shadow-sm border border-brand-primary/20">
                   <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain drop-shadow-sm" />
                 </div>
              </div>
              
              <div className="text-center md:text-left mb-8 w-full">
                <h2 className="text-3xl md:text-[32px] font-black text-gray-900 mb-3 tracking-tight leading-tight">
                  Welcome Back
                </h2>
                <p className="text-[15px] text-gray-500 font-medium leading-relaxed">
                  Sign in with Google to contact vendors, save your favorite venues, and unlock exclusive deals.
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
                    className="w-full flex justify-center md:justify-start"
                  >
                    <button 
                      onClick={() => login()}
                      className="w-full md:w-auto flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 py-3.5 px-8 rounded-full font-bold transition-all shadow-sm border border-gray-200 hover:shadow-md active:scale-[0.98]"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                      Continue with Google
                    </button>
                  </motion.div>
                )}
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100 text-[11px] font-bold text-gray-400 text-center md:text-left px-2 uppercase tracking-widest leading-loose">
                Secure Authentication <br/>
                <span className="normal-case tracking-normal font-medium text-gray-500 text-xs mt-1 block">
                  By continuing, you agree to our <a href="/terms" className="text-brand-primary hover:underline font-bold">Terms</a> & <a href="/privacy" className="text-brand-primary hover:underline font-bold">Privacy Policy</a>
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
