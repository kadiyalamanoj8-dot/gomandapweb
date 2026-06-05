import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { Clock, ShieldCheck, AlertCircle, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorPending = () => {
  const { vendorProfile, simulateAdminApproval } = useVendor();
  const navigate = useNavigate();

  if (!vendorProfile) {
    navigate('/');
    return null;
  }

  const handleSimulateApproval = () => {
    simulateAdminApproval();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 right-0 h-1 ${vendorProfile.status === 'rejected_with_feedback' ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}></div>
        
        {vendorProfile.status === 'rejected_with_feedback' ? (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Action Required</h1>
            <p className="text-sm font-semibold text-gray-500 mb-6 leading-relaxed">
              Our Trust & Safety team has reviewed your profile and requested some changes before approval.
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-left mb-8 space-y-3">
              <h3 className="text-sm font-bold text-red-800">Feedback from Admin:</h3>
              {vendorProfile.adminFeedback?.map((fb, i) => (
                <div key={i} className="text-sm bg-white p-3 rounded-xl shadow-sm border border-red-100">
                  <span className="font-bold text-red-600 block mb-1">Field: {fb.field}</span>
                  <span className="text-gray-700 font-medium">{fb.message}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-black text-sm shadow-md hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Edit size={16} /> Edit Application
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-orange-500" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2">Awaiting Approval</h1>
            <p className="text-sm font-semibold text-gray-500 mb-8 leading-relaxed">
              Thank you for registering <strong>{vendorProfile.name}</strong>. Our Trust & Safety team is reviewing your profile to ensure it meets Gomandap's premium quality standards.
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left mb-8">
              <ShieldCheck size={24} className="text-brand-primary shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Quality Assurance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Approval usually takes 24-48 hours.</p>
              </div>
            </div>

            {/* Hidden button to simulate approval since we don't have Supabase connected yet */}
            <button 
              onClick={handleSimulateApproval}
              className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-colors"
            >
              [Dev Only] Simulate Admin Approval
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VendorPending;
