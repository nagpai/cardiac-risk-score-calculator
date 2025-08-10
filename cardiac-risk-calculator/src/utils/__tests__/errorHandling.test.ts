import {
  createCalculationError,
  createFormError,
  validatePatientDataForCalculation,
  handleCalculationError,
  handleFormError,
  isRecoverableError,
  getUserFriendlyErrorMessage,
  logError,
} from '../errorHandling';
import type { PatientData } from '../../types';

import { vi } from 'vitest';

// Mock console methods
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('createCalculationError', () => {
    it('should create a calculation error with proper structure', () => {
      const error = createCalculationError(
        'INVALID_INPUT',
        'Test error message',
        { step: 'validation' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('CalculationError');
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Test error message');
      expect(error.context).toEqual({
        timestamp: expect.any(String),
        step: 'validation',
      });
    });

    it('should create error without context', () => {
      const error = createCalculationError('CALCULATION_FAILED', 'Test message');

      expect(error.code).toBe('CALCULATION_FAILED');
      expect(error.context).toEqual({
        timestamp: expect.any(String),
      });
    });
  });

  describe('createFormError', () => {
    it('should create a form error with proper structure', () => {
      const error = createFormError(
        'VALIDATION_FAILED',
        'Field validation failed',
        'age',
        { fieldValue: 25 }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('FormError');
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.field).toBe('age');
      expect(error.context).toEqual({
        timestamp: expect.any(String),
        fieldValue: 25,
      });
    });
  });

  describe('validatePatientDataForCalculation', () => {
    const validPatientData: PatientData = {
      age: 45,
      gender: 'male',
      totalCholesterol: 200,
      hdlCholesterol: 50,
      cholesterolUnit: 'mg/dL',
      systolicBP: 120,
      diastolicBP: 80,
      onBPMedication: false,
      glucoseUnit: 'mg/dL',
      smokingStatus: 'never',
      hasDiabetes: false,
      familyHistory: false,
    };

    it('should pass validation for valid patient data', () => {
      expect(() => {
        validatePatientDataForCalculation(validPatientData);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const incompleteData = { ...validPatientData };
      delete (incompleteData as any).age;

      expect(() => {
        validatePatientDataForCalculation(incompleteData);
      }).toThrow('Validation failed: Age is required for risk calculation');
    });

    it('should throw error for age outside Framingham range', () => {
      const invalidData = { ...validPatientData, age: 25 };

      expect(() => {
        validatePatientDataForCalculation(invalidData);
      }).toThrow('Age must be between 30 and 79 years for Framingham calculation');
    });

    it('should throw error for logical inconsistency in blood pressure', () => {
      const invalidData = { ...validPatientData, systolicBP: 80, diastolicBP: 90 };

      expect(() => {
        validatePatientDataForCalculation(invalidData);
      }).toThrow('Diastolic blood pressure must be lower than systolic blood pressure');
    });

    it('should warn for extreme values but not throw', () => {
      const extremeData = { ...validPatientData, totalCholesterol: 600 };

      expect(() => {
        validatePatientDataForCalculation(extremeData);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Validation warnings:',
        expect.arrayContaining([
          expect.objectContaining({
            field: 'totalCholesterol',
            severity: 'warning',
          }),
        ])
      );
    });
  });

  describe('handleCalculationError', () => {
    const mockPatientData: Partial<PatientData> = {
      age: 45,
      gender: 'male',
    };

    it('should return existing CalculationError unchanged', () => {
      const originalError = createCalculationError('INVALID_INPUT', 'Original error');
      const result = handleCalculationError(originalError, mockPatientData);

      expect(result).toBe(originalError);
    });

    it('should convert validation error to CalculationError', () => {
      const validationError = new Error('validation failed');
      const result = handleCalculationError(validationError, mockPatientData);

      expect(result.code).toBe('INVALID_INPUT');
      expect(result.context?.patientData).toBe(mockPatientData);
      expect(result.context?.step).toBe('input_validation');
    });

    it('should convert framingham error to ALGORITHM_ERROR', () => {
      const framinghamError = new Error('framingham algorithm failed');
      const result = handleCalculationError(framinghamError, mockPatientData);

      expect(result.code).toBe('ALGORITHM_ERROR');
      expect(result.message).toBe('Error in Framingham risk calculation algorithm');
    });

    it('should convert boundary error to BOUNDARY_VALUE', () => {
      const boundaryError = new Error('value outside boundary range');
      const result = handleCalculationError(boundaryError, mockPatientData);

      expect(result.code).toBe('BOUNDARY_VALUE');
      expect(result.message).toBe('Input values are outside acceptable ranges');
    });

    it('should handle non-Error objects', () => {
      const result = handleCalculationError('string error', mockPatientData);

      expect(result.code).toBe('CALCULATION_FAILED');
      expect(result.message).toBe('An unexpected error occurred during calculation');
    });
  });

  describe('handleFormError', () => {
    it('should return existing FormError unchanged', () => {
      const originalError = createFormError('VALIDATION_FAILED', 'Original error');
      const result = handleFormError(originalError, 'age');

      expect(result).toBe(originalError);
    });

    it('should convert validation error to FormError', () => {
      const validationError = new Error('validation failed');
      const result = handleFormError(validationError, 'age', { age: 25 });

      expect(result.code).toBe('VALIDATION_FAILED');
      expect(result.field).toBe('age');
      expect(result.context?.formData).toEqual({ age: 25 });
    });

    it('should convert submission error to SUBMISSION_FAILED', () => {
      const submitError = new Error('submit failed');
      const result = handleFormError(submitError, 'form');

      expect(result.code).toBe('SUBMISSION_FAILED');
      expect(result.field).toBe('form');
    });
  });

  describe('isRecoverableError', () => {
    it('should return true for recoverable error codes', () => {
      const recoverableError = createCalculationError('BOUNDARY_VALUE', 'Test');
      expect(isRecoverableError(recoverableError)).toBe(true);

      const validationError = createFormError('VALIDATION_FAILED', 'Test');
      expect(isRecoverableError(validationError)).toBe(true);
    });

    it('should return false for non-recoverable error codes', () => {
      const nonRecoverableError = createCalculationError('ALGORITHM_ERROR', 'Test');
      expect(isRecoverableError(nonRecoverableError)).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return appropriate messages for different error codes', () => {
      const invalidInputError = createCalculationError('INVALID_INPUT', 'Test');
      expect(getUserFriendlyErrorMessage(invalidInputError)).toBe(
        'Please check your input values and try again.'
      );

      const validationError = createFormError('VALIDATION_FAILED', 'Test');
      expect(getUserFriendlyErrorMessage(validationError)).toBe(
        'Please correct the highlighted fields and try again.'
      );

      const unknownError = createCalculationError('UNKNOWN' as unknown, 'Test');
      expect(getUserFriendlyErrorMessage(unknownError)).toBe(
        'An unexpected error occurred. Please try again or contact support.'
      );
    });
  });

  describe('logError', () => {
    it('should log error with proper structure', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const result = logError(error, { customContext: 'test' });

      expect(result).toEqual({
        name: 'Error',
        message: 'Test error',
        stack: 'Error stack trace',
        timestamp: expect.any(String),
        url: expect.any(String),
        userAgent: expect.any(String),
        context: { customContext: 'test' },
      });

      expect(console.error).toHaveBeenCalledWith('Error logged:', result);
    });

    it('should store error logs in localStorage in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      logError(error);

      const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      expect(storedLogs).toHaveLength(1);
      expect(storedLogs[0]).toEqual(
        expect.objectContaining({
          name: 'Error',
          message: 'Test error',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should limit stored logs to 20 entries', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Add 25 errors
      for (let i = 0; i < 25; i++) {
        logError(new Error(`Error ${i}`));
      }

      const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      expect(storedLogs).toHaveLength(20);
      expect(storedLogs[0].message).toBe('Error 5'); // First 5 should be removed
      expect(storedLogs[19].message).toBe('Error 24');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle localStorage errors gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock localStorage methods
      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;
      
      // Mock getItem to return valid JSON
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => '[]'),
          setItem: vi.fn(() => {
            throw new Error('Storage error');
          }),
        },
        writable: true,
      });

      const error = new Error('Test error');
      
      expect(() => {
        logError(error);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to store error log:',
        expect.any(Error)
      );

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: originalGetItem,
          setItem: originalSetItem,
          clear: localStorage.clear,
          removeItem: localStorage.removeItem,
          key: localStorage.key,
          length: localStorage.length,
        },
        writable: true,
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});