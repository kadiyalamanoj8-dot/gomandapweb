import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ChevronDown, ChevronUp, Smartphone, Globe, 
  Clock, Shield, Search, X, LogIn, Bookmark, MessageSquare,
  TrendingUp, Calendar, User, CheckCircle, AlertCircle, MapPin, Navigation
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateStr);
};

const AuthProviderBadge = ({ provider }) => {
  const isGoogle = provider === 'google';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold ${
      isGoogle ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
    }`}>
      {isGoogle ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ) : (
        <Smartphone size={10} />
      )}
      {isGoogle ? 'Google' : 'Phone'}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    className={`bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 flex items-center gap-4`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[13px] text-white/40 font-medium">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </motion.div>
);

const ClientRow = ({ user, isExpanded, onToggle }) => {
  const latestLogin = user.loginHistory?.[user.loginHistory.length - 1];
  const latestProvider = latestLogin?.authProvider || 'phone';
  const displayName = user.name || user.email || user.phoneNumber || 'Anonymous User';
  const avatar = user.profilePicture;

  return (
    <>
      <motion.tr
        layout
        onClick={onToggle}
        className="border-b border-white/5 cursor-pointer group hover:bg-white/[0.03] transition-colors duration-150"
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#FACC15]/20 border border-[#D4AF37]/30 flex items-center justify-center">
                  <User size={16} className="text-[#D4AF37]" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#111]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white leading-tight">{displayName}</p>
              <p className="text-[12px] text-white/30">{user.email || user.phoneNumber || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <AuthProviderBadge provider={latestProvider} />
        </td>
        <td className="px-5 py-4">
          <p className="text-[13px] text-white/60 font-medium">{getTimeAgo(latestLogin?.loginTime)}</p>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white">{user.loginHistory?.length || 0}</span>
            <LogIn size={12} className="text-white/30" />
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="text-[13px] font-bold text-white">{user.savedVendors?.length || 0}</span>
        </td>
        <td className="px-5 py-4">
          <span className="text-[13px] font-bold text-white">{user.inquiries?.length || 0}</span>
        </td>
        <td className="px-5 py-4">
          <p className="text-[12px] text-white/30">{formatDateShort(user.createdAt)}</p>
        </td>
        <td className="px-5 py-4">
          {user.lastKnownLocation?.city ? (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#D4AF37] shrink-0" />
              <span className="text-[12px] text-white/60 font-medium">
                {user.lastKnownLocation.city}{user.lastKnownLocation.state ? `, ${user.lastKnownLocation.state}` : ''}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-white/20 italic">—</span>
          )}
        </td>
        <td className="px-5 py-4">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30 group-hover:text-white/60 transition-colors"
          >
            <ChevronDown size={16} />
          </motion.div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <td colSpan={8} className="px-0 py-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="bg-[#0a0a0a] border-y border-white/5 px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Login History */}
                    <div>
                      <h4 className="text-[12px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={12} /> Login History
                      </h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                        {user.loginHistory?.length > 0 ? [...user.loginHistory].reverse().map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <AuthProviderBadge provider={log.authProvider} />
                              <span className="text-[12px] text-white/50">{formatDate(log.loginTime)}</span>
                            </div>
                            {log.deviceInfo && (
                              <span className="text-[11px] text-white/25 truncate max-w-[120px]">{log.deviceInfo}</span>
                            )}
                          </motion.div>
                        )) : (
                          <p className="text-[13px] text-white/25 italic">No login history yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Vendor Interactions */}
                    <div>
                      <h4 className="text-[12px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <TrendingUp size={12} /> Platform Activity
                      </h4>
                      <div className="space-y-3">
                        {/* Saved Vendors */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Bookmark size={13} className="text-[#D4AF37]" />
                            <span className="text-[12px] font-bold text-white/60">Saved Vendors ({user.savedVendors?.length || 0})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {user.savedVendors?.length > 0 ? user.savedVendors.map((v, i) => (
                              <span key={i} className="text-[11px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-lg px-2 py-1 font-bold">
                                {v.name || `Vendor #${i + 1}`}
                              </span>
                            )) : <p className="text-[12px] text-white/25 italic">None saved yet.</p>}
                          </div>
                        </div>
                        {/* Inquiries */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={13} className="text-blue-400" />
                            <span className="text-[12px] font-bold text-white/60">Inquiries ({user.inquiries?.length || 0})</span>
                          </div>
                          <div className="space-y-1">
                            {user.inquiries?.length > 0 ? user.inquiries.slice(0, 3).map((inq, i) => (
                              <div key={i} className="flex items-center justify-between text-[12px]">
                                <span className="text-white/50">{inq.vendorId?.name || 'Unknown Vendor'}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  inq.status === 'Pending' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'
                                }`}>{inq.status}</span>
                              </div>
                            )) : <p className="text-[12px] text-white/25 italic">No inquiries yet.</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <h4 className="text-[12px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={12} /> Last Known Location
                      </h4>
                      {user.lastKnownLocation?.latitude ? (
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Navigation size={14} className="text-[#D4AF37]" />
                            <span className="text-[14px] font-bold text-white">
                              {[user.lastKnownLocation.city, user.lastKnownLocation.state, user.lastKnownLocation.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                          <div className="flex gap-4 text-[12px] text-white/40">
                            <span>Lat: <span className="text-white/60 font-mono">{user.lastKnownLocation.latitude?.toFixed(5)}</span></span>
                            <span>Lng: <span className="text-white/60 font-mono">{user.lastKnownLocation.longitude?.toFixed(5)}</span></span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${user.lastKnownLocation.latitude},${user.lastKnownLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-[#D4AF37] hover:underline font-bold mt-1"
                          >
                            <MapPin size={11} /> Open in Google Maps
                          </a>
                          {user.lastKnownLocation.updatedAt && (
                            <p className="text-[10px] text-white/20">
                              Updated: {new Date(user.lastKnownLocation.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                          <MapPin size={20} className="text-white/10 mx-auto mb-1" />
                          <p className="text-[12px] text-white/25 italic">Location not yet available.</p>
                          <p className="text-[11px] text-white/15 mt-1">Client needs to grant location permission.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

const ClientManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          setError('Failed to load clients.');
        }
      } catch (err) {
        console.error('ClientManager fetch error:', err);
        setError('Network error connecting to API. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    );
  });

  const totalLogins = users.reduce((sum, u) => sum + (u.loginHistory?.length || 0), 0);
  const googleUsers = users.filter(u => u.googleId || u.loginHistory?.some(l => l.authProvider === 'google')).length;

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8 min-h-full bg-[#111111]"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#FACC15]/20 border border-[#D4AF37]/30 flex items-center justify-center">
            <Users size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Client Panel</h1>
            <p className="text-[13px] text-white/40">Track user activity, logins, and interactions in real-time.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Clients" value={users.length} color="bg-[#D4AF37]/10 text-[#D4AF37]" />
        <StatCard icon={LogIn} label="Total Logins" value={totalLogins} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Globe} label="Google Auth" value={googleUsers} color="bg-green-500/10 text-green-400" />
        <StatCard icon={MessageSquare} label="Inquiries" value={users.reduce((s,u) => s + (u.inquiries?.length||0), 0)} color="bg-purple-500/10 text-purple-400" />
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full bg-[#0a0a0a] border border-white/8 text-white placeholder-white/25 rounded-2xl pl-10 pr-10 py-3 text-[14px] outline-none focus:border-[#D4AF37]/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-5">
          <AlertCircle size={16} />
          <span className="text-[13px] font-medium">{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Client', 'Auth', 'Last Login', 'Logins', 'Location', 'Saved', 'Inquiries', 'Joined', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-[11px] font-black text-white/30 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length > 0 ? (
                  filtered.map((user) => (
                    <ClientRow
                      key={user._id}
                      user={user}
                      isExpanded={expandedId === user._id}
                      onToggle={() => setExpandedId(expandedId === user._id ? null : user._id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <Users size={32} className="text-white/10 mx-auto mb-3" />
                      <p className="text-[14px] text-white/30 font-medium">
                        {search ? 'No clients match your search.' : 'No clients have registered yet.'}
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5">
            <p className="text-[12px] text-white/25">
              Showing {filtered.length} of {users.length} clients
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClientManager;
