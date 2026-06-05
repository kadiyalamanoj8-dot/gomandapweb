import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageCircle, AtSign, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-24 md:pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-black text-brand-primary tracking-tight">Gomandap</div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Your ultimate marketplace for discovering the finest wedding venues, top-tier caterers, and premium event services across India.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm"><Share2 size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm"><MessageCircle size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm"><AtSign size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm"><Globe size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-6">Discover</h4>
            <div className="flex flex-col gap-3">
              <Link to="/venues" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Banquet Halls</Link>
              <Link to="/resorts" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Luxury Resorts</Link>
              <Link to="/caterers" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Top Caterers</Link>
              <Link to="/planners" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Event Planners</Link>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-6">For Vendors</h4>
            <div className="flex flex-col gap-3">
              <Link to="/vendor/register" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">List your business</Link>
              <Link to="/vendor/login" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Vendor Login</Link>
              <Link to="/pricing" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Pricing Plans</Link>
              <Link to="/guidelines" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Partner Guidelines</Link>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-6">Support</h4>
            <div className="flex flex-col gap-3">
              <Link to="/help" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Help Center</Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Contact Us</Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Gomandap Technologies. All rights reserved.</p>
          <span className="text-sm text-gray-400 font-medium">Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
