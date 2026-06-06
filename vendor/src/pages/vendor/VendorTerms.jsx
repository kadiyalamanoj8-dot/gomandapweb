import React, { useEffect } from 'react';
import { FileText, Building2, Receipt, ShieldAlert } from 'lucide-react';
import DynamicSEO from '../../components/DynamicSEO';

const VendorTerms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 selection:bg-brand-primary/30">
      <DynamicSEO appTarget="vendor" pageName="vendor_terms" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
            <FileText size={32} className="text-brand-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Vendor Terms of Service</h1>
          <p className="text-white/50 text-lg">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div className="bg-[#111111] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 prose prose-invert prose-lg max-w-none">
          <p className="lead text-xl text-white/70 mb-8">
            Welcome to the Gomandap Business Partner Network. These terms exclusively govern your relationship as a registered Event Professional or Venue Owner ("Vendor") with Gomandap Technologies Private Limited ("Gomandap").
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <Building2 className="text-brand-gold" /> 1. The Zero-Commission Business Model
          </h2>
          <p className="text-white/80">
            Gomandap operates strictly as a lead-generation and discovery marketplace. We do not act as an agency or a middleman in your transactions.
          </p>
          <ul className="space-y-3 text-white/70">
            <li><strong>Zero Commissions:</strong> We charge 0% commission on the bookings you secure through our platform. What you earn from the client is 100% yours.</li>
            <li><strong>Subscription / Listing Fees:</strong> Instead of commissions, Gomandap may charge a flat subscription or listing fee to maintain your premium presence on the platform. This fee is non-refundable and subject to GST.</li>
            <li><strong>Direct Contracting:</strong> You are responsible for executing your own contracts, collecting advances, and managing deliverables directly with the Client. Gomandap is not a party to your service contract.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <Receipt className="text-brand-gold" /> 2. GST & Taxation Obligations
          </h2>
          <p className="text-white/80">
            As an independent business owner operating on Gomandap, you are solely responsible for your tax compliance under the laws of India.
          </p>
          <ul className="space-y-3 text-white/70">
            <li><strong>GST Invoicing:</strong> You must issue a valid GST-compliant invoice (if your business is GST registered) directly to the Client for your services.</li>
            <li><strong>Platform Invoices:</strong> For any subscription or lead fees paid to Gomandap, we will issue a valid tax invoice to you inclusive of 18% GST. You may claim Input Tax Credit (ITC) if you provide us with your valid GSTIN during onboarding.</li>
            <li><strong>TCS/TDS Compliance:</strong> Because Gomandap does not collect payments on your behalf for the actual event booking, Section 52 of the CGST Act (TCS by E-Commerce Operators) does not apply to our relationship. You handle your own revenue.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mt-12 mb-6">
            <ShieldAlert className="text-brand-gold" /> 3. Platform Rules & Suspension
          </h2>
          <p className="text-white/80">
            To maintain the integrity of our marketplace, we enforce strict quality and behavioral standards:
          </p>
          <ul className="space-y-3 text-white/70">
            <li><strong>Profile Accuracy:</strong> All images, pricing, and amenities listed on your profile must be 100% accurate. Uploading stolen portfolio images is grounds for immediate, permanent bans.</li>
            <li><strong>Client Communication:</strong> You are expected to respond to client leads within 24-48 hours. Repeated failure to respond may result in an algorithmic penalty reducing your visibility.</li>
            <li><strong>No Off-Platform Misdirection:</strong> While you contract directly, actively discouraging clients from using Gomandap for future discovery violates our community standards.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-6">4. Limitation of Liability</h2>
          <p className="text-white/70">
            Gomandap provides the platform "as-is". We do not guarantee a specific number of leads, bookings, or revenue. We are not liable for any disputes, unpaid dues, or cancellations initiated by the Client. Your business risks remain entirely your own.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorTerms;
