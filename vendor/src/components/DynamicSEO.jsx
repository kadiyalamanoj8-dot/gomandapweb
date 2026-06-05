import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const DynamicSEO = ({ appTarget = 'vendor', pageName = 'global' }) => {
  const [seoConfig, setSeoConfig] = useState(null);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/content');
        if (res.data && res.data.seoSettings) {
          // Find specific page config or fallback to global
          const specificSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === pageName);
          const globalSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === 'global');
          setSeoConfig(specificSeo || globalSeo);
        }
      } catch (err) {
        console.error("Failed to load SEO config:", err);
      }
    };
    fetchSeo();
  }, [appTarget, pageName]);

  if (!seoConfig) return null;

  return (
    <Helmet>
      {seoConfig.title && <title>{seoConfig.title}</title>}
      {seoConfig.description && <meta name="description" content={seoConfig.description} />}
      {seoConfig.keywords && <meta name="keywords" content={seoConfig.keywords} />}
      {seoConfig.title && <meta property="og:title" content={seoConfig.title} />}
      {seoConfig.description && <meta property="og:description" content={seoConfig.description} />}
    </Helmet>
  );
};

export default DynamicSEO;
