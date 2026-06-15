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
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/login`, credentials);
      if (res.data.token) {
        login(res.data.token);
        navigate('/vendors');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
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
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                required
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white font-semibold placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white font-semibold placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing In...</>
              ) : (
                <><ShieldCheck size={18} /> Sign In to Admin</>
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
