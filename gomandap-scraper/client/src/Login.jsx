import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="text-[#D4AF37]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Portal Login</h1>
          <p className="text-white/50 text-sm mt-1">Enter your assigned credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 text-red-500 text-sm font-bold p-3 rounded-xl border border-red-500/20 text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl mt-4 flex justify-center items-center gap-2 hover:bg-[#8C7323] transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Secure Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
