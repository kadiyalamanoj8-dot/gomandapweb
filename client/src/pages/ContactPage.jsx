import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message. We will get back to you shortly!');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-gray-900 mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto"
          >
            Have a question, need assistance, or want to partner with us? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="text-brand-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                <p className="text-sm text-gray-500">+91 98765 43210</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9am - 6pm</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="text-brand-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-500">support@gomandap.com</p>
                <p className="text-sm text-gray-500">vendors@gomandap.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="text-brand-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Office</h3>
                <p className="text-sm text-gray-500">123 Wedding Avenue,<br/>Cyber City, Gurugram,<br/>Haryana, India</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-hover transition-colors">
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
