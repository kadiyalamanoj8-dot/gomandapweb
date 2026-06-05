import React, { createContext, useContext, useState, useEffect } from 'react';

const VendorContext = createContext();

export const useVendor = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
  // 'unregistered', 'pending', 'approved'
  const [vendorStatus, setVendorStatus] = useState('unregistered');
  const [vendorProfile, setVendorProfile] = useState(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedStatus = localStorage.getItem('gomandap_vendor_status');
    const savedProfile = localStorage.getItem('gomandap_vendor_profile');
    if (savedStatus) setVendorStatus(savedStatus);
    if (savedProfile) setVendorProfile(JSON.parse(savedProfile));
  }, []);

  const submitOnboarding = (profileData) => {
    setVendorProfile(profileData);
    setVendorStatus('pending');
    localStorage.setItem('gomandap_vendor_profile', JSON.stringify(profileData));
    localStorage.setItem('gomandap_vendor_status', 'pending');
  };

  const simulateAdminApproval = () => {
    setVendorStatus('approved');
    localStorage.setItem('gomandap_vendor_status', 'approved');
  };

  const logoutVendor = () => {
    setVendorStatus('unregistered');
    setVendorProfile(null);
    localStorage.removeItem('gomandap_vendor_status');
    localStorage.removeItem('gomandap_vendor_profile');
  };

  return (
    <VendorContext.Provider value={{
      vendorStatus,
      vendorProfile,
      submitOnboarding,
      simulateAdminApproval,
      logoutVendor
    }}>
      {children}
    </VendorContext.Provider>
  );
};
