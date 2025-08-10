import React, { forwardRef, useRef, useEffect } from 'react';
import type { FormFieldProps } from '../../types';
import { useKeyboardNavigation } from '../../hooks/useAccessibility';

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

    const renderInput = () => {
      if (type === 'select' && options) {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={fieldId}
            name={name}
            value={String(value || '')}
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
            onKeyDown={handleKeyDown}
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
          value={String(value || '')}
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
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 focus:ring-2 focus:ring-blue-500 rounded"
                aria-describedby={tooltipId}
                aria-label={`Help for ${label}`}
                title={tooltip}
              >
                <svg className="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
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