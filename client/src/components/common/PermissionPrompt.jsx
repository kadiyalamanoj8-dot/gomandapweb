import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, X, ShieldCheck } from 'lucide-react';

const PermissionPrompt = ({ isOpen, type, onClose, onAccept }) => {
  if (!isOpen) return null;

  const content = {
    location: {
      icon: <MapPin className="w-8 h-8 text-brand-primary" />,
      title: "Find Vendors Near You",
      description: "Allow Gomandap to use your location so we can instantly show you the best banquet halls and wedding vendors right in your city.",
      acceptText: "Allow Location",
      rejectText: "Not Now",
      gradient: "from-amber-400/20 to-orange-500/20",
      glow: "shadow-[0_0_30px_rgba(255,193,7,0.4)]"
    },
    notifications: {
      icon: <Bell className="w-8 h-8 text-blue-400" />,
      title: "Never Miss an Update",
      description: "Enable push notifications to get instant alerts when vendors reply to your inquiries, send quotes, or confirm your bookings.",
      acceptText: "Enable Notifications",
      rejectText: "Maybe Later",
      gradient: "from-blue-400/20 to-indigo-500/20",
      glow: "shadow-[0_0_30px_rgba(96,165,250,0.4)]"
    }
  };

  const current = content[type] || content.location;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl"
        >
          {/* Background Glow */}
          <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${current.gradient} opacity-50 pointer-events-none blur-3xl`} />
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors z-10 bg-white/5 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center relative z-10 mt-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-white/10 mb-6 ${current.glow}`}>
              {current.icon}
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-3">
              {current.title}
            </h2>
            
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 px-2">
              {current.description}
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={onAccept}
                className="w-full py-4 rounded-xl font-bold text-black bg-brand-primary hover:bg-[#E6B000] transition-colors shadow-[0_5px_20px_rgba(255,193,7,0.3)] flex items-center justify-center gap-2"
              >
                {current.acceptText}
                <ShieldCheck className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              >
                {current.rejectText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PermissionPrompt;
