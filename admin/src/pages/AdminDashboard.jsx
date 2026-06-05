import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';
import VendorDetailsModal from '../components/VendorDetailsModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'clients'
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (activeTab === 'vendors') fetchVendors();
    if (activeTab === 'clients') fetchClients();
  }, [activeTab]);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('https://gomandap-api.onrender.com/api/vendors/admin/all');
      setVendors(res.data.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('https://gomandap-api.onrender.com/api/auth/users');
      setClients(res.data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, adminFeedback = null) => {
    try {
      const payload = { status };
      if (adminFeedback) payload.adminFeedback = adminFeedback;
      
      await axios.patch(`https://gomandap-api.onrender.com/api/vendors/${id}/status`, payload);
      // Update local state
      setVendors(vendors.map(v => v._id === id ? { ...v, status, adminFeedback: adminFeedback || v.adminFeedback } : v));
      if (selectedVendor && selectedVendor._id === id) {
        setSelectedVendor({ ...selectedVendor, status, adminFeedback: adminFeedback || selectedVendor.adminFeedback });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const StatusBadge = ({ status, step }) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 size={14} /> Approved</span>;
      case 'rejected':
      case 'rejected_with_feedback':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><XCircle size={14} /> Feedback Sent</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"><Clock size={14} /> Draft (Step {step})</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage platform users and vendors.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('vendors')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'vendors' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendors
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Clients
          </button>
        </div>
      </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 md:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-3 md:py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary w-full md:w-64 shadow-sm" />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-3 md:py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm w-full sm:w-auto">
            <Filter size={18} /> Filter
          </button>
        </div>

      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl md:shadow-sm md:border border-gray-100 overflow-hidden bg-transparent md:bg-white">

        
        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500 font-bold">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-bold bg-white rounded-2xl">No vendor applications yet.</div>
          ) : vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {vendor.portfolioImages?.length > 0 ? (
                      <img src={vendor.portfolioImages[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">No Img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-gray-900 text-lg leading-tight">{vendor.name}</div>
                    <div className="text-xs font-bold text-brand-primary mt-1 uppercase">{vendor.category}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4 text-sm font-semibold text-gray-600">
                <span className="flex justify-between"><span>Owner:</span> <span className="text-gray-900">{vendor.ownerName}</span></span>
                <span className="flex justify-between"><span>Location:</span> <span className="text-gray-900">{vendor.address?.city || 'N/A'}</span></span>
                <span className="flex justify-between items-center"><span>Status:</span> <StatusBadge status={vendor.status} step={vendor.currentStep} /></span>
              </div>
              <button 
                onClick={() => setSelectedVendor(vendor)}
                className="w-full py-3 bg-brand-primary/10 text-brand-primary rounded-xl font-bold active:scale-95 transition-transform"
              >
                Review Profile
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Business Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Applied Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-bold">Loading vendors...</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-bold">No vendor applications yet.</td></tr>
              ) : vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {vendor.portfolioImages?.length > 0 ? (
                          <img src={vendor.portfolioImages[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">No Img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{vendor.name}</div>
                        <div className="text-xs font-semibold text-gray-500">{vendor.ownerName} - {vendor.contact?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {vendor.address?.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                    {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vendor.status} step={vendor.currentStep} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedVendor(vendor)}
                      className="text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      Review Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-2xl md:shadow-sm md:border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Client Info</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Logins</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="py-8 text-center text-gray-500 font-bold">Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-gray-500 font-bold">No clients registered yet.</td></tr>
              ) : clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{client.phoneNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {client._id.substring(0,8)}...</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                      {client.loginHistory?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold text-gray-700">
                      {client.loginHistory?.length > 0 
                        ? new Date(client.loginHistory[client.loginHistory.length - 1].loginTime).toLocaleString() 
                        : 'Never'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-gray-400 hover:text-brand-primary transition-colors p-2 rounded-lg hover:bg-brand-primary/10">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModal 
          vendor={selectedVendor} 
          onClose={() => setSelectedVendor(null)} 
          onUpdateStatus={(status, feedback) => handleStatusUpdate(selectedVendor._id, status, feedback)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
