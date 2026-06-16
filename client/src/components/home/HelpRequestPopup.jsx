import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Phone, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../../config/api';

const VENDORS_LIST = [
  'Banquet Halls', 'Photography', 'Decorators', 'Makeup Artists',
  'Catering', 'Event Planners', 'DJs & Sound', 'Live Music'
];

const HelpRequestPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: '',
    requiredVendors: []
  });

  const toggleVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      requiredVendors: prev.requiredVendors.includes(vendor)
        ? prev.requiredVendors.filter(v => v !== vendor)
        : [...prev.requiredVendors, vendor]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/help-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setFormData({
            name: '', phone: '', eventType: '', eventDate: '', message: '', requiredVendors: []
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit help request', error);
      alert('Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Trigger Button - Attached to Middle Right Edge */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-[999] bg-brand-primary text-gray-900 font-bold tracking-widest text-[12px] uppercase py-3 px-4 rounded-l-2xl shadow-[-5px_0_20px_rgba(255,215,0,0.3)] hover:pr-6 hover:-translate-x-1 transition-all flex items-center gap-2 group border border-r-0 border-brand-primary"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'translateY(-50%) rotate(180deg)' }}
      >
        <Sparkles size={16} className="text-gray-900 group-hover:animate-pulse" />
        Expert Help
      </button>

      {/* Glassmorphic Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full min-h-[300px]">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 size={40} />
                    </motion.div>
                    <h2 className="text-2xl font-black text-white mb-2">Request Sent!</h2>
                    <p className="text-white/70">Our experts will contact you shortly to help plan your perfect event.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                        Need Expert <span className="text-brand-primary">Help?</span>
                      </h2>
                      <p className="text-white/70 text-sm font-medium">Tell us about your event, and our free concierge will find the perfect vendors for you.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Event Type & Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleChange}
                          placeholder="Event Type (e.g. Wedding)"
                          className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl py-3.5 px-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                        />
                        <div className="relative">
                          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-colors [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      {/* Vendors Needed */}
                      <div>
                        <span className="block text-white/70 text-sm font-semibold mb-3">Vendors I need:</span>
                        <div className="flex flex-wrap gap-2">
                          {VENDORS_LIST.map(vendor => {
                            const isSelected = formData.requiredVendors.includes(vendor);
                            return (
                              <button
                                key={vendor}
                                type="button"
                                onClick={() => toggleVendor(vendor)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-brand-primary text-black border-brand-primary' 
                                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                {vendor}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Any specific requirements or budget constraints?"
                        rows="3"
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
                      ></textarea>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FACC15] text-black font-black text-[15px] py-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? 'Sending Request...' : (
                          <>Send Help Request <Send size={18} /></>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpRequestPopup;
