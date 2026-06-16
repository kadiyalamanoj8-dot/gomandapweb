import React, { createContext, useContext, useState, useCallback } from 'react';
import PermissionPrompt from '../components/common/PermissionPrompt';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [promptConfig, setPromptConfig] = useState({
    isOpen: false,
    type: 'location', // 'location' or 'notifications'
    resolvePromise: null,
  });

  // Call this function when you want to ask for permission. 
  // It returns a promise that resolves to true if they accepted the UI prompt, and false if they declined.
  // Note: If it resolves to true, YOU still need to trigger the actual browser API (e.g. navigator.geolocation)
  const requestPermission = useCallback((type) => {
    return new Promise((resolve) => {
      // Check if they previously completely denied it in the browser (optional, but good practice)
      // For now, we just show the prompt
      setPromptConfig({
        isOpen: true,
        type,
        resolvePromise: resolve
      });
    });
  }, []);

  const handleClose = () => {
    if (promptConfig.resolvePromise) {
      promptConfig.resolvePromise(false);
    }
    setPromptConfig({ ...promptConfig, isOpen: false });
  };

  const handleAccept = () => {
    if (promptConfig.resolvePromise) {
      promptConfig.resolvePromise(true);
    }
    setPromptConfig({ ...promptConfig, isOpen: false });
  };

  return (
    <PermissionContext.Provider value={{ requestPermission }}>
      {children}
      <PermissionPrompt 
        isOpen={promptConfig.isOpen} 
        type={promptConfig.type} 
        onClose={handleClose}
        onAccept={handleAccept}
      />
    </PermissionContext.Provider>
  );
};
