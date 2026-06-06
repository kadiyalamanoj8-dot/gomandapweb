import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, loginWithGoogle } = useAuth();

  if (!showLoginModal) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden bg-[#111111] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-[2.5rem] backdrop-blur-xl"
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute z-10 p-2 text-white/50 transition-colors rounded-full top-5 right-5 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <div className="mb-6">
               <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] mx-auto p-4">
                 <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain" />
               </div>
            </div>
            <h2 className="text-[26px] font-black text-white mb-2 tracking-tight">
              Welcome to Gomandap
            </h2>
            <p className="text-[15px] text-white/50 font-medium mb-8">
              Sign in with Google to contact vendors and save your favorites.
            </p>

            {/* Google Login Only */}
            <div className="w-full flex justify-center py-2">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  loginWithGoogle(credentialResponse.credential);
                }}
                onError={() => {
                  console.error('Google Login Failed');
                  alert('Login failed. Please try again.');
                }}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>
            
            <div className="mt-8 text-xs font-medium text-white/30 text-center px-4 leading-relaxed">
              By proceeding, you agree to Gomandap's Terms of Service & Privacy Policy.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
