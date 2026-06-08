import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Phone, MapPin, Calendar, Shield, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ProfileCard from '../components/auth/ProfileCard';

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
    <div className="min-h-[calc(100dvh-65px)] md:min-h-screen pt-32 pb-8 md:pb-24 px-4 bg-gray-50/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Personal Info via Premium ProfileCard */}
        <ProfileCard user={user} onLogout={handleLogout} role="Client" />

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
