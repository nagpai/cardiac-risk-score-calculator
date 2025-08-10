import type { PatientData, ValidationError, CalculationError, FormError } from '../types';

/**
 * Creates a standardized calculation error
 */
export const createCalculationError = (
  code: CalculationError['code'],
  message: string,
  context?: CalculationError['context']
): CalculationError => {
  const error = new Error(message) as CalculationError;
  error.name = 'CalculationError';
  error.code = code;
  error.context = {
    timestamp: new Date().toISOString(),
    ...context,
  };
  return error;
};

/**
 * Creates a standardized form error
 */
export const createFormError = (
  code: FormError['code'],
  message: string,
  field?: string,
  context?: FormError['context']
): FormError => {
  const error = new Error(message) as FormError;
  error.name = 'FormError';
  error.code = code;
  error.field = field;
  error.context = {
    timestamp: new Date().toISOString(),
    ...context,
  };
  return error;
};

/**
 * Validates patient data and throws appropriate errors for boundary conditions
 */
export const validatePatientDataForCalculation = (patientData: Partial<PatientData>): void => {
  const errors: ValidationError[] = [];

  // Check for required fields
  if (!patientData.age) {
    errors.push({
      field: 'age',
      message: 'Age is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!patientData.gender) {
    errors.push({
      field: 'gender',
      message: 'Gender is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!patientData.totalCholesterol) {
    errors.push({
      field: 'totalCholesterol',
      message: 'Total cholesterol is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!patientData.hdlCholesterol) {
    errors.push({
      field: 'hdlCholesterol',
      message: 'HDL cholesterol is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!patientData.systolicBP) {
    errors.push({
      field: 'systolicBP',
      message: 'Systolic blood pressure is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!patientData.diastolicBP) {
    errors.push({
      field: 'diastolicBP',
      message: 'Diastolic blood pressure is required for risk calculation',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  // Check for boundary conditions
  if (patientData.age && (patientData.age < 30 || patientData.age > 79)) {
    errors.push({
      field: 'age',
      message: 'Age must be between 30 and 79 years for Framingham calculation',
      code: 'BOUNDARY_VALUE',
      severity: 'error',
      value: patientData.age,
    });
  }

  // Check for logical consistency
  if (patientData.systolicBP && patientData.diastolicBP && 
      patientData.diastolicBP >= patientData.systolicBP) {
    errors.push({
      field: 'diastolicBP',
      message: 'Diastolic blood pressure must be lower than systolic blood pressure',
      code: 'LOGICAL_INCONSISTENCY',
      severity: 'error',
      value: { systolic: patientData.systolicBP, diastolic: patientData.diastolicBP },
    });
  }

  // Check for extreme values that might indicate data entry errors
  if (patientData.totalCholesterol && patientData.cholesterolUnit === 'mg/dL' && 
      patientData.totalCholesterol > 500) {
    errors.push({
      field: 'totalCholesterol',
      message: 'Total cholesterol value seems unusually high. Please verify.',
      code: 'EXTREME_VALUE',
      severity: 'warning',
      value: patientData.totalCholesterol,
    });
  }

  if (patientData.systolicBP && patientData.systolicBP > 250) {
    errors.push({
      field: 'systolicBP',
      message: 'Systolic blood pressure value seems unusually high. Please verify.',
      code: 'EXTREME_VALUE',
      severity: 'warning',
      value: patientData.systolicBP,
    });
  }

  if (errors.some(error => error.severity === 'error')) {
    throw createCalculationError(
      'INVALID_INPUT',
      `Validation failed: ${errors.filter(e => e.severity === 'error').map(e => e.message).join(', ')}`,
      { patientData, step: 'validation' }
    );
  }

  // Log warnings but don't throw
  const warnings = errors.filter(error => error.severity === 'warning');
  if (warnings.length > 0) {
    console.warn('Validation warnings:', warnings);
  }
};

/**
 * Handles calculation errors with appropriate recovery strategies
 */
export const handleCalculationError = (error: unknown, patientData?: Partial<PatientData>) => {
  console.error('Calculation error occurred:', error);

  if (error instanceof Error) {
    // Check if it's already a CalculationError
    if ('code' in error) {
      return error as CalculationError;
    }

    // Convert generic errors to CalculationError
    if (error.message.includes('validation')) {
      return createCalculationError(
        'INVALID_INPUT',
        error.message,
        { patientData, step: 'input_validation' }
      );
    }

    if (error.message.includes('framingham') || error.message.includes('algorithm')) {
      return createCalculationError(
        'ALGORITHM_ERROR',
        'Error in Framingham risk calculation algorithm',
        { patientData, step: 'risk_calculation' }
      );
    }

    if (error.message.includes('boundary') || error.message.includes('range')) {
      return createCalculationError(
        'BOUNDARY_VALUE',
        'Input values are outside acceptable ranges',
        { patientData, step: 'boundary_check' }
      );
    }

    // Generic calculation error
    return createCalculationError(
      'CALCULATION_FAILED',
      error.message || 'Risk calculation failed',
      { patientData, step: 'unknown' }
    );
  }

  // Handle non-Error objects
  return createCalculationError(
    'CALCULATION_FAILED',
    'An unexpected error occurred during calculation',
    { patientData, step: 'unknown' }
  );
};

/**
 * Handles form errors with appropriate recovery strategies
 */
export const handleFormError = (error: unknown, field?: string, formData?: Record<string, unknown>) => {
  console.error('Form error occurred:', error);

  if (error instanceof Error) {
    // Check if it's already a FormError
    if ('code' in error) {
      return error as FormError;
    }

    // Convert generic errors to FormError
    if (error.message.includes('validation')) {
      return createFormError(
        'VALIDATION_FAILED',
        error.message,
        field,
        { formData, fieldValue: formData?.[field || ''] }
      );
    }

    if (error.message.includes('submit')) {
      return createFormError(
        'SUBMISSION_FAILED',
        error.message,
        field,
        { formData }
      );
    }

    // Generic form error
    return createFormError(
      'FIELD_ERROR',
      error.message || 'Form field error',
      field,
      { formData, fieldValue: formData?.[field || ''] }
    );
  }

  // Handle non-Error objects
  return createFormError(
    'FORM_STATE_ERROR',
    'An unexpected form error occurred',
    field,
    { formData }
  );
};

/**
 * Determines if an error is recoverable
 */
export const isRecoverableError = (error: CalculationError | FormError): boolean => {
  const recoverableCodes = [
    'VALIDATION_FAILED',
    'FIELD_ERROR',
    'BOUNDARY_VALUE',
    'EXTREME_VALUE',
  ];

  return recoverableCodes.includes(error.code);
};

/**
 * Gets user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: CalculationError | FormError): string => {
  switch (error.code) {
    case 'INVALID_INPUT':
      return 'Please check your input values and try again.';
    case 'CALCULATION_FAILED':
      return 'We encountered an error calculating your risk. Please try again.';
    case 'ALGORITHM_ERROR':
      return 'There was an issue with the risk calculation. Please contact support if this persists.';
    case 'BOUNDARY_VALUE':
      return 'Some values are outside the expected range. Please verify your inputs.';
    case 'MISSING_DATA':
      return 'Required information is missing. Please complete all fields.';
    case 'VALIDATION_FAILED':
      return 'Please correct the highlighted fields and try again.';
    case 'SUBMISSION_FAILED':
      return 'Form submission failed. Please try again.';
    case 'FIELD_ERROR':
      return 'There was an error with this field. Please check the value.';
    case 'FORM_STATE_ERROR':
      return 'Form encountered an error. Please refresh and try again.';
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
};

/**
 * Logs error for debugging and monitoring
 */
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context,
  };

  console.error('Error logged:', errorLog);

  // In development, store in localStorage for debugging
  if (process.env.NODE_ENV === 'development') {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 20 errors
      const recentLogs = existingLogs.slice(-20);
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('Failed to store error log:', e);
    }
  }

  return errorLog;
};