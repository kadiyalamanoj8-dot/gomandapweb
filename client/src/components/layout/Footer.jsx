import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageCircle, AtSign, Globe, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Footer = () => {
  const { t } = useTranslation();
  const defaultFooterData = {
    aboutText: "Your ultimate marketplace for discovering the finest wedding venues, top-tier caterers, and premium event services across India.",
    socialLinks: [
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
      { platform: "twitter", url: "#" }
    ],
    columns: [
      {
        title: "Explore",
        links: [
          { label: "Venues", url: "/search?category=Venues" },
          { label: "Vendors", url: "/search" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About Us", url: "#" },
          { label: "Contact", url: "#" }
        ]
      },
      {
        title: "For Vendors",
        links: [
          { label: "Register Here", url: "https://vendor.gomandap.com" },
          { label: "Vendor Portal", url: "https://vendor.gomandap.com" }
        ]
      }
    ],
    copyrightText: `© ${new Date().getFullYear()} Gomandap. All rights reserved.`
  };

  const [footerData, setFooterData] = useState(defaultFooterData);
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/content');
        if (res.data && res.data.clientFooter) {
          setFooterData(res.data.clientFooter);
        }
      } catch (err) {
        console.error("Failed to load dynamic footer:", err);
      }
    };
    fetchFooter();
  }, []);

  const getIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Globe size={18} />;
    if (p.includes('instagram')) return <AtSign size={18} />;
    if (p.includes('twitter') || p.includes('x')) return <MessageCircle size={18} />;
    if (p.includes('linkedin')) return <Share2 size={18} />;
    if (p.includes('youtube')) return <LinkIcon size={18} />;
    return <Globe size={18} />;
  };

  // No more blocking loading state!

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-24 md:pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center">
              <img src="/logo.svg" alt="Gomandap Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {footerData.aboutText || "Your ultimate marketplace for discovering the finest wedding venues, top-tier caterers, and premium event services across India."}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {footerData.socialLinks && footerData.socialLinks.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm">
                  {getIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-8">
            {footerData.columns && footerData.columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="text-base font-bold text-gray-900 mb-6">{col.title}</h4>
                <div className="flex flex-col gap-3">
                  {col.links.map((link, lIdx) => (
                    link.url.startsWith('/') ? (
                      <Link key={lIdx} to={link.url} className="text-sm text-gray-500 hover:text-brand-primary transition-colors">{link.label}</Link>
                    ) : (
                      <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-brand-primary transition-colors">{link.label}</a>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 font-medium">
            {footerData.copyrightText || `© ${new Date().getFullYear()} ${t('footer_rights', 'Gomandap. All rights reserved.')}`}
          </p>
          <div className="flex items-center gap-6">
            <a href="https://vendor.gomandap.com" className="text-sm text-brand-primary hover:text-brand-primary-hover font-bold transition-colors">Vendor Registration</a>
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-gray-900 transition-colors font-medium">{t('footer_privacy')}</Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-gray-900 transition-colors font-medium">{t('footer_terms')}</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-400 font-medium max-w-4xl leading-relaxed">
            All images, videos, and graphical assets are the exclusive intellectual property of Gomandap. They are generated for the sole purpose of Gomandap and are strictly owned by us. Made with ❤️ for the Gomandap community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
