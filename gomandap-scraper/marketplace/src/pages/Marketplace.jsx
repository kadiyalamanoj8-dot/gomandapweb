import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Star, ShieldCheck, Lock, Search, X, CheckCircle, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../apiConfig';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to auto-center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL Params State
  const categoryParam = searchParams.get('category') || '';
  const locationParam = searchParams.get('location') || '';

  // Local Input State (for the search bar)
  const [localCategory, setLocalCategory] = useState(categoryParam);
  const [localLocation, setLocalLocation] = useState(locationParam);
  
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFound, setTotalFound] = useState(0);
  
  const [publicUser, setPublicUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gomandap_public_user')); } catch { return null; }
  });
  
  const [authModal, setAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', name: '' });
  
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default India

  useEffect(() => {
    fetchVendors();
    // Keep local inputs in sync if URL changes
    setLocalCategory(categoryParam);
    setLocalLocation(locationParam);
  }, [categoryParam, locationParam]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/vendors/public`, {
        params: { category: categoryParam, location: locationParam, limit: 30 }
      });
      setVendors(res.data.results);
      setTotalFound(res.data.totalFound);
      
      // Calculate map center based on first vendor with coordinates
      const firstWithCoords = res.data.results.find(v => v.latitude && v.longitude);
      if (firstWithCoords) {
        setMapCenter([parseFloat(firstWithCoords.latitude), parseFloat(firstWithCoords.longitude)]);
      } else if (locationParam) {
        // Fallback: Use nominatim to find the city center
        try {
          const locRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: locationParam, format: 'json', limit: 1 }
          });
          if (locRes.data && locRes.data.length > 0) {
            setMapCenter([parseFloat(locRes.data[0].lat), parseFloat(locRes.data[0].lon)]);
          }
        } catch(e) {}
      }
    } catch (error) {
      console.error('Failed to fetch marketplace data', error);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ category: localCategory, location: localLocation });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/public/auth`, authForm);
      if (res.data.success) {
        setPublicUser(res.data.user);
        localStorage.setItem('gomandap_public_user', JSON.stringify(res.data.user));
        setAuthModal(false);
      }
    } catch (e) { alert("Failed to login/signup"); }
  };

  const handleReveal = async (vendor) => {
    if (!publicUser) {
      return setAuthModal(true);
    }
    
    // Check credits locally first to save API call
    if (publicUser.credits <= 0 && !publicUser.unlockedLeads.includes(vendor.id)) {
      return setPaywallOpen(true);
    }

    try {
      const res = await axios.post(`${API_URL}/public/reveal`, {
        userId: publicUser.id,
        vendorId: vendor.id
      });
      
      if (res.data.success) {
        // Update local vendor data with real details
        setVendors(prev => prev.map(v => 
          v.id === vendor.id 
            ? { ...v, phone: res.data.contact.phone, email: res.data.contact.email, isRevealed: true } 
            : v
        ));
        
        // Update local user credits
        if (!publicUser.unlockedLeads.includes(vendor.id)) {
          const updatedUser = {
            ...publicUser,
            credits: publicUser.credits - 1,
            unlockedLeads: [...publicUser.unlockedLeads, vendor.id]
          };
          setPublicUser(updatedUser);
          localStorage.setItem('gomandap_public_user', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      if (e.response?.status === 403) setPaywallOpen(true);
      else alert("Failed to reveal details");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col font-sans">
      
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Search size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Gomandap</span>
          </div>
          
          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl w-full">
            <div className="flex items-center border border-gray-300 rounded-full px-2 py-1.5 bg-gray-50 shadow-inner focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <Search size={16} className="text-gray-400 ml-3 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="What? (e.g. Photographers)" 
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 font-medium placeholder-gray-400 w-full"
              />
              <span className="mx-2 text-gray-300 shrink-0">|</span>
              <MapPin size={16} className="text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Where? (e.g. Hyderabad)" 
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 font-medium placeholder-gray-400 w-full"
              />
              <button type="submit" className="bg-violet-600 text-white rounded-full px-4 py-1.5 text-sm font-bold hover:bg-violet-700 transition-colors ml-2 shrink-0">
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 shrink-0">
            {publicUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Credits</p>
                  <p className="text-sm font-black text-violet-600">{publicUser.credits} Left</p>
                </div>
                <button onClick={() => { setPublicUser(null); localStorage.removeItem('gomandap_public_user'); }} className="text-xs text-gray-400 hover:text-gray-600 underline">Logout</button>
              </div>
            ) : (
              <button onClick={() => setAuthModal(true)} className="text-sm font-bold text-white bg-gray-900 px-5 py-2 rounded-full hover:bg-gray-800 transition shadow-md">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── FULL WIDTH MAP SECTION ── */}
      <div className="w-full h-[350px] md:h-[450px] relative z-0 border-b border-gray-200 bg-gray-100 shrink-0">
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} zoom={12} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vendors.map(vendor => {
            if (vendor.latitude && vendor.longitude) {
              return (
                <Marker key={vendor.id} position={[parseFloat(vendor.latitude), parseFloat(vendor.longitude)]}>
                  <Popup>
                    <div className="font-sans min-w-[150px]">
                      <h3 className="font-bold text-gray-900 text-sm">{vendor.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{vendor.category}</p>
                      <button onClick={() => handleReveal(vendor)} className="mt-3 w-full bg-violet-600 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-violet-700 transition-colors">
                        {vendor.isRevealed ? 'Unlocked' : 'Reveal Details'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-2 z-[400]">
          <Navigation size={14} className="text-violet-600" /> Map displays {vendors.filter(v => v.latitude).length} locations
        </div>
      </div>

      {/* ── MAIN CONTENT (SCROLLABLE GRID) ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {categoryParam ? categoryParam : 'All Vendors'} {locationParam ? `in ${locationParam}` : ''}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Showing top {vendors.length} results of {totalFound > 30 ? '500+' : totalFound} found
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria or location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 10) * 0.05 }}
                key={vendor.id} 
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 flex items-start gap-2">
                      {vendor.name}
                      {vendor.tier === 'Premium' && <span className="mt-1 shrink-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Ad</span>}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-violet-500 shrink-0" /> <span className="line-clamp-1">{vendor.address || vendor.city}</span>
                    </p>
                  </div>
                  {vendor.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg border border-yellow-100 shrink-0 ml-2">
                      <span className="font-bold text-sm">{vendor.rating}</span>
                      <Star size={12} className="fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-auto mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Phone size={14} className="text-gray-400" />
                    </div>
                    <span className={`flex-1 ${!vendor.isRevealed ? 'blur-[3px] select-none text-gray-400' : 'text-gray-900 font-bold'}`}>
                      {vendor.phone}
                    </span>
                    {!vendor.isRevealed && <Lock size={14} className="text-violet-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail size={14} className="text-gray-400" />
                    </div>
                    <span className={`flex-1 line-clamp-1 ${!vendor.isRevealed ? 'blur-[3px] select-none text-gray-400' : 'text-gray-900 font-bold'}`}>
                      {vendor.email || 'hid***@gmail.com'}
                    </span>
                    {!vendor.isRevealed && <Lock size={14} className="text-violet-400 shrink-0" />}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100">
                    <ShieldCheck size={14} /> Verified
                  </div>
                  <button 
                    onClick={() => handleReveal(vendor)}
                    disabled={vendor.isRevealed}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                      vendor.isRevealed 
                        ? 'bg-green-500 text-white shadow-green-500/20 cursor-default ring-2 ring-green-500 ring-offset-2' 
                        : 'bg-gray-900 text-white hover:bg-violet-600 hover:shadow-violet-600/20 active:scale-95'
                    }`}
                  >
                    {vendor.isRevealed ? 'Unlocked ✓' : 'Reveal Contact'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paywall Banner at Bottom */}
        {totalFound > 30 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 p-12 bg-gradient-to-br from-violet-900 to-indigo-950 rounded-3xl text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                <Lock size={32} className="text-violet-200" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Unlock 500+ More Leads</h2>
              <p className="text-violet-200 text-lg mb-8">
                You are viewing the top 30 free results. Upgrade to Premium to instantly unlock unmasked contact details, emails, and CRM exports for all <strong>{totalFound}</strong> verified vendors in this area.
              </p>
              <button 
                onClick={() => setPaywallOpen(true)}
                className="bg-white text-indigo-950 font-black px-10 py-4 rounded-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] text-lg"
              >
                View Pricing Plans
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── MODALS ── */}
      
      {/* Auth Modal */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition">
                <X size={16} />
              </button>
              
              <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 border border-indigo-200">
                  <Lock size={20} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">Create Free Account</h2>
                <p className="text-sm text-gray-500 font-medium">Get <span className="font-bold text-violet-600">20 Free Credits</span> to instantly reveal verified vendor phone numbers and emails.</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Your Name</label>
                    <input type="text" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input type="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition" placeholder="john@example.com" />
                  </div>
                  <button type="submit" className="w-full mt-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-gray-900/20 active:scale-[0.98]">
                    Claim 20 Free Credits
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">By continuing, you agree to our Terms & Conditions.</p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Paywall Modal */}
      <AnimatePresence>
        {paywallOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setPaywallOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 z-20 transition-colors"><X size={16} /></button>
              <div className="bg-gradient-to-br from-violet-900 to-indigo-900 p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <Lock size={56} className="mx-auto text-violet-300 mb-6 relative z-10" />
                <h2 className="text-4xl font-black text-white mb-3 relative z-10 tracking-tight">Premium Access</h2>
                <p className="text-violet-200 text-base relative z-10 max-w-xs mx-auto">Unlock all {totalFound} verified vendors instantly.</p>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle size={14} className="text-green-600" /></div>
                    <p className="text-sm text-gray-800 font-medium"><strong>Direct Contact Details</strong> (Unmasked Phones)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle size={14} className="text-green-600" /></div>
                    <p className="text-sm text-gray-800 font-medium"><strong>Download Leads as CSV</strong> for cold calling</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle size={14} className="text-green-600" /></div>
                    <p className="text-sm text-gray-800 font-medium"><strong>Lifetime Access</strong> to this highly targeted list</p>
                  </div>
                </div>
                
                <button onClick={() => navigate('/pricing')} className="w-full bg-violet-600 text-white font-black py-4 rounded-xl hover:bg-violet-700 transition shadow-xl shadow-violet-600/20 active:scale-[0.98] text-lg">
                  View Pricing Plans
                </button>
                <button onClick={() => setPaywallOpen(false)} className="w-full mt-4 text-sm font-bold text-gray-500 hover:text-gray-700 py-2">
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
