import React, { useEffect } from 'react';
import { Lock, Eye, Database, ShieldCheck } from 'lucide-react';
import DynamicSEO from '../components/DynamicSEO';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 selection:bg-brand-primary/20">
      <DynamicSEO appTarget="client" pageName="privacy" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-brand-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-lg">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none">
          <p className="lead text-xl text-gray-600 mb-8">
            At Gomandap, accessible from gomandap.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Gomandap and how we use it, in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
          </p>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mt-12 mb-6">
            <Database className="text-brand-primary" /> 1. Information We Collect
          </h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes:</p>
          <ul className="space-y-2 text-gray-600">
            <li><strong>Identity Data:</strong> Full name, username, and profile picture (via Google OAuth or direct signup).</li>
            <li><strong>Contact Data:</strong> Phone numbers (verified via OTP) and email addresses.</li>
            <li><strong>Event Data:</strong> Wedding/event dates, estimated guest counts, and budget preferences to help match you with vendors.</li>
            <li><strong>Technical Data:</strong> IP addresses, browser types, and device identifiers collected via cookies.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mt-12 mb-6">
            <Eye className="text-brand-primary" /> 2. How We Use Your Information
          </h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="space-y-2 text-gray-600">
            <li>Provide, operate, and maintain our website and matching algorithms.</li>
            <li>Facilitate direct communication between you and the Vendors you request quotes from.</li>
            <li>Send you SMS/WhatsApp updates regarding your vendor inquiries and booking statuses.</li>
            <li>Improve, personalize, and expand our website features.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mt-12 mb-6">
            <ShieldCheck className="text-brand-primary" /> 3. Information Sharing with Vendors
          </h2>
          <p>
            Gomandap is a marketplace. When you explicitly request a quote or click "Contact Vendor", you consent to us sharing your Name, Phone Number, and Event Details with that specific Vendor so they can fulfill your request. We strictly prohibit Vendors from using your data for unsolicited marketing beyond your specific event inquiry.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. Our databases are secured using Firebase and MongoDB Atlas with end-to-end encryption. However, please note that no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Your Rights (DPDP Act Compliance)</h2>
          <p>
            As a resident of India, under the DPDP Act, you have the right to:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>Request a summary of your personal data being processed by us.</li>
            <li>Correct or update inaccurate personal data.</li>
            <li>Request the erasure of your personal data from our systems ("Right to be Forgotten").</li>
            <li>Withdraw consent for data processing at any time.</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact our Grievance Officer at legal@gomandap.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
