import React, { useState, useEffect } from 'react';

const LazyInput = ({ value, onChange, className, placeholder, type = "text", ...props }) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync if external value changes unexpectedly
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
    onChange(e); // Sync immediately to prevent stale closures
  };

  const handleBlur = (e) => {
    // Keep handleBlur for compatibility if needed, but logic is handled in handleChange
  };

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default LazyInput;
