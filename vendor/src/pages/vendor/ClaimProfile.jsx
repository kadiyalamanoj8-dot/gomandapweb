import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Building2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const ClaimProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    toast.success('Verification code sent to ' + phone);
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid code');
      return;
    }
    toast.success('Profile successfully claimed!');
    // Redirect to the onboarding or dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30">
              <ShieldCheck className="text-brand-gold" size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-center mb-2">Claim Your Profile</h1>
          <p className="text-white/50 text-center text-sm font-medium mb-8">
            You have 4 pending inquiries waiting. Verify your business to respond to them instantly.
          </p>

          <form onSubmit={step === 1 ? handleSendOtp : handleVerify}>
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2">Business Registered Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-brand-gold text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#FACC15] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Send Verification Code <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2">Enter 4-Digit Code</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • •"
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:border-brand-gold transition-colors"
                      maxLength={4}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-brand-gold text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#FACC15] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Verify & Claim <ShieldCheck size={18} />
                </button>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Building2 className="text-white/40" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Why are we asking this?</p>
                <p className="text-xs text-white/50 mt-1">
                  To protect your business identity, we require phone verification to ensure only authorized owners can access inquiries and change booking settings.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default ClaimProfile;
