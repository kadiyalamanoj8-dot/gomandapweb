import React from 'react';
import { motion } from 'framer-motion';

const IOSToggle = ({ enabled, onChange }) => {
  return (
    <div
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out ${
        enabled ? 'bg-green-500' : 'bg-gray-200'
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </div>
  );
};

export default IOSToggle;
