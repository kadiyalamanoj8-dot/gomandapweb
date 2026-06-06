import React, { useEffect } from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';
import DynamicSEO from '../../components/DynamicSEO';

const VendorPrivacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 selection:bg-brand-primary/30">
      <DynamicSEO appTarget="vendor" pageName="vendor_privacy" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
            <Lock size={32} className="text-brand-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Vendor Privacy Policy</h1>
          <p className="text-white/50 text-lg">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div className="bg-[#111111] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 prose prose-invert prose-lg max-w-none">
          <p className="lead text-xl text-white/70 mb-8">
            This Privacy Policy explains how Gomandap Technologies Private Limited collects, uses, and safeguards the business and personal data of our registered Vendors. This policy strictly adheres to the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <Database className="text-brand-gold" /> 1. Data We Collect from Vendors
          </h2>
          <p className="text-white/80">To provide you with a functional storefront and route high-quality leads, we collect:</p>
          <ul className="space-y-3 text-white/70">
            <li><strong>Business Identity Data:</strong> Business Name, GSTIN (optional but recommended for ITC), PAN (if applicable), and registered business address.</li>
            <li><strong>Contact Data:</strong> Primary phone numbers, WhatsApp numbers, and email addresses used for lead notification.</li>
            <li><strong>Portfolio Data:</strong> Images, videos, and descriptions of your past work uploaded to our servers.</li>
            <li><strong>Analytics Data:</strong> How often you log in, your response times to leads, and engagement metrics on your public profile.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <Eye className="text-brand-gold" /> 2. Public vs. Private Data
          </h2>
          <p className="text-white/80">
            Gomandap is a public marketplace. It is crucial to understand the distinction between public and private data:
          </p>
          <ul className="space-y-3 text-white/70">
            <li><strong>Publicly Visible:</strong> Your business name, category, starting prices, portfolio images, city, and verified reviews are fully visible to search engines and the general public to maximize your SEO reach.</li>
            <li><strong>Strictly Private:</strong> Your backend login credentials, exact lead conversion metrics, subscription payment methods, and GSTIN documents are never shared publicly.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <ShieldCheck className="text-brand-gold" /> 3. Handling Client Data (DPDP Act)
          </h2>
          <p className="text-white/80">
            As a Vendor, Gomandap will pass Client leads (Name, Phone Number, Event Details) directly to you. Under the DPDP Act, you act as a Data Fiduciary for this information. You agree to:
          </p>
          <ul className="space-y-3 text-white/70">
            <li>Only use the Client's phone number to discuss the specific event inquiry they submitted.</li>
            <li>Not sell, rent, or distribute the Client's contact information to third-party marketers.</li>
            <li>Delete the Client's data upon their explicit request.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-6">4. Account Deletion and Data Retention</h2>
          <p className="text-white/70">
            You may request to delete your Vendor account at any time by contacting partner-support@gomandap.com. Upon deletion, your public profile will be removed within 72 hours. We may retain certain financial transaction records (invoices issued to you by Gomandap) for up to 8 years as required by Indian taxation and corporate laws.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorPrivacy;
