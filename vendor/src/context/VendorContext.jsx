import React, { createContext, useContext, useState, useEffect } from 'react';

const VendorContext = createContext();

export const useVendor = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
  // 'unregistered', 'pending', 'approved'
  const [vendorStatus, setVendorStatus] = useState('unregistered');
  const [vendorProfile, setVendorProfile] = useState(null);

  // Load from local storage and sync with backend on mount
  useEffect(() => {
    const savedStatus = localStorage.getItem('gomandap_vendor_status');
    const savedProfileStr = localStorage.getItem('gomandap_vendor_profile');
    
    if (savedStatus) setVendorStatus(savedStatus);
    
    if (savedProfileStr) {
      const savedProfile = JSON.parse(savedProfileStr);
      setVendorProfile(savedProfile);
      
      // Sync with backend to get latest adminFeedback and status
      if (savedProfile._id) {
        fetch(`https://gomandap-api.onrender.com/api/vendors/${savedProfile._id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setVendorProfile(data.data);
              setVendorStatus(data.data.status);
              localStorage.setItem('gomandap_vendor_profile', JSON.stringify(data.data));
              localStorage.setItem('gomandap_vendor_status', data.data.status);
            }
          })
          .catch(err => console.error("Error syncing vendor profile:", err));
      }
    }
  }, []);

  const loginWithPhone = async (phoneNumber) => {
    try {
      const res = await fetch('https://gomandap-api.onrender.com/api/vendors/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.action === 'dashboard') {
          localStorage.setItem('gomandap_vendor_token', data.token);
          // Fetch the vendor profile using the ID
          const profileRes = await fetch(`https://gomandap-api.onrender.com/api/vendors/${data.vendorId}`);
          const profileData = await profileRes.json();
          if (profileData.success) {
            setVendorProfile(profileData.data);
            setVendorStatus(profileData.data.status);
            localStorage.setItem('gomandap_vendor_profile', JSON.stringify(profileData.data));
            localStorage.setItem('gomandap_vendor_status', profileData.data.status);
          }
        }
        return { success: true, action: data.action, phoneNumber: data.phoneNumber };
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    return { success: false };
  };

  const submitOnboarding = async (formData) => {
    try {
      const response = await fetch('https://gomandap-api.onrender.com/api/vendors/onboard', {
        method: 'POST',
        body: formData, 
      });
      const data = await response.json();

      if (data.success) {
        setVendorProfile(data.vendor);
        setVendorStatus('pending');
        localStorage.setItem('gomandap_vendor_profile', JSON.stringify(data.vendor));
        localStorage.setItem('gomandap_vendor_status', 'pending');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error connecting to server.' };
    }
  };

  const saveDraft = async (formData, vendorId = null) => {
    try {
      const url = vendorId 
        ? `https://gomandap-api.onrender.com/api/vendors/draft/${vendorId}` 
        : 'https://gomandap-api.onrender.com/api/vendors/draft';
      const method = vendorId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setVendorProfile(data.data);
        if (data.data.status === 'pending') {
          setVendorStatus('pending');
          localStorage.setItem('gomandap_vendor_status', 'pending');
        }
        localStorage.setItem('gomandap_vendor_profile', JSON.stringify(data.data));
        return { success: true, vendor: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error connecting to server.' };
    }
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
    localStorage.removeItem('gomandap_vendor_token');
  };

  return (
    <VendorContext.Provider value={{
      vendorStatus,
      vendorProfile,
      loginWithPhone,
      submitOnboarding,
      saveDraft,
      simulateAdminApproval,
      logoutVendor
    }}>
      {children}
    </VendorContext.Provider>
  );
};
