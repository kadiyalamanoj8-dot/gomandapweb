import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, ShieldCheck, QrCode, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../../config/api';

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      // In a real app we'd get the username from context/token. Hardcoded to 'admin' for now.
      const res = await axios.post(`${API_URL}/api/auth/admin/2fa/setup`, { username: 'admin' });
      if (res.data.success) {
        setSetupData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (token.length !== 6) return;
    
    setVerifying(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/2fa/verify`, {
        username: 'admin',
        token,
        secret: setupData.secret
      });
      
      if (res.data.success) {
        toast.success('Two-Factor Authentication enabled successfully!');
        setSetupData(null);
        setToken('');
        // Reload page to reflect new status, or lift state up
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Secret copied to clipboard');
  };

  return (
    <div className="bg-brand-black border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Shield className="text-brand-primary" size={24} />
        <h2 className="text-xl font-bold text-white">Security Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Two-Factor Authentication (2FA)
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20 font-bold uppercase tracking-wider">
                  Not Setup
                </span>
              </h3>
              <p className="text-gray-400 mt-2 text-sm max-w-2xl">
                Add an extra layer of security to your admin account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile app (like Google Authenticator or Authy) to sign in.
              </p>
            </div>
            {!setupData && (
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                Enable 2FA
              </button>
            )}
          </div>

          {setupData && (
            <div className="mt-8 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <QrCode size={20} className="text-brand-primary" />
                Configure Authenticator App
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                    <img 
                      src={setupData.qrCode} 
                      alt="2FA QR Code" 
                      className="mx-auto w-48 h-48 bg-white p-2 rounded-xl shadow-xl"
                    />
                    <p className="text-sm text-gray-400 mt-4">
                      Scan this QR code with your authenticator app.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Or enter setup key manually
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-brand-primary font-mono text-sm break-all">
                        {setupData.secret}
                      </code>
                      <button 
                        onClick={copySecret}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                        title="Copy Secret"
                      >
                        {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-5">
                    <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-brand-primary" />
                      Verify Setup
                    </h5>
                    <p className="text-sm text-gray-400 mb-4">
                      Enter the 6-digit code generated by your app to verify and enable Two-Factor Authentication.
                    </p>
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={token}
                        onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-2xl tracking-[0.5em] text-center placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setSetupData(null); setToken(''); }}
                          className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={token.length !== 6 || verifying}
                          className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {verifying ? <Loader2 size={18} className="animate-spin" /> : 'Verify Code'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
