import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { VENDOR_CATEGORIES, ONBOARDING_FAQ, ONBOARDING_STEPS } from '../../data/categoryData';

export default function CategoryOnboarding() {
  const { category } = useParams();
  const navigate = useNavigate();

  // Validate category exists
  if (!VENDOR_CATEGORIES[category]) {
    return <Navigate to="/onboarding" replace />;
  }

  const categoryData = VENDOR_CATEGORIES[category];
  const faqData = ONBOARDING_FAQ[category] || ONBOARDING_FAQ['banquet-halls'];
  const [expandedFAQ, setExpandedFAQ] = React.useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  // Generate Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://vendor.gomandap.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Onboarding',
        item: 'https://vendor.gomandap.com/onboarding'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryData.name,
        item: `https://vendor.gomandap.com/onboarding/${category}`
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const handleStartRegistration = () => {
    navigate('/login', { state: { selectedCategory: category } });
  };

  return (
    <>
      <Helmet>
        <title>{categoryData.title}</title>
        <meta name="description" content={categoryData.description} />
        <meta name="keywords" content={categoryData.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Open Graph */}
        <meta property="og:title" content={categoryData.title} />
        <meta property="og:description" content={categoryData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://vendor.gomandap.com/onboarding/${category}`} />
        <meta property="og:image" content="https://vendor.gomandap.com/og-vendor.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={categoryData.title} />
        <meta name="twitter:description" content={categoryData.description} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://vendor.gomandap.com/onboarding/${category}`} />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] pt-20 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 md:px-6 mb-16"
        >
          <div className="text-center mb-12">
            <div className="text-6xl md:text-8xl mb-6">{categoryData.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {categoryData.title.split('on Gomandap')[0]}
              <span className="text-brand-gold">on Gomandap</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {categoryData.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRegistration}
              className="px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-brand-gold/50 transition-all"
            >
              Register Now - It's Free
            </motion.button>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto px-4 md:px-6 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Why Join Gomandap?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryData.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-brand-gold/50 transition-all"
              >
                <div className="text-3xl mb-4">✓</div>
                <p className="text-white font-medium">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-6xl mx-auto px-4 md:px-6 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            What You'll Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryData.requirements.map((req, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <div className="text-2xl text-brand-gold flex-shrink-0">📋</div>
                <p className="text-white">{req}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Registration Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-6xl mx-auto px-4 md:px-6 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Registration in 5 Easy Steps
          </h2>
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-gold to-transparent" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {ONBOARDING_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-brand-gold to-yellow-500 flex items-center justify-center text-white font-bold text-lg md:text-base relative z-10">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto px-4 md:px-6 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <motion.div
                key={idx}
                className="border border-white/10 rounded-lg overflow-hidden bg-white/5 hover:border-brand-gold/50 transition-all"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? -1 : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFAQ === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-brand-gold flex-shrink-0"
                  >
                    ▼
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: expandedFAQ === idx ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 py-4 text-gray-300 border-t border-white/10">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="max-w-4xl mx-auto px-4 md:px-6 text-center"
        >
          <div className="bg-gradient-to-r from-brand-gold/20 to-yellow-500/20 border border-brand-gold/50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Grow Your Business?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of {categoryData.name.toLowerCase()} vendors already earning through Gomandap. Registration takes less than 5 minutes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRegistration}
              className="px-10 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-brand-gold/50 transition-all text-lg"
            >
              Start Registration Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
