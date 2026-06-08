import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Check, Trash2, Send, Server, MapPin, Database, Search, AlertCircle, CheckCircle2, Download, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { LogOut, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export default function ScraperDashboard({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [correctedSearch, setCorrectedSearch] = useState(null);
  
  // UI Filter State
  const [activeTab, setActiveTab] = useState('staging-phones');

  useEffect(() => {
    fetchVendors();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      setEmployees(res.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      setVendors(res.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  };

  const startScrape = async (e) => {
    e?.preventDefault();
    if (!omniQuery.trim()) return;
    
    setLoading(true);
    setCorrectedSearch(null); // Reset correction state
    try {
      const res = await axios.post(`${API_URL}/scrape/omni`, { query: omniQuery, engine: 'google' });
      
      if (res.data.parsed.correctedQuery) {
        setCorrectedSearch(res.data.parsed.correctedQuery);
      }

      const interval = setInterval(async () => {
        await fetchVendors();
      }, 2000);
      
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
      }, 10000);
      
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response?.data?.error) alert(error.response.data.error);
    }
  };

  const handleVerify = async (id, currentData) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}`, currentData);
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssign = async (id, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.post(`${API_URL}/vendors/assign`, { vendorIds: [id], employeeId });
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vendors/${id}`);
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const pushToProd = async () => {
    try {
      const res = await axios.post(`${API_URL}/vendors/push`);
      alert(`Successfully pushed ${res.data.pushed} vendors to Production!`);
      fetchVendors();
    } catch (error) {
      alert('Error pushing to production.');
    }
  };

  const clearQueue = async () => {
    if (window.confirm('Clear all unverified vendors?')) {
      try {
        await axios.post(`${API_URL}/vendors/clear-unverified`);
        fetchVendors();
      } catch (e) {
        console.error('Failed to clear queue', e);
      }
    }
  };

  const exportToCSV = async () => {
    const dataToExport = activeTab === 'staging-phones' ? stagingVendorsWithPhones : (activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors);
    if (dataToExport.length === 0) return alert("No data to export");
    
    // Group data by Category and City
    const groups = {};
    dataToExport.forEach(v => {
      const groupKey = `${v.category.replace(/[^a-zA-Z0-9]/g, '_')}_${v.city.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(v);
    });

    const zip = new JSZip();
    
    Object.keys(groups).forEach(key => {
      const csvData = Papa.unparse(groups[key].map(v => ({
        ID: v.id,
        Name: v.name,
        Category: v.category,
        City: v.city,
        Pincode: v.pincode || '',
        Address: v.address,
        Phone: v.phone && v.phone.startsWith('+91') ? `'${v.phone}` : v.phone,
        Rating: v.rating,
        GoogleMapsLink: v.mapsLink || '',
        AssignedTo: v.assignedTo || 'Unassigned',
        CRMStatus: v.crmStatus || 'New'
      })));
      zip.file(`Export/${key}_leads.csv`, csvData);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `gomandap_${activeTab}_leads_${Date.now()}.zip`);
  };

  const stagingVendors = vendors.filter(v => !v.pushed).reverse();
  const stagingVendorsWithPhones = stagingVendors.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
  const stagingVendorsNoPhones = stagingVendors.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));
  const liveVendors = vendors.filter(v => v.pushed).reverse();
  const verifiedCount = stagingVendors.filter(v => v.verified).length;

  const displayedVendors = activeTab === 'staging-phones' ? stagingVendorsWithPhones : (activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors);

  return (
    <div 
      className="min-h-screen text-white font-sans selection:bg-blue-500/30 relative overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
      
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Globe className="text-blue-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white leading-none">
                GOMANDAP <span className="text-blue-500 font-normal">SEARCH</span>
              </h1>
              <p className="text-xs text-blue-400/80 font-bold tracking-widest uppercase mt-1">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={pushToProd}
              disabled={verifiedCount === 0}
              className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white shadow-xl shadow-white/10"
            >
              <Send size={16} /> Push ({verifiedCount}) Live
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <img src="https://ui-avatars.com/api/?name=Admin&background=111&color=fff" className="w-10 h-10 rounded-full border border-white/10" alt="Admin" />
              <button onClick={onLogout} className="text-white/40 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-36 pb-20 relative z-10">
        
        {/* HERO SEARCH ENGINE */}
        <div className="flex flex-col items-center justify-center mb-16 mt-8">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full relative">
            <form onSubmit={startScrape} className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search size={24} className={`${loading ? 'text-blue-500 animate-pulse' : 'text-white/40 group-focus-within:text-blue-500'} transition-colors`} />
              </div>
              <input 
                type="text"
                value={omniQuery}
                onChange={(e) => setOmniQuery(e.target.value)}
                disabled={loading}
                placeholder="Search anything (e.g., 'Banquet Halls Hyderabad', 'Chennai Photographers')..."
                className="w-full bg-[#111] border-2 border-white/10 hover:border-white/20 focus:border-blue-500/50 rounded-full py-5 pl-16 pr-32 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xl"
              />
              <button 
                type="submit"
                disabled={loading || !omniQuery.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold py-2.5 px-6 rounded-full transition-all flex items-center gap-2"
              >
                {loading ? <span className="animate-pulse">Scraping...</span> : 'Search'}
              </button>
            </form>
            
            {loading && (
              <div className="absolute -bottom-4 left-0 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
              </div>
            )}
            <style jsx>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
          </motion.div>

          {correctedSearch && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
              <p className="text-white/60 text-sm">
                Showing results for <span className="font-bold text-white">"{correctedSearch}"</span>
              </p>
              <p className="text-white/40 text-sm italic mt-1">
                Search instead for <button onClick={() => { setOmniQuery(omniQuery); setCorrectedSearch(null); startScrape(); }} className="text-blue-400 hover:underline">"{omniQuery}"</button>
              </p>
            </motion.div>
          )}
        </div>

        {/* PIPELINE QUEUE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-6">
              <button onClick={() => setActiveTab('staging-phones')} className={`pb-4 -mb-[17px] font-bold text-sm transition-all border-b-2 ${activeTab === 'staging-phones' ? 'border-blue-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                Ready Leads <span className="ml-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">{stagingVendorsWithPhones.length}</span>
              </button>
              <button onClick={() => setActiveTab('staging-nophones')} className={`pb-4 -mb-[17px] font-bold text-sm transition-all border-b-2 ${activeTab === 'staging-nophones' ? 'border-yellow-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                Missing Phone <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full text-xs">{stagingVendorsNoPhones.length}</span>
              </button>
              <button onClick={() => setActiveTab('pushed')} className={`pb-4 -mb-[17px] font-bold text-sm transition-all border-b-2 ${activeTab === 'pushed' ? 'border-green-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                Live DB <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full text-xs">{liveVendors.length}</span>
              </button>
              <button onClick={() => setActiveTab('employees')} className={`pb-4 -mb-[17px] font-bold text-sm transition-all border-b-2 ${activeTab === 'employees' ? 'border-purple-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                Employees
              </button>
              <button onClick={() => setActiveTab('settings')} className={`pb-4 -mb-[17px] font-bold text-sm transition-all border-b-2 ${activeTab === 'settings' ? 'border-gray-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                Settings
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={exportToCSV} className="text-white/50 hover:text-white text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                <Download size={16} /> CSV
              </button>
              <button onClick={clearQueue} className="text-white/50 hover:text-red-400 text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {activeTab === 'settings' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Admin Settings</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.put(`${API_URL}/auth/admin`, { 
                        username: e.target.username.value, 
                        password: e.target.password.value 
                      });
                      alert('Credentials updated successfully. Please log back in.');
                      onLogout();
                    } catch (err) {
                      alert('Failed to update credentials');
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-white/50 mb-1">New Username</label>
                      <input name="username" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white/50 mb-1">New Password</label>
                      <input name="password" type="password" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500" required />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg w-full">Update Credentials</button>
                  </form>
                </motion.div>
              ) : activeTab === 'employees' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} /> Add Telecaller</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData();
                      formData.append('image', e.target.avatar.files[0]);
                      
                      try {
                        const uploadRes = await axios.post(`${API_URL}/upload`, formData);
                        const avatarUrl = uploadRes.data.url;

                        await axios.post(`${API_URL}/employees`, {
                          name: e.target.name.value,
                          username: e.target.username.value,
                          password: e.target.password.value,
                          location: e.target.location.value,
                          phone: e.target.phone.value,
                          email: e.target.email.value,
                          avatar: avatarUrl
                        });
                        alert('Employee added!');
                        e.target.reset();
                        fetchEmployees();
                      } catch (err) {
                        alert('Failed to create employee');
                      }
                    }} className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><input name="avatar" type="file" accept="image/*" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="name" placeholder="Full Name" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="location" placeholder="Territory (e.g., Guntur)" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="phone" placeholder="Phone Number" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="email" placeholder="Email Address" type="email" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="username" placeholder="Login Username" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <div><input name="password" placeholder="Login Password" type="password" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white" required /></div>
                      <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg w-full">Create Employee</button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employees.map(emp => (
                      <div key={emp.id} className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                        <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} alt="Avatar" className="w-16 h-16 rounded-full" />
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{emp.name}</h4>
                          <p className="text-sm text-white/50">{emp.location} Territory</p>
                          <div className="text-xs text-white/30 mt-1 font-mono">{emp.username} / {emp.password}</div>
                        </div>
                        <button onClick={async () => {
                          if (window.confirm('Delete this employee?')) {
                            await axios.delete(`${API_URL}/employees/${emp.id}`);
                            fetchEmployees();
                          }
                        }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={20}/></button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : displayedVendors.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                  <Search size={48} className="mx-auto text-white/10 mb-4" />
                  <h3 className="text-xl font-bold text-white/50">No leads found</h3>
                  <p className="text-white/30 text-sm mt-1">Try searching for something above.</p>
                </motion.div>
              ) : (
                displayedVendors.map((vendor, index) => (
                  <motion.div 
                    layout
                    key={vendor.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                    whileHover={{ y: -4, scale: 1.01, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    className={`p-5 rounded-2xl border transition-colors will-change-transform bg-black/40 backdrop-blur-xl ${vendor.verified ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white truncate">{vendor.name}</h3>
                          {vendor.verified && !vendor.pushed && <CheckCircle2 size={16} className="text-blue-500 shrink-0" />}
                          {vendor.pushed && <Database size={16} className="text-green-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-sm truncate mb-2">
                          <MapPin size={14} className="shrink-0"/> <span className="truncate">{vendor.address}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="bg-white/5 px-2 py-1 rounded text-white/70">{vendor.category}</span>
                          <span className="bg-white/5 px-2 py-1 rounded text-white/90 font-mono">{vendor.phone}</span>
                          {vendor.rating && <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">⭐ {vendor.rating}</span>}
                          {vendor.email && <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded">✉️ {vendor.email}</span>}
                          {vendor.instagram && <span className="bg-pink-500/10 text-pink-400 px-2 py-1 rounded">📸 Instagram</span>}
                          {vendor.operatingHours && <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">🕒 {vendor.operatingHours}</span>}
                        </div>
                      </div>
                      
                      {!vendor.pushed && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <select 
                            onChange={(e) => handleAssign(vendor.id, e.target.value)}
                            value={vendor.assignedTo || ''}
                            className="px-3 py-2 bg-[#111] border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Assign To...</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                          
                          <div className="flex gap-2">
                            <button onClick={() => handleVerify(vendor.id, vendor)} className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${vendor.verified ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}>
                              {vendor.verified ? 'Verified' : 'Verify'}
                            </button>
                            <button onClick={() => handleDelete(vendor.id)} className="px-4 py-2 rounded-lg font-bold text-sm bg-white/5 text-white/50 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}

