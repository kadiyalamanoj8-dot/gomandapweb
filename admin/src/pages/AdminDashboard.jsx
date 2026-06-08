import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Filter, CheckCircle2, XCircle, Clock, Users, Store, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import VendorDetailsModal from '../components/VendorDetailsModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

// Skeleton loader component
const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {[1,2,3,4,5,6].map(i => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded-full animate-pulse" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      </div>
    </div>
    <div className="h-10 bg-gray-100 rounded-xl" />
  </div>
);

const StatusBadge = ({ status, step }) => {
  const config = {
    approved: { cls: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={13} />, label: 'Approved' },
    rejected: { cls: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={13} />, label: 'Rejected' },
    rejected_with_feedback: { cls: 'bg-orange-100 text-orange-700 border-orange-200', icon: <XCircle size={13} />, label: 'Feedback Sent' },
    draft: { cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Clock size={13} />, label: `Draft (Step ${step})` },
    pending: { cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={13} />, label: 'Pending' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  </motion.div>
);

const FILTER_TABS = ['all', 'pending', 'approved', 'rejected_with_feedback', 'draft'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'vendors') fetchVendors();
    if (activeTab === 'clients') fetchClients();
  }, [activeTab]);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/vendors/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load vendors. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load clients.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, adminFeedback = null) => {
    const toastId = toast.loading('Updating vendor status...');
    try {
      const payload = { status };
      if (adminFeedback) payload.adminFeedback = adminFeedback;
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/api/vendors/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(v => v.map(x => x._id === id ? { ...x, status, adminFeedback: adminFeedback || x.adminFeedback } : x));
      if (selectedVendor?._id === id) {
        setSelectedVendor(s => ({ ...s, status, adminFeedback: adminFeedback || s.adminFeedback }));
      }
      toast.success(status === 'approved' ? '✅ Vendor approved & published!' : '🔴 Vendor status updated.', { id: toastId });
    } catch (error) {
      toast.error('Failed to update vendor status.', { id: toastId });
    }
  };

  // Stats derived from vendors
  const stats = useMemo(() => ({
    total: vendors.length,
    pending: vendors.filter(v => v.status === 'pending' || v.status === 'draft').length,
    approved: vendors.filter(v => v.status === 'approved').length,
    feedback: vendors.filter(v => v.status === 'rejected_with_feedback' || v.status === 'rejected').length,
  }), [vendors]);

  // Filtered & searched vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch =
        !searchQuery ||
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        v.status === statusFilter ||
        (statusFilter === 'pending' && v.status === 'draft');

      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c => c.phoneNumber?.includes(searchQuery));
  }, [clients, searchQuery]);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage platform vendors and clients.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('vendors'); setSearchQuery(''); setStatusFilter('all'); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'vendors' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendors
          </button>
          <button
            onClick={() => { setActiveTab('clients'); setSearchQuery(''); setStatusFilter('all'); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Clients
          </button>
        </div>
      </div>

      {/* Stats Row — only for vendors */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Store} value={stats.total} label="Total Vendors" color="bg-blue-100 text-blue-600" />
          <StatCard icon={Clock} value={stats.pending} label="Pending Review" color="bg-amber-100 text-amber-600" />
          <StatCard icon={CheckCircle2} value={stats.approved} label="Approved Live" color="bg-green-100 text-green-600" />
          <StatCard icon={AlertTriangle} value={stats.feedback} label="Needs Attention" color="bg-red-100 text-red-600" />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'vendors' ? 'Search by name, category, city...' : 'Search by phone number...'}
            className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary w-full shadow-sm transition-colors"
          />
        </div>
        {activeTab === 'vendors' && (
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${
                  statusFilter === f
                    ? 'btn-liquid text-white border-brand-primary shadow-sm shadow-brand-primary/30'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                {f === 'all' ? 'All' : f === 'rejected_with_feedback' ? 'Feedback' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-1.5 bg-current/20 text-current rounded-full px-1.5 py-0.5 text-[10px]">
                    {f === 'pending' ? stats.pending : f === 'approved' ? stats.approved : stats.feedback}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {isLoading ? (
              [1,2,3].map(i => <SkeletonCard key={i} />)
            ) : filteredVendors.length === 0 ? (
              <div className="py-16 text-center">
                <Store size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-gray-400">No vendors found.</p>
              </div>
            ) : filteredVendors.map(vendor => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {(vendor.portfolioImages?.[0] || vendor.imageUrl || vendor.photoUrl) ? (
                      <img src={vendor.portfolioImages?.[0] || vendor.imageUrl || vendor.photoUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">No Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 truncate">{vendor.name}</div>
                    <div className="text-xs font-bold text-brand-primary uppercase tracking-wider">{vendor.category}</div>
                  </div>
                  <StatusBadge status={vendor.status} step={vendor.currentStep} />
                </div>
                <div className="text-sm text-gray-500 font-semibold mb-3">{vendor.address?.city || 'N/A'} · {vendor.ownerName}</div>
                <button
                  onClick={() => setSelectedVendor(vendor)}
                  className="w-full py-2.5 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Review Profile →
                </button>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Business</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Applied</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <Store size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-bold text-gray-400">No vendors found matching your search.</p>
                    </td>
                  </tr>
                ) : filteredVendors.map(vendor => (
                  <motion.tr
                    key={vendor._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {(vendor.portfolioImages?.[0] || vendor.imageUrl || vendor.photoUrl) ? (
                            <img src={vendor.portfolioImages?.[0] || vendor.imageUrl || vendor.photoUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">?</div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{vendor.name}</div>
                          <div className="text-xs font-semibold text-gray-400">{vendor.ownerName} · {vendor.contact?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{vendor.address?.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vendor.status} step={vendor.currentStep} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="text-sm font-bold text-brand-primary hover:underline transition-colors"
                      >
                        Review →
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Results count */}
            {!isLoading && vendors.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 font-semibold">
                Showing {filteredVendors.length} of {vendors.length} vendors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Client Info</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Logins</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Last Seen</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1,2,3].map(i => <SkeletonRow key={i} />)
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <Users size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-bold text-gray-400">No clients found.</p>
                  </td>
                </tr>
              ) : filteredClients.map(client => (
                <tr key={client._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{client.name || client.phoneNumber}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-semibold">{client.email || `ID: ${client._id?.slice(0, 10)}...`}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                      {client.loginHistory?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                    {client.loginHistory?.length > 0
                      ? new Date(client.loginHistory.at(-1).loginTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : <span className="text-gray-400">Never</span>}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-500">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && clients.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 font-semibold">
              {filteredClients.length} of {clients.length} clients
            </div>
          )}
        </div>
      )}

      {/* Vendor Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <VendorDetailsModal
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onUpdateStatus={(status, feedback) => handleStatusUpdate(selectedVendor._id, status, feedback)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
