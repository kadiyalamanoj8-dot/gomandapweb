import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileCard = ({ user, onLogout, role = 'Vendor', isEditingProfile, setIsEditingProfile, onCancel, onSave, isSaving }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10"
    >
      <div className="flex items-center gap-6 w-full md:w-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full border-4 border-brand-gold/30 shadow-lg overflow-hidden shrink-0 bg-brand-gold/10 flex items-center justify-center text-brand-gold"
        >
          {user.portfolioImages?.[0] || user.photoUrl || user.imageUrl ? (
            <img 
              src={user.portfolioImages?.[0] || user.photoUrl || user.imageUrl} 
              alt={user.name} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={40} />
          )}
        </motion.div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-bold border border-brand-gold/20 uppercase tracking-widest">
              {role} Account
            </span>
            {(user.email || user.contact?.phone) && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest flex items-center gap-1">
                <Shield size={10} /> Verified
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">
            {user.name || user.ownerName || 'Welcome'}
          </h2>
          <span className="text-white/60 text-sm font-semibold">
            {user.category || user.email || user.contact?.phone}
          </span>
        </div>
      </div>
      
      {/* Vendor Profile Edit / Save Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {!isEditingProfile ? (
          <>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="px-6 py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-brand-gold transition-colors shadow-lg shadow-brand-gold/20 w-full sm:w-auto"
            >
              Edit Profile
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-colors w-full sm:w-auto"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors w-full sm:w-auto border border-transparent"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-brand-gold transition-colors shadow-lg shadow-brand-gold/20 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
