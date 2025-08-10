import React from 'react';

interface UnitSelectorProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (unit: 'mg/dL' | 'mmol/L') => void;
  disabled?: boolean;
  className?: string;
  'aria-describedby'?: string;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  'aria-describedby': ariaDescribedBy,
}) => {
  const fieldId = `unit-selector-${name}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as 'mg/dL' | 'mmol/L');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          text-gray-900 bg-white
        `.trim()}
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UnitSelector;