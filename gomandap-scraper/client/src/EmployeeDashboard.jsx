import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Phone, MessageCircle, MapPin, Search, Calendar, ChevronDown, CheckCircle2, XCircle, Clock, Save, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from './apiConfig';

export default function EmployeeDashboard({ user, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Workspace State
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  
  // Lead Action State
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [crmNotes, setCrmNotes] = useState('');

  async function fetchAssignedLeads() {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      // Filter leads specifically assigned to this telecaller
      const assigned = res.data.filter(v => v.assignedTo === user.id).reverse();
      
      setLeads(assigned);
      
      // Extract unique categories for the workspace tabs
      const uniqueCats = [...new Set(assigned.map(l => l.category))];
      setCategories(['All', ...uniqueCats]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignedLeads();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateLeadStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}/crm`, { crmStatus: status, crmNotes });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, crmStatus: status, crmNotes } : l));
      setActiveLeadId(null);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleCall = (phone) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleWhatsApp = (lead) => {
    let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const msg = `Hi ${lead.name} team! We are inviting premium venues to list on Gomandap.com. Are you the right person to speak with?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredLeads = leads.filter(l => 
    (activeCategory === 'All' || l.category === activeCategory) &&
    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     l.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: leads.length,
    interested: leads.filter(l => l.crmStatus === 'Interested').length,
    callback: leads.filter(l => l.crmStatus === 'Callback').length,
    notInterested: leads.filter(l => l.crmStatus === 'Not Interested').length,
    new: leads.filter(l => l.crmStatus === 'New' || !l.crmStatus).length,
  };

  const getStatusColor = (status) => {
    if (status === 'Interested') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Callback') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'Not Interested') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-50 text-blue-600 border-blue-100'; // New
  };

  return (
    <div 
      className="min-h-screen text-slate-800 font-sans pb-20 relative overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>
      
      {/* HEADER & PROFILE */}
      <nav className="bg-white/60 border-b border-white/40 sticky top-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&rounded=true`} alt="Avatar" className="w-12 h-12 rounded-full shadow-lg border-2 border-white" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{user.location} Territory | Sales Rep</p>
            </div>
          </div>
          
          <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-red-500 hover:text-white hover:shadow-lg rounded-xl transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT SIDEBAR: Stats & Filter */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pipeline Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-600">Total Assigned</span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-black">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-600">To Call (New)</span>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-black">{stats.new}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-600">Interested</span>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-black">{stats.interested}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-600">Follow-up</span>
                <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-sm font-black">{stats.callback}</span>
              </div>
            </div>
          </div>

          {/* Workspaces / Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Workspaces</h2>
            <div className="flex flex-col gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="truncate pr-4">{cat}</span>
                  {cat !== 'All' && <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20' : 'bg-white border border-slate-200'}`}>
                    {leads.filter(l => l.category === cat).length}
                  </span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-9 space-y-6">
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search leads by name or city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold">Loading CRM Data...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <User className="text-slate-300" size={24} />
                </div>
                <h3 className="font-black text-slate-700 text-lg">No leads in this workspace</h3>
                <p className="text-sm text-slate-500 mt-1">Select a different category or wait for admin assignment.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredLeads.map(lead => (
                  <motion.div 
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{lead.name}</h3>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{lead.category}</span>
                        </div>
                        <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${getStatusColor(lead.crmStatus || 'New')}`}>
                          {lead.crmStatus || 'New'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mt-3">
                        <MapPin size={16} className="text-slate-400" /> <span className="truncate">{lead.address || lead.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mt-1.5">
                        <Phone size={16} className="text-slate-400" /> <span className="font-mono">{lead.phone}</span>
                      </div>
                      
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 mt-1">
                          ✉️ <span>{lead.email}</span>
                        </div>
                      )}
                      
                      {lead.instagram && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-pink-600 mt-1">
                          <a href={lead.instagram} target="_blank" rel="noreferrer" className="hover:underline">📸 View Instagram</a>
                        </div>
                      )}
                      
                      {lead.operatingHours && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 mt-1">
                          🕒 <span>{lead.operatingHours}</span>
                        </div>
                      )}

                      {lead.topReviews && lead.topReviews.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Reviews</p>
                          <div className="space-y-1">
                            {lead.topReviews.map((rev, i) => (
                              <p key={i} className="text-xs text-slate-500 italic line-clamp-2">"{rev}"</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {lead.crmNotes && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                          "{lead.crmNotes}"
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Panel */}
                    <div className="border-t border-slate-100 bg-slate-50">
                      {activeLeadId === lead.id ? (
                        <div className="p-4 space-y-4">
                          <textarea 
                            value={crmNotes}
                            onChange={(e) => setCrmNotes(e.target.value)}
                            placeholder="Add call notes..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                            rows={3}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => updateLeadStatus(lead.id, 'Interested')} className="flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold text-sm hover:bg-green-200">
                              <CheckCircle2 size={16}/> Interested
                            </button>
                            <button onClick={() => updateLeadStatus(lead.id, 'Callback')} className="flex items-center justify-center gap-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg font-bold text-sm hover:bg-yellow-200">
                              <Clock size={16}/> Callback
                            </button>
                            <button onClick={() => updateLeadStatus(lead.id, 'Not Interested')} className="flex items-center justify-center gap-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200">
                              <XCircle size={16}/> Rejected
                            </button>
                            <button onClick={() => setActiveLeadId(null)} className="flex items-center justify-center gap-1 bg-slate-200 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-300">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex divide-x divide-slate-200">
                          <button 
                            onClick={() => handleCall(lead.phone)}
                            className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Phone size={18} /> Call
                          </button>
                          <button 
                            onClick={() => handleWhatsApp(lead)}
                            className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                          >
                            <MessageCircle size={18} /> WhatsApp
                          </button>
                          <button 
                            onClick={() => { setActiveLeadId(lead.id); setCrmNotes(lead.crmNotes || ''); }}
                            className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Save size={18} /> Update
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
