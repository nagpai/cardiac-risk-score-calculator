import { useCallback, useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { PatientData, ValidationError } from '../types';
import { 
  validateField, 
  validatePatientData, 
  isPatientDataComplete,
  groupErrorsByField 
} from '../utils/validation';

/**
 * Custom hook for form validation with React Hook Form integration
 */
export const useFormValidation = <T extends Record<string, any> = PatientData>() => {
  const form = useForm<T>({
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange',
    defaultValues: {} as any,
  });

  const { watch, formState: { errors, isValid }, setError, clearErrors } = form;
  const formData = watch();

  /**
   * Validates a single field and updates form errors
   */
  const validateSingleField = useCallback((fieldName: keyof T, value: any) => {
    const validationError = validateField(fieldName as string, value, formData as Partial<PatientData>);
    
    if (validationError) {
      setError(fieldName as any, {
        type: 'validation',
        message: validationError.message,
      });
      return false;
    } else {
      clearErrors(fieldName as any);
      return true;
    }
  }, [formData, setError, clearErrors]);

  /**
   * Validates all form data and updates form errors
   */
  const validateAllFields = useCallback(() => {
    const validationErrors = validatePatientData(formData as Partial<PatientData>);
    const groupedErrors = groupErrorsByField(validationErrors);

    // Clear all existing errors first
    clearErrors();

    // Set new errors
    Object.entries(groupedErrors).forEach(([fieldName, fieldErrors]) => {
      if (fieldErrors.length > 0) {
        setError(fieldName as any, {
          type: 'validation',
          message: fieldErrors[0].message, // Use first error message
        });
      }
    });

    return validationErrors.length === 0;
  }, [formData, setError, clearErrors]);

  /**
   * Checks if form data is complete and valid for calculation
   */
  const isFormComplete = useMemo(() => {
    return isPatientDataComplete(formData as Partial<PatientData>);
  }, [formData]);

  /**
   * Gets validation rules for a specific field (for React Hook Form register)
   */
  const getFieldValidationRules = useCallback((fieldName: keyof T): any => {
    const baseRules: any = {
      validate: (value: any) => {
        const validationError = validateField(fieldName as string, value, formData as Partial<PatientData>);
        return validationError ? validationError.message : true;
      },
    };

    // Add field-specific rules
    switch (fieldName as string) {
      case 'age':
        return {
          ...baseRules,
          required: 'Age is required',
          min: { value: 30, message: 'Age must be at least 30 years' },
          max: { value: 79, message: 'Age must be no more than 79 years' },
          valueAsNumber: true,
        };

      case 'totalCholesterol':
      case 'hdlCholesterol':
        return {
          ...baseRules,
          required: `${fieldName === 'totalCholesterol' ? 'Total' : 'HDL'} cholesterol is required`,
          valueAsNumber: true,
        };

      case 'systolicBP':
        return {
          ...baseRules,
          required: 'Systolic blood pressure is required',
          min: { value: 80, message: 'Systolic BP must be at least 80 mmHg' },
          max: { value: 200, message: 'Systolic BP must be no more than 200 mmHg' },
          valueAsNumber: true,
        };

      case 'diastolicBP':
        return {
          ...baseRules,
          required: 'Diastolic blood pressure is required',
          min: { value: 40, message: 'Diastolic BP must be at least 40 mmHg' },
          max: { value: 120, message: 'Diastolic BP must be no more than 120 mmHg' },
          valueAsNumber: true,
        };

      case 'gender':
        return {
          ...baseRules,
          required: 'Gender is required',
        };

      case 'smokingStatus':
        return {
          ...baseRules,
          required: 'Smoking status is required',
        };

      case 'bloodGlucose':
        return {
          ...baseRules,
          valueAsNumber: true,
        };

      default:
        return baseRules;
    }
  }, [formData]);

  /**
   * Custom validation for blood pressure consistency
   */
  const validateBloodPressureConsistency = useCallback(() => {
    const systolic = formData.systolicBP as number;
    const diastolic = formData.diastolicBP as number;

    if (systolic && diastolic && diastolic >= systolic) {
      setError('diastolicBP' as any, {
        type: 'validation',
        message: 'Diastolic blood pressure must be lower than systolic blood pressure',
      });
      return false;
    }

    return true;
  }, [formData, setError]);

  /**
   * Handles form submission with validation
   */
  const handleSubmit = useCallback((onValid: (data: T) => void, onInvalid?: (errors: any) => void) => {
    return form.handleSubmit(
      (data) => {
        // Perform final validation
        const isFormValid = validateAllFields();
        const isBPValid = validateBloodPressureConsistency();
        
        if (isFormValid && isBPValid) {
          onValid(data as unknown as T);
        } else if (onInvalid) {
          onInvalid(errors);
        }
      },
      onInvalid
    );
  }, [form, validateAllFields, validateBloodPressureConsistency, errors]);

  /**
   * Gets error message for a specific field
   */
  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    return errors[fieldName]?.message as string | undefined;
  }, [errors]);

  /**
   * Checks if a specific field has an error
   */
  const hasFieldError = useCallback((fieldName: keyof T): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  /**
   * Gets all current validation errors as an array
   */
  const getAllErrors = useCallback((): ValidationError[] => {
    return Object.entries(errors).map(([field, error]) => ({
      field,
      message: error?.message as string || 'Invalid value',
      value: formData[field as keyof T],
    }));
  }, [errors, formData]);

  return {
    // React Hook Form instance
    form,
    
    // Form state
    formData,
    errors,
    isValid,
    isFormComplete,
    
    // Validation methods
    validateSingleField,
    validateAllFields,
    validateBloodPressureConsistency,
    getFieldValidationRules,
    
    // Error handling
    getFieldError,
    hasFieldError,
    getAllErrors,
    
    // Form submission
    handleSubmit,
    
    // Utility methods
    setError,
    clearErrors,
  };
};

/**
 * Hook for real-time field validation
 */
export const useFieldValidation = <T extends Record<string, any>>(
  fieldName: keyof T,
  form: UseFormReturn<T>
) => {
  const { watch, setError, clearErrors } = form;
  const fieldValue = watch(fieldName as any);
  const formData = watch();

  const validateFieldCallback = useCallback(() => {
    const validationError = validateField(fieldName as string, fieldValue, formData as Partial<PatientData>);
    
    if (validationError) {
      setError(fieldName as any, {
        type: 'validation',
        message: (validationError as ValidationError).message,
      });
      return false;
    } else {
      clearErrors(fieldName as any);
      return true;
    }
  }, [fieldName, fieldValue, formData, setError, clearErrors]);

  return {
    fieldValue,
    validateField: validateFieldCallback,
    isValid: !form.formState.errors[fieldName],
    error: form.formState.errors[fieldName]?.message as string | undefined,
  };
};