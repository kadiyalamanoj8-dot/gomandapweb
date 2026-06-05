import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, login, loginWithGoogle } = useAuth();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // phone -> otp
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (showLoginModal && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setIsLoading(true);
    
    // Format phone number with country code if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Ensure billing is enabled and domains are authorized in Firebase.");
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Sync verified phone number with our MongoDB backend
      const success = await login(user.phoneNumber);
      if (!success) {
        alert("Backend sync failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

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
          className="relative w-full max-w-md overflow-hidden bg-white/10 border border-white/20 shadow-2xl rounded-3xl backdrop-blur-xl"
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute z-10 p-2 text-white transition-colors rounded-full top-4 right-4 hover:bg-white/10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              {step === 'phone' ? 'Welcome to Gomandap' : 'Verify your number'}
            </h2>
            <p className="text-sm text-gray-300">
              {step === 'phone' 
                ? 'Sign in to contact vendors and save your favorites.' 
                : `We sent a code to ${phone}`}
            </p>
          </div>

          <div id="recaptcha-container"></div>

          {/* Form */}
          <div className="p-8 pt-0">
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full py-4 pl-12 pr-4 text-white transition-all border outline-none bg-black/20 border-white/10 rounded-xl focus:border-[#FFC107] focus:bg-black/40 placeholder:text-gray-500"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full flex items-center justify-center gap-2 py-4 font-bold text-black transition-all bg-[#FFC107] hover:bg-[#FFD54F] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>

                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative px-4 text-sm text-gray-400 bg-transparent backdrop-blur-xl">Or</div>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      loginWithGoogle(credentialResponse.credential);
                    }}
                    onError={() => {
                      console.log('Google Login Failed');
                    }}
                    useOneTap
                    theme="filled_black"
                    shape="pill"
                  />
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (Mock: any)"
                    className="w-full py-4 pl-12 pr-4 text-center tracking-widest text-white transition-all border outline-none bg-black/20 border-white/10 rounded-xl focus:border-[#FFC107] focus:bg-black/40 placeholder:text-gray-500"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || otp.length < 4}
                  className="w-full flex items-center justify-center gap-2 py-4 font-bold text-black transition-all bg-[#FFC107] hover:bg-[#FFD54F] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                  {!isLoading && <CheckCircle2 size={18} />}
                </button>
              </form>
            )}
            
            <div className="mt-6 text-xs text-center text-gray-400">
              By proceeding, you agree to Gomandap's Terms of Service & Privacy Policy.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
