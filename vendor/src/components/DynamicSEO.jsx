import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { API_URL } from '../config/api';

const DynamicSEO = ({ appTarget = 'vendor', pageName = 'global' }) => {
  const [seoConfig, setSeoConfig] = useState(null);

  // Default SEO configuration with FREE onboarding messaging
  const DEFAULT_SEO_CONFIG = {
    vendor: {
      global: {
        title: 'Vendor Registration - Gomandap | FREE Wedding Vendor Portal | Zero Commission',
        description: 'Register as a wedding vendor on Gomandap - 100% FREE. Get access to 10,000+ customers. Zero commission on first 50 bookings. Join 1000+ vendors earning more.',
        keywords: 'vendor registration free, wedding vendor registration, become a vendor, vendor portal, vendor registration india, wedding vendor portal, free vendor registration',
      },
      landing: {
        title: 'Vendor Dashboard - Gomandap | Wedding Vendor Management | FREE Registration',
        description: 'Join Gomandap vendor community. Manage bookings, showcase portfolio, and grow your wedding business. 100% free vendor registration with zero subscription fees.',
        keywords: 'vendor dashboard, wedding vendor, vendor management, vendor portal, wedding service provider',
      }
    }
  };

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/content`);
        if (res.data && res.data.seoSettings) {
          // Find specific page config or fallback to global
          const specificSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === pageName);
          const globalSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === 'global');
          setSeoConfig(specificSeo || globalSeo);
        }
      } catch (err) {
        // Backend /api/content route is not implemented yet, use default config
        const config = DEFAULT_SEO_CONFIG[appTarget]?.[pageName] || DEFAULT_SEO_CONFIG[appTarget]?.global;
        setSeoConfig(config);
      }
    };
    fetchSeo();
  }, [appTarget, pageName]);

  // Generate Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gomandap Vendor Portal',
    url: 'https://vendor.gomandap.com',
    logo: 'https://vendor.gomandap.com/logo.svg',
    description: 'Premium free vendor registration portal for wedding service providers',
    sameAs: [
      'https://www.facebook.com/gomandap',
      'https://www.instagram.com/gomandap',
      'https://www.linkedin.com/company/gomandap'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN'
    }
  };

  // Generate WebSite Schema with search action
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://vendor.gomandap.com',
    name: 'Gomandap Vendor Portal',
    potentialAction: {
      '@type': 'RegisterAction',
      target: 'https://vendor.gomandap.com/onboarding',
      'object': {
        '@type': 'Thing',
        name: 'Free Vendor Registration'
      }
    }
  };

  if (!seoConfig) {
    // Use default config
    return (
      <Helmet>
        <title>{DEFAULT_SEO_CONFIG.vendor.global.title}</title>
        <meta name="description" content={DEFAULT_SEO_CONFIG.vendor.global.description} />
        <meta name="keywords" content={DEFAULT_SEO_CONFIG.vendor.global.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Open Graph */}
        <meta property="og:title" content={DEFAULT_SEO_CONFIG.vendor.global.title} />
        <meta property="og:description" content={DEFAULT_SEO_CONFIG.vendor.global.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vendor.gomandap.com" />
        <meta property="og:image" content="https://vendor.gomandap.com/og-vendor.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_SEO_CONFIG.vendor.global.title} />
        <meta name="twitter:description" content={DEFAULT_SEO_CONFIG.vendor.global.description} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://vendor.gomandap.com${window.location.pathname}${window.location.search}`} />
        
        {/* Cross-domain alternate link */}
        <link rel="alternate" href="https://gomandap.com" />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        
        {/* Additional meta tags */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
      </Helmet>
    );
  }

  return (
    <Helmet>
      {seoConfig.title && <title>{seoConfig.title}</title>}
      {seoConfig.description && <meta name="description" content={seoConfig.description} />}
      {seoConfig.keywords && <meta name="keywords" content={seoConfig.keywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      {seoConfig.title && <meta property="og:title" content={seoConfig.title} />}
      {seoConfig.description && <meta property="og:description" content={seoConfig.description} />}
      <link rel="canonical" href={`https://vendor.gomandap.com${window.location.pathname}${window.location.search}`} />
      <link rel="alternate" href="https://gomandap.com" />
    </Helmet>
  );
};

export default DynamicSEO;
