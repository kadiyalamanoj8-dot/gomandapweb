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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <Phone size={16} />
                <span className="font-medium tracking-wide">{user.phoneNumber || '+91 XXXX XXXX'}</span>
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Verified</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-full font-bold transition-colors"
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
              <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm"><History size={20} className="text-gray-500" /></div>
                  <div>
                    <p className="font-bold text-gray-800">Login via OTP</p>
                    <p className="text-sm text-gray-500">Device: {navigator.userAgent.substring(0,30)}...</p>
                  </div>
                </div>
                <div className="text-right">
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
