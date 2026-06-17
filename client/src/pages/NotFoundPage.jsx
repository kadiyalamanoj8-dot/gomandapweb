import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pt-20">
      <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
            <span className="text-4xl font-black text-gray-300">404</span>
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Lost Your Way?</h1>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a new mandap. Let's get you back on track!
          </p>
          
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary hover:bg-[#D41B4D] text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 hover:-translate-y-1 active:translate-y-0"
          >
            <Icons.Home size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
