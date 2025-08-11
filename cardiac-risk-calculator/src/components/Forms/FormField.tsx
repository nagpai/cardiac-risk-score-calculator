import React, { forwardRef, useRef, useEffect } from 'react';
import type { FormFieldProps } from '../../types';
import { useKeyboardNavigation } from '../../hooks/useAccessibility';
import { EnhancedTooltip } from '../Education';

interface ExtendedFormFieldProps extends FormFieldProps {
  value?: string | number | boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  autoFocus?: boolean;
}

const FormField = forwardRef<HTMLInputElement | HTMLSelectElement, ExtendedFormFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      required = false,
      min,
      max,
      step,
      options,
      tooltip,
      unit,
      error,
      value,
      onChange,
      onBlur,
      disabled = false,
      className = '',
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    const fieldId = `field-${name}`;
    const errorId = `${fieldId}-error`;
    const tooltipId = `${fieldId}-tooltip`;
    const unitId = `${fieldId}-unit`;
    const radioGroupRef = useRef<HTMLFieldSetElement>(null);

    // Enhanced keyboard navigation for radio groups
    const radioElements = radioGroupRef.current 
      ? Array.from(radioGroupRef.current.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]
      : [];
    
    const { handleKeyDown } = useKeyboardNavigation(radioElements, 'vertical');

    const baseInputClasses = `
      w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error 
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 text-gray-900 placeholder-gray-400'
      }
      ${className}
    `.trim();

    const describedByIds = [
      tooltip && tooltipId,
      error && errorId,
      unit && unitId,
      ariaDescribedBy
    ].filter(Boolean).join(' ');

    // Auto-focus handling
    useEffect(() => {
      if (autoFocus && ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, [autoFocus, ref]);

    // Get detailed tooltip content based on field name
    const getDetailedTooltipContent = (fieldName: string): string | undefined => {
      const detailedContent: Record<string, string> = {
        age: 'The Framingham Risk Score is validated for ages 30-79 years. Age is one of the strongest predictors of cardiovascular risk, with risk increasing significantly after age 45 for men and 55 for women.',
        totalCholesterol: 'Total cholesterol includes both HDL (good) and LDL (bad) cholesterol plus other lipid components. Normal levels are typically below 200 mg/dL (5.2 mmol/L). Higher levels increase cardiovascular risk.',
        hdlCholesterol: 'HDL (High-Density Lipoprotein) is known as "good" cholesterol because it helps remove other forms of cholesterol from the bloodstream. Higher HDL levels are protective against heart disease. Levels above 40 mg/dL (1.0 mmol/L) for men and 50 mg/dL (1.3 mmol/L) for women are desirable.',
        systolicBP: 'Systolic blood pressure is the pressure in your arteries when your heart beats. It\'s the top number in a blood pressure reading. Normal is less than 120 mmHg. Values of 130 mmHg or higher indicate high blood pressure.',
        diastolicBP: 'Diastolic blood pressure is the pressure in your arteries when your heart rests between beats. It\'s the bottom number in a blood pressure reading. Normal is less than 80 mmHg. Values of 80 mmHg or higher may indicate high blood pressure.',
        smokingStatus: 'Smoking dramatically increases cardiovascular risk by damaging blood vessels, reducing oxygen in blood, and promoting blood clot formation. Even former smokers have elevated risk compared to never smokers, but quitting provides immediate and long-term benefits.',
        bloodGlucose: 'Blood glucose levels help assess diabetes risk. Fasting glucose levels of 126 mg/dL (7.0 mmol/L) or higher indicate diabetes. Diabetes significantly increases cardiovascular risk through blood vessel and nerve damage.'
      };
      return detailedContent[fieldName];
    };

    const renderInput = () => {
      if (type === 'select' && options) {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={fieldId}
            name={name}
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            aria-describedby={describedByIds || undefined}
            aria-invalid={ariaInvalid || !!error}
            autoFocus={autoFocus}
            {...props}
          >
            <option value="" disabled>
              {placeholder || `Select ${label.toLowerCase()}`}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === 'radio' && options) {
        return (
          <fieldset 
            ref={radioGroupRef}
            className="space-y-2"
            onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
            role="radiogroup"
            aria-labelledby={`${fieldId}-legend`}
            aria-describedby={describedByIds || undefined}
            aria-invalid={ariaInvalid || !!error}
            aria-required={required}
          >
            <legend id={`${fieldId}-legend`} className="sr-only">{label}</legend>
            {options.map((option, index) => (
              <label 
                key={option.value} 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <input
                  ref={index === 0 ? ref as React.Ref<HTMLInputElement> : undefined}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  required={required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-2 border-gray-300 transition-colors"
                  aria-describedby={error ? errorId : undefined}
                  {...props}
                />
                <span className="text-sm text-gray-700 select-none">{option.label}</span>
              </label>
            ))}
          </fieldset>
        );
      }

      if (type === 'checkbox') {
        return (
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type="checkbox"
              id={fieldId}
              name={name}
              checked={!!value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-2 border-gray-300 rounded transition-colors"
              aria-describedby={describedByIds || undefined}
              aria-invalid={ariaInvalid || !!error}
              autoFocus={autoFocus}
              {...props}
            />
            <span className="text-sm text-gray-700 select-none">{label}</span>
          </label>
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          id={fieldId}
          name={name}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseInputClasses}
          aria-describedby={describedByIds || undefined}
          aria-invalid={ariaInvalid || !!error}
          autoFocus={autoFocus}
          autoComplete={type === 'number' ? 'off' : undefined}
          {...props}
        />
      );
    };

    return (
      <div className="space-y-1">
        {/* Label */}
        {type !== 'checkbox' && (
          <label htmlFor={type === 'radio' ? undefined : fieldId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required field">
                *
              </span>
            )}
            {tooltip && (
              <EnhancedTooltip
                content={tooltip}
                detailedContent={getDetailedTooltipContent(name)}
                position="top"
                className="ml-1"
              >
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 focus:ring-2 focus:ring-blue-500 rounded p-1"
                  aria-label={`Help for ${label}`}
                  tabIndex={0}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </EnhancedTooltip>
            )}
          </label>
        )}

        {/* Input with optional unit display */}
        <div className="relative">
          {renderInput()}
          {unit && type !== 'checkbox' && type !== 'radio' && (
            <div
              id={unitId}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <span className="text-gray-500 text-sm">{unit}</span>
            </div>
          )}
        </div>

        {/* Tooltip (hidden, for screen readers) */}
        {tooltip && (
          <div id={tooltipId} className="sr-only">
            {tooltip}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;