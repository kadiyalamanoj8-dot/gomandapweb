import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, Building2, Star, ArrowLeft } from 'lucide-react';
import { useVendor } from '../../context/VendorContext';
import { useGoogleLogin } from '@react-oauth/google';
import DynamicSEO from '../../components/DynamicSEO';

const VendorLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendorStatus, loginWithGoogle } = useVendor();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleCredential(tokenResponse.access_token),
    onError: () => {
      console.error('Google Login Failed');
      alert("Login failed.");
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (vendorStatus !== 'unregistered') {
      if (vendorStatus === 'draft') navigate('/onboarding');
      else navigate('/dashboard');
    }
  }, [vendorStatus, navigate]);

  const handleGoogleCredential = async (credential) => {
    setIsLoading(true);
    try {
      const res = await loginWithGoogle(credential);
      if (res.success) {
        if (res.action === 'dashboard') navigate('/dashboard');
        else navigate('/onboarding', { state: { email: res.email, googleId: res.googleId, name: res.name, photoUrl: res.photoUrl, selectedCategory: location.state?.selectedCategory } });
      } else {
        alert("Backend sync failed.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-sans selection:bg-brand-gold/20 overflow-hidden">
      <DynamicSEO appTarget="vendor" pageName="Vendor Login" />

      {/* LEFT SIDE: Brand & Value Prop (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-black flex-col justify-between p-12 border-r border-white/10 z-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/temple_background.webp')] opacity-10 mix-blend-screen object-cover pointer-events-none" />
        
        {/* Top Header */}
        <div className="relative z-20">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-20 max-w-lg mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-black tracking-widest uppercase mb-6">
              <Building2 size={14} /> Premium Vendor Portal
            </div>
            <h1 className="text-4xl xl:text-[52px] font-black text-white tracking-tighter leading-[1.1] mb-6">
              Grow your business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FACC15]">Gomandap.</span>
            </h1>
            <p className="text-lg text-white/60 font-medium leading-relaxed mb-10">
              Join thousands of India's elite venues, decorators, and wedding professionals connecting directly with high-intent families.
            </p>

            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-white/90 font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
                  <CheckCircle2 className="text-brand-gold" size={18} />
                </div>
                Zero Subscription Fees
              </li>
              <li className="flex items-center gap-4 text-white/90 font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
                  <CheckCircle2 className="text-brand-gold" size={18} />
                </div>
                Ultra-Low Transparent Commissions
              </li>
              <li className="flex items-center gap-4 text-white/90 font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
                  <CheckCircle2 className="text-brand-gold" size={18} />
                </div>
                Instant, Verified Direct Leads
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-20 mt-20 border-t border-white/10 pt-8 flex items-center gap-6">
          <div className="flex -space-x-4">
            <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-800"><img src="https://i.pravatar.cc/100?img=1" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
            <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-700"><img src="https://i.pravatar.cc/100?img=2" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
            <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-600"><img src="https://i.pravatar.cc/100?img=3" className="rounded-full w-full h-full object-cover" alt="avatar" /></div>
            <div className="w-12 h-12 rounded-full border-2 border-black bg-[#D4AF37] flex items-center justify-center text-xs font-black text-black">+2k</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-brand-gold mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-sm font-medium text-white/60">Trusted by over 2,000+ top vendors</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#050505]">
        
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-8 w-auto object-contain" />
          </Link>
          <Link to="/" className="text-sm font-bold text-white/60 hover:text-white flex items-center gap-1">
            Cancel
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-[15px] text-white/50 font-medium leading-relaxed">
                Sign in with Google to access your professional vendor dashboard and manage your bookings.
              </p>
            </div>

            <div className="w-full space-y-4">
              {isLoading ? (
                <div className="w-full py-10 flex flex-col items-center justify-center bg-black/20 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                  <span className="text-white/60 font-bold text-sm tracking-wide">Authenticating...</span>
                </div>
              ) : (
                <div className="flex justify-center w-full py-2">
                  <button 
                    onClick={() => login()}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-[#111] py-3.5 px-6 rounded-full font-black text-[15px] transition-all shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)] active:scale-[0.98] border border-white/20"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                    Continue with Google
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                By continuing, you agree to Gomandap's <br className="hidden sm:block" />
                <Link to="/terms" className="text-white/60 hover:text-brand-gold transition-colors underline underline-offset-4">Terms of Service</Link> and <Link to="/privacy" className="text-white/60 hover:text-brand-gold transition-colors underline underline-offset-4">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Back to Home Link for Desktop */}
        <Link to="/" className="absolute top-8 right-8 hidden lg:flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <ArrowLeft size={16} /> Back to Gomandap
        </Link>
      </div>

    </div>
  );
};

export default VendorLogin;
