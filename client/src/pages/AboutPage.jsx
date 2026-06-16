import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
        >
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 text-center">About GoMandap</h1>
          <div className="prose prose-brand max-w-none text-gray-600 leading-relaxed space-y-6">
            <p>
              Welcome to <strong>GoMandap</strong>, your ultimate marketplace for discovering the finest wedding venues, top-tier caterers, and premium event services across India.
            </p>
            <p>
              Planning a wedding in India is a monumental task. From finding the perfect Kalyana Mandapam or luxury resort to booking the best makeup artists and photographers, it requires endless coordination. We created GoMandap to simplify this journey.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p>
              To bring transparency, ease, and joy back into wedding planning by connecting couples with verified, high-quality vendors through an immersive digital platform.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why We Are Different</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Immersive 3D Tours:</strong> Step inside your dream venue before you even visit it in person.</li>
              <li><strong>Verified Vendors:</strong> We do the background checks so you don't have to. Every vendor is vetted for quality.</li>
              <li><strong>Transparent Pricing:</strong> No hidden costs. Get upfront pricing and genuine reviews to make informed decisions.</li>
              <li><strong>End-to-End Planning:</strong> From the engagement ring to the honeymoon package, we have you covered.</li>
            </ul>
            <p className="mt-8 font-medium">
              Join thousands of happy couples who have planned their perfect day with GoMandap. Let us make your dream wedding a reality!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
