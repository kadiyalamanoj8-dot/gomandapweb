import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, RefreshCw } from 'lucide-react';
import IOSToggle from '../components/ui/IOSToggle';

const ALL_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];

const LanguageSettings = () => {
  const [activeLanguages, setActiveLanguages] = useState(['en']);
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    try {
      const res = await axios.get('https://gomandap-api.onrender.com/api/settings');
      if (res.data && res.data.data && res.data.data.activeLanguages) {
        setActiveLanguages(res.data.data.activeLanguages);
      }
    } catch (err) {
      console.error('Failed to fetch language settings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, []);

  const toggleLanguage = async (languageCode) => {
    if (languageCode === 'en') return; // Cannot disable English

    const currentlyEnabled = activeLanguages.includes(languageCode);
    const newEnabledState = !currentlyEnabled;

    // Optimistic update
    setActiveLanguages(prev => 
      newEnabledState ? [...prev, languageCode] : prev.filter(l => l !== languageCode)
    );

    try {
      await axios.patch('https://gomandap-api.onrender.com/api/settings/languages/toggle', {
        language: languageCode,
        enabled: newEnabledState
      });
    } catch (err) {
      console.error('Failed to toggle language:', err);
      // Revert on failure
      fetchSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <RefreshCw className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Globe className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Language Settings</h1>
          <p className="text-gray-500">Manage which languages are available on the Client and Vendor platforms.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Language</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Native Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ALL_LANGUAGES.map((lang) => {
              const isEnabled = activeLanguages.includes(lang.code);
              const isEnglish = lang.code === 'en';

              return (
                <tr key={lang.code} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lang.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {lang.nativeName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEnglish ? (
                      <span className="text-xs text-gray-400 font-medium italic mr-2">Default</span>
                    ) : (
                      <IOSToggle 
                        enabled={isEnabled} 
                        onChange={() => toggleLanguage(lang.code)} 
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LanguageSettings;
