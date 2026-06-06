import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const DynamicSEO = ({ appTarget = 'vendor', pageName = 'global' }) => {
  const [seoConfig, setSeoConfig] = useState(null);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await axios.get('https://gomandap-api.onrender.com/api/content');
        if (res.data && res.data.seoSettings) {
          // Find specific page config or fallback to global
          const specificSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === pageName);
          const globalSeo = res.data.seoSettings.find(s => s.targetApp === appTarget && s.page === 'global');
          setSeoConfig(specificSeo || globalSeo);
        }
      } catch (err) {
        // Backend /api/content route is not implemented yet, ignore 404 silently
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
      <link rel="canonical" href={`https://vendor.gomandap.com${window.location.pathname}${window.location.search}`} />
    </Helmet>
  );
};

export default DynamicSEO;
