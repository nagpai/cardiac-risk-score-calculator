import type { PatientData, ValidationError } from '../types';
import { validatePatientData, isPatientDataComplete } from './validation';

/**
 * Prevents form submission when validation fails
 */
export const preventInvalidSubmission = (
  formData: Partial<PatientData>,
  onValidSubmission: (data: PatientData) => void,
  onInvalidSubmission?: (errors: ValidationError[]) => void
): boolean => {
  const validationErrors = validatePatientData(formData);
  
  if (validationErrors.length === 0 && isPatientDataComplete(formData)) {
    onValidSubmission(formData as PatientData);
    return true;
  } else {
    if (onInvalidSubmission) {
      onInvalidSubmission(validationErrors);
    }
    return false;
  }
};

/**
 * Creates a form submission handler with validation
 */
export const createValidatedSubmissionHandler = (
  onValidSubmission: (data: PatientData) => void,
  onInvalidSubmission?: (errors: ValidationError[]) => void
) => {
  return (formData: Partial<PatientData>) => {
    return preventInvalidSubmission(formData, onValidSubmission, onInvalidSubmission);
  };
};

/**
 * Debounced validation for real-time feedback
 */
export const createDebouncedValidator = (
  validationFn: (value: any) => ValidationError | null,
  delay: number = 300
) => {
  let timeoutId: number;
  
  return (value: any, callback: (error: ValidationError | null) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validationFn(value);
      callback(error);
    }, delay);
  };
};

/**
 * Form field state manager for controlled components
 */
export class FormFieldState<T = any> {
  private value: T;
  private error: ValidationError | null = null;
  private touched: boolean = false;
  private validationFn: (value: T) => ValidationError | null;
  private onChange: (value: T, error: ValidationError | null) => void;

  constructor(
    initialValue: T,
    validationFn: (value: T) => ValidationError | null,
    onChange: (value: T, error: ValidationError | null) => void
  ) {
    this.value = initialValue;
    this.validationFn = validationFn;
    this.onChange = onChange;
  }

  setValue(newValue: T): void {
    this.value = newValue;
    this.touched = true;
    this.validate();
    this.onChange(this.value, this.error);
  }

  validate(): ValidationError | null {
    this.error = this.validationFn(this.value);
    return this.error;
  }

  getValue(): T {
    return this.value;
  }

  getError(): ValidationError | null {
    return this.error;
  }

  isTouched(): boolean {
    return this.touched;
  }

  isValid(): boolean {
    return this.error === null;
  }

  reset(newValue?: T): void {
    this.value = newValue ?? this.value;
    this.error = null;
    this.touched = false;
    this.onChange(this.value, this.error);
  }
}

/**
 * Utility for managing form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  submissionError: string | null;
  submissionSuccess: boolean;
}

export const createFormSubmissionManager = () => {
  let state: FormSubmissionState = {
    isSubmitting: false,
    isSubmitted: false,
    submissionError: null,
    submissionSuccess: false,
  };

  const listeners: Array<(state: FormSubmissionState) => void> = [];

  const notifyListeners = () => {
    listeners.forEach(listener => listener(state));
  };

  const subscribe = (listener: (state: FormSubmissionState) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  const startSubmission = () => {
    state = {
      ...state,
      isSubmitting: true,
      submissionError: null,
      submissionSuccess: false,
    };
    notifyListeners();
  };

  const completeSubmission = (success: boolean, error?: string) => {
    state = {
      ...state,
      isSubmitting: false,
      isSubmitted: true,
      submissionError: error || null,
      submissionSuccess: success,
    };
    notifyListeners();
  };

  const resetSubmission = () => {
    state = {
      isSubmitting: false,
      isSubmitted: false,
      submissionError: null,
      submissionSuccess: false,
    };
    notifyListeners();
  };

  const getState = () => ({ ...state });

  return {
    subscribe,
    startSubmission,
    completeSubmission,
    resetSubmission,
    getState,
  };
};

/**
 * Validates form data and returns formatted error messages
 */
export const getFormValidationSummary = (formData: Partial<PatientData>) => {
  const errors = validatePatientData(formData);
  const isComplete = isPatientDataComplete(formData);
  
  return {
    isValid: errors.length === 0,
    isComplete,
    errors,
    errorMessages: errors.map(error => error.message),
    fieldErrors: errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>),
  };
};

/**
 * Utility for handling form field focus and blur events
 */
export const createFieldEventHandlers = (
  fieldName: string,
  onFocus?: (fieldName: string) => void,
  onBlur?: (fieldName: string, value: any) => void
) => {
  return {
    onFocus: () => onFocus?.(fieldName),
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      onBlur?.(fieldName, event.target.value);
    },
  };
};