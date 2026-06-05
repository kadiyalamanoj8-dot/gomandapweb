import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Globe, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

const AdminContentManager = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('seo'); // 'seo', 'clientFooter', 'vendorFooter'

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/content`);
      setContent(res.data);
    } catch (err) {
      toast.error('Failed to load dynamic content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/api/content`, content, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Content saved successfully');
    } catch (err) {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers for SEO ---
  const addSeoRule = () => {
    setContent({
      ...content,
      seoSettings: [...content.seoSettings, { targetApp: 'client', page: 'new-page', title: '', description: '', keywords: '' }]
    });
  };

  const updateSeoRule = (index, field, value) => {
    const newSeo = [...content.seoSettings];
    newSeo[index][field] = value;
    setContent({ ...content, seoSettings: newSeo });
  };

  const removeSeoRule = (index) => {
    const newSeo = [...content.seoSettings];
    newSeo.splice(index, 1);
    setContent({ ...content, seoSettings: newSeo });
  };

  // --- Handlers for Footer ---
  const addFooterColumn = (appType) => {
    const newContent = { ...content };
    newContent[appType].columns.push({ title: 'New Column', links: [] });
    setContent(newContent);
  };

  const removeFooterColumn = (appType, colIndex) => {
    const newContent = { ...content };
    newContent[appType].columns.splice(colIndex, 1);
    setContent(newContent);
  };

  const addFooterLink = (appType, colIndex) => {
    const newContent = { ...content };
    newContent[appType].columns[colIndex].links.push({ label: 'New Link', url: '/' });
    setContent(newContent);
  };

  const updateFooterLink = (appType, colIndex, linkIndex, field, value) => {
    const newContent = { ...content };
    newContent[appType].columns[colIndex].links[linkIndex][field] = value;
    setContent(newContent);
  };

  const removeFooterLink = (appType, colIndex, linkIndex) => {
    const newContent = { ...content };
    newContent[appType].columns[colIndex].links.splice(linkIndex, 1);
    setContent(newContent);
  };

  const updateFooterBasic = (appType, field, value) => {
    const newContent = { ...content };
    newContent[appType][field] = value;
    setContent(newContent);
  };

  const addSocialLink = (appType) => {
    const newContent = { ...content };
    newContent[appType].socialLinks.push({ platform: 'facebook', url: '' });
    setContent(newContent);
  };

  const updateSocialLink = (appType, index, field, value) => {
    const newContent = { ...content };
    newContent[appType].socialLinks[index][field] = value;
    setContent(newContent);
  };

  const removeSocialLink = (appType, index) => {
    const newContent = { ...content };
    newContent[appType].socialLinks.splice(index, 1);
    setContent(newContent);
  };

  if (loading) return <div className="p-8 text-center text-white">Loading content manager...</div>;
  if (!content) return <div className="p-8 text-center text-white">No content found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="text-brand-primary" /> Dynamic Content Manager
          </h1>
          <p className="text-gray-400 mt-2">Manage SEO and Footer layouts across Client and Vendor apps.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/10 w-fit">
        <button 
          onClick={() => setActiveTab('seo')}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'seo' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          SEO Management
        </button>
        <button 
          onClick={() => setActiveTab('clientFooter')}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'clientFooter' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          Client App Footer
        </button>
        <button 
          onClick={() => setActiveTab('vendorFooter')}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'vendorFooter' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          Vendor App Footer
        </button>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">
        
        {/* SEO Management */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">SEO Rules</h2>
              <button onClick={addSeoRule} className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={16} /> Add Rule
              </button>
            </div>
            
            <div className="space-y-4">
              {content.seoSettings.map((rule, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-white/5 p-4 rounded-xl relative group">
                  <button onClick={() => removeSeoRule(idx)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target App</label>
                      <select 
                        value={rule.targetApp} 
                        onChange={(e) => updateSeoRule(idx, 'targetApp', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                      >
                        <option value="client">Client App</option>
                        <option value="vendor">Vendor App</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Page Name/Route</label>
                      <input 
                        type="text" 
                        value={rule.page} 
                        onChange={(e) => updateSeoRule(idx, 'page', e.target.value)}
                        placeholder="e.g. global, home, search"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Meta Title</label>
                      <input 
                        type="text" 
                        value={rule.title} 
                        onChange={(e) => updateSeoRule(idx, 'title', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Meta Description</label>
                      <textarea 
                        value={rule.description} 
                        onChange={(e) => updateSeoRule(idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Meta Keywords</label>
                      <input 
                        type="text" 
                        value={rule.keywords} 
                        onChange={(e) => updateSeoRule(idx, 'keywords', e.target.value)}
                        placeholder="Comma separated keywords"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {content.seoSettings.length === 0 && (
                <div className="text-center py-8 text-gray-500">No SEO rules configured.</div>
              )}
            </div>
          </div>
        )}

        {/* Footer Management (Rendered dynamically based on active tab) */}
        {(activeTab === 'clientFooter' || activeTab === 'vendorFooter') && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white capitalize">{activeTab === 'clientFooter' ? 'Client App Footer' : 'Vendor App Footer'}</h2>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">About Text</label>
                  <textarea 
                    value={content[activeTab].aboutText} 
                    onChange={(e) => updateFooterBasic(activeTab, 'aboutText', e.target.value)}
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Copyright Text</label>
                  <input 
                    type="text" 
                    value={content[activeTab].copyrightText} 
                    onChange={(e) => updateFooterBasic(activeTab, 'copyrightText', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-primary outline-none"
                  />
                </div>
              </div>
              
              {/* Social Links */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Links</h3>
                  <button onClick={() => addSocialLink(activeTab)} className="text-xs text-brand-primary hover:text-white flex items-center gap-1">
                    <Plus size={14} /> Add Social
                  </button>
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                  {content[activeTab].socialLinks.map((social, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={social.platform} 
                        onChange={(e) => updateSocialLink(activeTab, idx, 'platform', e.target.value)}
                        placeholder="Platform (e.g. facebook)"
                        className="w-1/3 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:border-brand-primary outline-none"
                      />
                      <input 
                        type="text" 
                        value={social.url} 
                        onChange={(e) => updateSocialLink(activeTab, idx, 'url', e.target.value)}
                        placeholder="https://"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:border-brand-primary outline-none"
                      />
                      <button onClick={() => removeSocialLink(activeTab, idx)} className="text-gray-500 hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Footer Columns */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-brand-primary" /> Footer Columns
                </h3>
                <button onClick={() => addFooterColumn(activeTab)} className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus size={16} /> Add Column
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content[activeTab].columns.map((col, colIdx) => (
                  <div key={colIdx} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 relative group">
                    <button onClick={() => removeFooterColumn(activeTab, colIdx)} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                    
                    <input 
                      type="text" 
                      value={col.title} 
                      onChange={(e) => {
                        const newContent = { ...content };
                        newContent[activeTab].columns[colIdx].title = e.target.value;
                        setContent(newContent);
                      }}
                      className="w-[85%] bg-transparent border-b border-white/10 text-lg font-bold text-white focus:border-brand-primary outline-none mb-4 pb-1"
                      placeholder="Column Title"
                    />

                    <div className="space-y-2">
                      {col.links.map((link, linkIdx) => (
                        <div key={linkIdx} className="flex gap-2 items-center bg-black/30 p-2 rounded-lg">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={(e) => updateFooterLink(activeTab, colIdx, linkIdx, 'label', e.target.value)}
                              placeholder="Link Label"
                              className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
                            />
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={(e) => updateFooterLink(activeTab, colIdx, linkIdx, 'url', e.target.value)}
                              placeholder="URL (e.g. /about)"
                              className="w-full bg-transparent border-none text-brand-primary text-xs outline-none placeholder-gray-600"
                            />
                          </div>
                          <button onClick={() => removeFooterLink(activeTab, colIdx, linkIdx)} className="text-gray-500 hover:text-red-500 px-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => addFooterLink(activeTab, colIdx)} 
                      className="mt-3 w-full py-2 border border-dashed border-white/20 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                    >
                      + Add Link
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentManager;
