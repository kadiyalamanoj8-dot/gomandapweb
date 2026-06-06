import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Landmark, MapPin, Phone, Building2, Store, Star, Send, UserCircle2 } from 'lucide-react';
import { getCategorySchema } from '../config/categorySchemas';
import LocationMapAdmin from './LocationMapAdmin';

const VendorDetailsModal = ({ vendor, onClose, onUpdateStatus }) => {
  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'preview'
  const [feedbackField, setFeedbackField] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSendFeedback = () => {
    if (!feedbackField || !feedbackMessage) return alert("Select a field and enter a message");
    
    // We send 'rejected_with_feedback' and append the new feedback to the array
    const newFeedback = { field: feedbackField, message: feedbackMessage };
    const adminFeedback = [...(vendor.adminFeedback || []), newFeedback];
    
    onUpdateStatus('rejected_with_feedback', adminFeedback);
    onClose();
  };

  const schema = getCategorySchema(vendor.category) || {};

  const gallery = vendor.portfolioImages?.length > 0 
    ? vendor.portfolioImages
    : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Vendor Verification</h2>
            <p className="text-sm font-semibold text-gray-500 mt-1">Review details before publishing</p>
          </div>
          
          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between">
            <div className="bg-gray-200/50 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setViewMode('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Data View
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'preview' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Client Preview
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm transition-colors hidden sm:block">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          
          {viewMode === 'admin' ? (
            <div className="p-6 md:p-8">
              {/* Top Identity Block */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/3 space-y-4">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                {vendor.portfolioImages?.length > 0 ? (
                  <img src={vendor.portfolioImages[0]} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Image</div>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {vendor.portfolioImages?.slice(1).map((img, i) => (
                  <img key={i} src={img} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" alt="portfolio" />
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-gray-900">{vendor.name}</h1>
                  <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{vendor.category}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
                  <span className="flex items-center gap-1.5"><Store size={16} className="text-gray-400" /> Owner: {vendor.ownerName}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {vendor.address?.city}</span>
                  <span className="flex items-center gap-1.5"><Building2 size={16} className="text-gray-400" /> GST: {vendor.gstin || 'Not Provided'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Phone</span>
                  <div className="flex items-center gap-2 font-black text-gray-900"><Phone size={14} className="text-green-500" /> {vendor.contact?.phone}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">WhatsApp</span>
                  <div className="flex items-center gap-2 font-black text-gray-900"><Phone size={14} className="text-green-500" /> {vendor.contact?.whatsapp || 'N/A'}</div>
                </div>
              </div>

              {(vendor.email || vendor.googleId) && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                  {vendor.photoUrl ? (
                    <img src={vendor.photoUrl} alt="Google" className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <UserCircle2 size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Linked Google Account</span>
                    <div className="font-bold text-gray-900">{vendor.email || 'Google Account Connected'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Col: Deep Schema & Pricing */}
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">Business Features</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {vendor.deepFeatures && Object.entries(vendor.deepFeatures).map(([key, val], i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-500 capitalize w-1/2 border-r border-gray-100">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{val || 'Not specified'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">Pricing Packages</h3>
                <div className="space-y-3">
                  {vendor.customBlocks?.pricingPackages?.map((pkg, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-black text-gray-900">{pkg.title}</div>
                        <div className="text-xs font-semibold text-gray-500">{pkg.desc}</div>
                      </div>
                      <div className="font-black text-brand-primary text-lg">{pkg.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Col: Banking & Address */}
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2"><Landmark size={20} className="text-blue-500" /> Banking Details</h3>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Account Holder Name</span>
                      <div className="font-black text-blue-900">{vendor.banking?.accountName}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Bank Name</span>
                      <div className="font-black text-blue-900">{vendor.banking?.bankName}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Account Number</span>
                      <div className="font-black text-blue-900 font-mono tracking-wider">{vendor.banking?.accountNumber}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">IFSC Code</span>
                      <div className="font-black text-blue-900 font-mono uppercase">{vendor.banking?.ifscCode}</div>
                    </div>
                  </div>
                  {vendor.banking?.upiId && (
                    <div className="pt-4 border-t border-blue-100">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">UPI ID</span>
                      <div className="font-black text-blue-900">{vendor.banking?.upiId}</div>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">Location & Address</h3>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="font-semibold text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Street Address</span>
                    {vendor.address?.street}<br/>
                    {vendor.address?.village && <>{vendor.address.village}, </>}
                    {vendor.address?.mandal && <>{vendor.address.mandal} Mandal, <br/></>}
                    {vendor.address?.district && <>{vendor.address.district} District, </>}
                    {vendor.address?.state && <>{vendor.address.state} - </>}
                    {vendor.address?.pincode}
                  </div>
                  
                  <LocationMapAdmin vendorId={vendor._id} locationData={vendor.locationData} />
                </div>
              </section>
            </div>
            </div>
            </div>
          ) : (
            // LIVE CLIENT PREVIEW
            <div className="bg-gray-50 min-h-full">
              <div className="p-4 md:p-8">
                {/* Hero Title Area */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">
                    {vendor.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                    <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-2 py-1 rounded-md">
                      <Star size={16} fill="currentColor" /> {vendor.rating || 5.0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-gray-400" /> {vendor.address?.city || 'India'}
                    </div>
                    <div className="flex items-center gap-1 text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md uppercase tracking-wider text-xs font-black">
                      {vendor.category}
                    </div>
                  </div>
                </div>

                {/* Cinematic Masonry Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-8">
                  <div className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer">
                    <img src={gallery[0]} alt="Main" className="w-full h-full object-cover" />
                  </div>
                  {gallery.length > 1 && <div className="hidden md:block col-span-1 row-span-1"><img src={gallery[1]} className="w-full h-full object-cover" /></div>}
                  {gallery.length > 2 && <div className="hidden md:block col-span-1 row-span-1"><img src={gallery[2]} className="w-full h-full object-cover" /></div>}
                  {gallery.length > 3 && <div className="hidden md:block col-span-1 row-span-1"><img src={gallery[3]} className="w-full h-full object-cover" /></div>}
                  {gallery.length > 4 && <div className="hidden md:block col-span-1 row-span-1"><img src={gallery[4]} className="w-full h-full object-cover" /></div>}
                </div>

                <div className="space-y-8">
                  {/* Pricing Packages */}
                  {vendor.customBlocks?.pricingPackages?.length > 0 && (
                    <section>
                      <h2 className="text-xl font-black text-gray-900 mb-4">Pricing Packages</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendor.customBlocks.pricingPackages.map((pkg, idx) => (
                          <div key={idx} className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-1">{pkg.title}</h3>
                            <span className="text-xl font-black text-brand-primary block mb-2">{pkg.price}</span>
                            <p className="text-sm font-semibold text-gray-500">{pkg.desc}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Amenities */}
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-4">{schema.featuresTitle || 'Features'}</h2>
                    <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-100">
                      {vendor.deepFeatures && Object.entries(vendor.deepFeatures).map(([key, value], i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-brand-primary shrink-0" />
                          <span className="text-sm font-semibold text-gray-700 capitalize">
                            {value === "Yes" || value === "No" ? `${key}: ${value}` : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col border-t border-gray-100 bg-white pb-safe">
          
          {/* Feedback Form (Only shown if pending or rejected) */}
          {['draft', 'pending', 'rejected_with_feedback'].includes(vendor.status) && (
            <div className="px-4 md:px-8 py-4 bg-red-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-center">
              <span className="text-sm font-bold text-red-600 whitespace-nowrap">Flag Issue:</span>
              <select 
                value={feedbackField}
                onChange={e => setFeedbackField(e.target.value)}
                className="w-full md:w-48 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-red-400"
              >
                <option value="">Select Field...</option>
                <option value="portfolioImages">Portfolio/Images</option>
                <option value="banking.accountNumber">Bank Account Number</option>
                <option value="banking.ifscCode">IFSC Code</option>
                <option value="gstin">GST Number</option>
                <option value="address">Address/Location</option>
                <option value="deepFeatures">Pricing/Features</option>
              </select>
              <input 
                type="text" 
                value={feedbackMessage}
                onChange={e => setFeedbackMessage(e.target.value)}
                placeholder="Type reason for rejection..." 
                className="flex-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-red-400" 
              />
              <button 
                onClick={handleSendFeedback}
                className="w-full md:w-auto flex justify-center items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
              >
                <Send size={16} /> Send to Vendor
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-4 md:py-5 gap-4">
            <div className="text-sm font-bold text-gray-500 w-full md:w-auto text-center md:text-left">
              Status: 
              <span className={`ml-2 uppercase tracking-widest ${
                vendor.status === 'approved' ? 'text-green-500' : 
                vendor.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
              }`}>
                {vendor.status}
              </span>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <button 
                onClick={() => { onUpdateStatus('rejected'); onClose(); }}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3.5 md:py-3 rounded-xl font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <XCircle size={18} /> Hard Reject
              </button>
              <button 
                onClick={() => { onUpdateStatus('approved'); onClose(); }}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3.5 md:py-3 rounded-xl font-black text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 hover:-translate-y-0.5"
              >
                <CheckCircle2 size={18} /> Approve Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsModal;
