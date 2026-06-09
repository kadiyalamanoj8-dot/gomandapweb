import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, loginWithGoogle, login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // AnimatePresence should ideally wrap the modal from outside, 
  // but if it's inside, the modal needs to be unconditionally rendered by the parent.
  // In App.jsx, <LoginModal /> is unconditionally rendered.
  // So we put AnimatePresence here and wrap the inner content conditionally.

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(phoneNumber);
      if (!success) {
        alert("Failed to login with phone number. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
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
            className="relative w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem]"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute z-10 p-2 text-gray-400 transition-colors rounded-full bg-gray-50 top-5 right-5 hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-8 md:p-10 flex flex-col">
              <div className="mb-6 flex justify-center">
                 <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                   <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain" />
                 </div>
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-[24px] font-black text-gray-900 mb-2 tracking-tight">
                  Welcome to Gomandap
                </h2>
                <p className="text-[14px] text-gray-500 font-medium">
                  Sign in or create an account to save vendors and get exclusive deals.
                </p>
              </div>

              {/* Phone Login Form */}
              <form onSubmit={handlePhoneSubmit} className="mb-6">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter Phone Number"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-brand-primary focus:border-brand-primary block pl-11 p-3.5 font-semibold outline-none transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 text-white bg-brand-primary hover:bg-brand-primary-hover focus:ring-4 focus:outline-none focus:ring-brand-primary/30 font-black rounded-2xl text-sm px-5 py-3.5 text-center shadow-md active:scale-95 transition-all disabled:opacity-70"
                >
                  {isLoading ? 'Signing In...' : (
                    <>Continue <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center mb-6">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Google Login */}
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    loginWithGoogle(credentialResponse.credential);
                  }}
                  onError={() => {
                    console.error('Google Login Failed');
                    alert('Login failed. Please try again.');
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>
              
              <div className="mt-8 text-xs font-medium text-gray-400 text-center px-2 leading-relaxed">
                By continuing, you agree to our <a href="/terms" className="text-brand-primary hover:underline">Terms of Service</a> & <a href="/privacy" className="text-brand-primary hover:underline">Privacy Policy</a>.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
