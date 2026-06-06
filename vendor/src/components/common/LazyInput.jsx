import React, { useState, useEffect } from 'react';

const LazyInput = ({ value, onChange, className, placeholder, type = "text", ...props }) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync if external value changes unexpectedly
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    if (localValue !== value) {
      // Simulate an event object to match standard onChange signature
      onChange({ target: { value: localValue } });
    }
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
