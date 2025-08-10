import React, { createContext, useContext, type ReactNode } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import type { PatientData } from '../types';
import { useFormValidation } from './useFormValidation';

interface FormValidationContextType {
  form: UseFormReturn<PatientData>;
  formData: Partial<PatientData>;
  isFormComplete: boolean;
  validateSingleField: (fieldName: keyof PatientData, value: any) => boolean;
  validateAllFields: () => boolean;
  getFieldError: (fieldName: keyof PatientData) => string | undefined;
  hasFieldError: (fieldName: keyof PatientData) => boolean;
  handleSubmit: (onValid: (data: PatientData) => void, onInvalid?: (errors: any) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined);

interface FormValidationProviderProps {
  children: ReactNode;
}

/**
 * Provider component for form validation context
 */
export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({ children }) => {
  const validation = useFormValidation<PatientData>();

  const contextValue: FormValidationContextType = {
    form: validation.form as unknown as UseFormReturn<PatientData>,
    formData: validation.formData,
    isFormComplete: validation.isFormComplete,
    validateSingleField: validation.validateSingleField,
    validateAllFields: validation.validateAllFields,
    getFieldError: validation.getFieldError,
    hasFieldError: validation.hasFieldError,
    handleSubmit: validation.handleSubmit,
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      {children}
    </FormValidationContext.Provider>
  );
};

/**
 * Hook to use form validation context
 */
export const useFormValidationContext = (): FormValidationContextType => {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error('useFormValidationContext must be used within a FormValidationProvider');
  }
  return context;
};

/**
 * Higher-order component for form validation
 */
export const withFormValidation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <FormValidationProvider>
      <Component {...props} />
    </FormValidationProvider>
  );
};