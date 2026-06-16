import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [credentials, setCredentials] = useState({ totpToken: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/login`, {
        totpToken: credentials.totpToken
      });
      if (res.data.token) {
        login(res.data.token);
        navigate('/vendors');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Network Error or Invalid Code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="Gomandap" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Admin <span className="text-brand-primary">Panel</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Sign in to manage the platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck size={32} className="text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Admin Authentication</h3>
                <p className="text-sm text-gray-400 mt-2">Enter the 6-digit code from your authenticator app</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                  Authentication Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={credentials.totpToken}
                  onChange={e => setCredentials({ ...credentials, totpToken: e.target.value.replace(/\D/g, '') })}
                  placeholder="000000"
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-2xl tracking-[0.5em] text-center placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </motion.div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || credentials.totpToken.length !== 6}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
              ) : (
                <><ShieldCheck size={18} /> Verify Code</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 font-medium">
          Gomandap Platform Admin · Restricted Access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
