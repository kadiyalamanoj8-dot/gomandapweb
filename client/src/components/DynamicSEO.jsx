import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { API_URL } from '../../config/api';

const DynamicSEO = ({ appTarget = 'client', pageName = 'global', customSchema = null }) => {
  const [seoConfig, setSeoConfig] = useState(null);

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
      {customSchema?.image?.[0] ? (
        <meta property="og:image" content={customSchema.image[0]} />
      ) : (
        <meta property="og:image" content="https://gomandap.com/og-image.png" />
      )}
      <link rel="canonical" href={`https://gomandap.com${window.location.pathname}${window.location.search}`} />
      {(customSchema || seoConfig.schema) && (
        <script type="application/ld+json">
          {JSON.stringify(customSchema || seoConfig.schema)}
        </script>
      )}
    </Helmet>
  );
};

export default DynamicSEO;
