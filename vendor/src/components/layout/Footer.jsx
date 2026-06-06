import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageCircle, AtSign, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const Footer = () => {
  const defaultFooterData = {
    aboutText: "The ultimate growth engine for event professionals. Manage bookings, capture premium leads, and elevate your brand.",
    socialLinks: [
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
      { platform: "twitter", url: "#" }
    ],
    columns: [
      {
        title: "Platform",
        links: [
          { label: "Dashboard", url: "/vendor/dashboard" },
          { label: "Leads", url: "/vendor/leads" }
        ]
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", url: "#" },
          { label: "Contact Us", url: "#" }
        ]
      }
    ],
    copyrightText: `© ${new Date().getFullYear()} Gomandap Inc. All rights reserved.`
  };

  const [footerData, setFooterData] = useState(defaultFooterData);
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/content');
        if (res.data && res.data.vendorFooter) {
          setFooterData(res.data.vendorFooter);
        }
      } catch (err) {
        console.error("Failed to load dynamic vendor footer:", err);
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
    <footer className="bg-[#111111] py-16 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-black text-white tracking-tight">Gomandap <span className="text-brand-primary">Business</span></div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {footerData.aboutText || "The ultimate growth engine for event professionals. Manage bookings, capture premium leads, and elevate your brand."}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {footerData.socialLinks && footerData.socialLinks.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all">
                  {getIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerData.columns && footerData.columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="text-base font-bold text-white mb-6">{col.title}</h4>
                <div className="flex flex-col gap-3">
                  {col.links.map((link, lIdx) => (
                    link.url.startsWith('/') ? (
                      <Link key={lIdx} to={link.url} className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                    ) : (
                      <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</a>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 font-medium border-t border-white/10 pt-8">
          <div>{footerData.copyrightText || `© ${new Date().getFullYear()} Gomandap Inc. All rights reserved.`}</div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
