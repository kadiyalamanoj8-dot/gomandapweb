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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Animated Floating Orbs */}
      <motion.div 
        animate={{ y: [-20, 20, -20], x: [-20, 20, -20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] will-change-transform"
      />
      <motion.div 
        animate={{ y: [20, -20, 20], x: [20, -20, 20] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] will-change-transform"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10 will-change-transform"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20"
          >
            <Shield className="text-white" size={36} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gomandap Portal</h1>
          <p className="text-white/60 text-sm mt-2 font-medium">Enterprise Intelligence System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/20 text-red-300 text-sm font-bold p-4 rounded-xl border border-red-500/30 flex items-center gap-2">
              ⚠️ {error}
            </motion.div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              required
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all backdrop-blur-md" 
              placeholder="Enter your assigned ID"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all backdrop-blur-md" 
              placeholder="Enter your secure password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-4 rounded-2xl mt-8 flex justify-center items-center gap-2 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Secure Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
