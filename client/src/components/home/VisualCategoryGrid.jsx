import React from 'react';
import { VENUE_CATEGORIES, VENDOR_CATEGORIES } from '../../data/mockData';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

const VisualCategoryGrid = () => {
  const navigate = useNavigate();
  const { isCategoryEnabled } = useSettings();

  const activeVenueCategories = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Venues Section */}
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Find Wedding Venues</h2>
          <p className="text-sm font-semibold text-gray-500 mb-6">Discover the perfect location for your grand celebration.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {activeVenueCategories.map((cat, idx) => (
              <motion.div 
                key={cat.id}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.label)}`)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:border-brand-primary/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-3 group-hover:scale-110 group-hover:bg-brand-primary/10 transition-transform">
                  <IconComponent name={cat.iconName} size={24} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-700 leading-tight group-hover:text-brand-primary transition-colors">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vendors Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Book Expert Vendors</h2>
          <p className="text-sm font-semibold text-gray-500 mb-6">From photographers to makeup artists, find the best professionals.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {activeVendorCategories.slice(0, 14).map((cat, idx) => (
              <motion.div 
                key={cat.id}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.label)}`)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:border-brand-secondary/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/5 flex items-center justify-center text-brand-secondary mb-3 group-hover:scale-110 group-hover:bg-brand-secondary/10 transition-transform">
                  <IconComponent name={cat.iconName} size={24} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-700 leading-tight group-hover:text-brand-secondary transition-colors">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default VisualCategoryGrid;
