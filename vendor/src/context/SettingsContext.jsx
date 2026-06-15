import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const SettingsContext = createContext({ disabledCategories: [] });

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [disabledCategories, setDisabledCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDisabledCategories(data.data.disabledCategories || []);
        }
      })
      .catch(err => console.error('Failed to load platform settings:', err));
  }, []);

  const isCategoryEnabled = (label) => !disabledCategories.includes(label);

  return (
    <SettingsContext.Provider value={{ disabledCategories, isCategoryEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};
