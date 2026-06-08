import React from 'react';
import { LogOut, User, Phone, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileCard = ({ user, onLogout, role = 'Client' }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col md:flex-row items-center md:items-start justify-between gap-6"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full">
        {user.profilePicture || user.photoUrl ? (
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            src={user.profilePicture || user.photoUrl} 
            alt="Profile" 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-brand-primary/20 object-cover shadow-sm shrink-0" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 md:w-28 md:h-28 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0">
            <User size={40} />
          </div>
        )}
        
        <div className="text-center md:text-left flex-1 space-y-2">
          <div className="flex flex-col items-center md:items-start">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-full mb-2">
              {role} Account
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {user.name ? `Welcome, ${user.name}` : 'Welcome Back'}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600 mt-2">
            {(user.email || user.phoneNumber) && (
              <div className="flex items-center gap-1.5 font-medium tracking-wide">
                <Shield size={16} className="shrink-0 text-green-600" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {user.email || user.phoneNumber}
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full shrink-0">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-full font-bold transition-colors shrink-0"
      >
        <LogOut size={18} />
        Sign Out
      </motion.button>
    </motion.div>
  );
};

export default ProfileCard;
