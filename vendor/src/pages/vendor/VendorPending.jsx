import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { Clock, ShieldCheck, AlertCircle, Edit, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorPending = () => {
  const { vendorProfile, simulateAdminApproval } = useVendor();
  const navigate = useNavigate();

  if (!vendorProfile) {
    navigate('/');
    return null;
  }

  const handleSimulateApproval = () => {
    simulateAdminApproval();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative font-sans">
      {/* Immersive Dark Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/images/temple_background.webp" 
          alt="Premium Event Background" 
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/60 via-black/80 to-black"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="max-w-lg w-full bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 text-center relative overflow-hidden z-10"
      >
        {/* Top Edge Highlight */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${vendorProfile.status === 'rejected_with_feedback' ? 'bg-red-500' : 'bg-gradient-to-r from-transparent via-brand-gold to-transparent'}`}></div>
        
        {vendorProfile.status === 'rejected_with_feedback' ? (
          <>
            <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Action Required</h1>
            <p className="text-[15px] font-medium text-white/60 mb-8 leading-relaxed max-w-sm mx-auto">
              Our Trust & Safety team has reviewed your profile and requested some changes before activating your Business dashboard.
            </p>
            
            <div className="bg-white/5 border border-red-500/30 rounded-2xl p-5 text-left mb-10 space-y-4 backdrop-blur-md">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Admin Feedback
              </h3>
              {vendorProfile.adminFeedback?.map((fb, i) => (
                <div key={i} className="text-sm bg-black/50 p-4 rounded-xl border border-white/5">
                  <span className="font-black text-white/90 block mb-1">{fb.field}</span>
                  <span className="text-white/60 font-medium leading-relaxed">{fb.message}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full bg-white/10 text-white py-4 rounded-xl font-bold text-[15px] hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 shadow-lg"
            >
              <Edit size={18} /> Update Application
            </button>
          </>
        ) : (
          <>
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Pulsing Gold Glow */}
              <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-[30px] animate-pulse"></div>
              <div className="relative w-full h-full bg-black/50 border border-brand-gold/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-md">
                <Clock size={40} className="text-brand-gold" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                  <Sparkles size={14} className="text-black" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Awaiting Verification</h1>
            <p className="text-[15px] font-medium text-white/60 mb-10 leading-relaxed max-w-sm mx-auto">
              Thank you for registering <strong className="text-white">{vendorProfile.name}</strong>. Our partner success team is reviewing your details to ensure the highest quality standards.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4 text-left mb-10 backdrop-blur-md group hover:bg-white/10 transition-colors">
              <ShieldCheck size={24} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[15px] font-bold text-white mb-1">Quality Assurance</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Your profile is currently under review. This process usually takes 24-48 hours. You will receive an email once approved.
                </p>
              </div>
            </div>

            {/* Hidden button to simulate approval since we don't have Supabase connected yet */}
            <button 
              onClick={handleSimulateApproval}
              className="w-full bg-brand-gold text-black py-4 rounded-xl font-black text-[15px] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all"
            >
              [Dev Only] Simulate Approval
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VendorPending;
