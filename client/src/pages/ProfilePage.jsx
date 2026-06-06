import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Phone, MapPin, Calendar, Shield, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-gray-50/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Personal Info */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-brand-primary/20 object-cover shadow-sm shrink-0" />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0">
                <User size={40} />
              </div>
            )}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {user.name ? `Welcome, ${user.name}` : 'Welcome Back'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-gray-600 mt-2">
                <Phone size={16} className="shrink-0" />
                <span className="font-medium tracking-wide truncate max-w-[200px] sm:max-w-none">{user.phoneNumber || user.email}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full shrink-0">Verified</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-full font-bold transition-colors shrink-0"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Saved Vendors */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <MapPin className="text-brand-primary" />
              Saved Vendors
            </h2>
            <div className="text-center py-10 text-gray-400">
              <p>No saved vendors yet.</p>
              <button onClick={() => navigate('/vendors')} className="mt-4 text-brand-primary font-bold hover:underline">Explore Vendors</button>
            </div>
          </div>

          {/* Inquiries */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Calendar className="text-brand-primary" />
              My Inquiries
            </h2>
            <div className="text-center py-10 text-gray-400">
              <p>You haven't contacted any vendors yet.</p>
            </div>
          </div>
        </div>

        {/* Login Security History */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-gray-800">
            <Shield className="text-brand-primary" />
            Security & Login History
          </h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm shrink-0"><History size={20} className="text-gray-500" /></div>
                  <div>
                    <p className="font-bold text-gray-800">Login via OTP</p>
                    <p className="text-sm text-gray-500 line-clamp-1">Device: {navigator.userAgent.substring(0,30)}...</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pl-12 sm:pl-0">
                  <p className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">Successful</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
