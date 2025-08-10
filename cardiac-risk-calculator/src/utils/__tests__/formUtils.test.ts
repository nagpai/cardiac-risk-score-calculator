import { vi } from 'vitest';
import {
  preventInvalidSubmission,
  createValidatedSubmissionHandler,
  createDebouncedValidator,
  FormFieldState,
  createFormSubmissionManager,
  getFormValidationSummary,
  createFieldEventHandlers,
} from '../formUtils';
import type { PatientData, ValidationError } from '../../types';
import { validateAge } from '../validation';

describe('Form Utils', () => {
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

  const invalidPatientData: Partial<PatientData> = {
    age: 25, // Invalid age
    gender: 'male',
    totalCholesterol: 50, // Invalid cholesterol
  };

  describe('preventInvalidSubmission', () => {
    it('should allow valid submission', () => {
      const mockOnValid = vi.fn();
      const mockOnInvalid = vi.fn();
      
      const result = preventInvalidSubmission(validPatientData, mockOnValid, mockOnInvalid);
      
      expect(result).toBe(true);
      expect(mockOnValid).toHaveBeenCalledWith(validPatientData);
      expect(mockOnInvalid).not.toHaveBeenCalled();
    });

    it('should prevent invalid submission', () => {
      const mockOnValid = vi.fn();
      const mockOnInvalid = vi.fn();
      
      const result = preventInvalidSubmission(invalidPatientData, mockOnValid, mockOnInvalid);
      
      expect(result).toBe(false);
      expect(mockOnValid).not.toHaveBeenCalled();
      expect(mockOnInvalid).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ field: 'age' }),
      ]));
    });
  });

  describe('createValidatedSubmissionHandler', () => {
    it('should create a submission handler that validates', () => {
      const mockOnValid = vi.fn();
      const mockOnInvalid = vi.fn();
      
      const handler = createValidatedSubmissionHandler(mockOnValid, mockOnInvalid);
      
      // Test valid data
      const validResult = handler(validPatientData);
      expect(validResult).toBe(true);
      expect(mockOnValid).toHaveBeenCalledWith(validPatientData);
      
      // Test invalid data
      const invalidResult = handler(invalidPatientData);
      expect(invalidResult).toBe(false);
      expect(mockOnInvalid).toHaveBeenCalled();
    });
  });

  describe('createDebouncedValidator', () => {
    vi.useFakeTimers();

    it('should debounce validation calls', () => {
      const mockCallback = vi.fn();
      const debouncedValidator = createDebouncedValidator(validateAge, 300);
      
      // Call multiple times quickly
      debouncedValidator(45, mockCallback);
      debouncedValidator(50, mockCallback);
      debouncedValidator(55, mockCallback);
      
      // Should not have been called yet
      expect(mockCallback).not.toHaveBeenCalled();
      
      // Fast forward time
      vi.advanceTimersByTime(300);
      
      // Should have been called only once with the last value
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(null); // 55 is valid
    });

    afterEach(() => {
      vi.clearAllTimers();
    });
  });

  describe('FormFieldState', () => {
    it('should manage field state correctly', () => {
      const mockOnChange = vi.fn();
      const fieldState = new FormFieldState(30, validateAge, mockOnChange);
      
      expect(fieldState.getValue()).toBe(30);
      expect(fieldState.isValid()).toBe(true);
      expect(fieldState.isTouched()).toBe(false);
      
      // Set invalid value
      fieldState.setValue(25);
      
      expect(fieldState.getValue()).toBe(25);
      expect(fieldState.isValid()).toBe(false);
      expect(fieldState.isTouched()).toBe(true);
      expect(fieldState.getError()).not.toBeNull();
      expect(mockOnChange).toHaveBeenCalledWith(25, expect.any(Object));
      
      // Reset
      fieldState.reset(45);
      
      expect(fieldState.getValue()).toBe(45);
      expect(fieldState.isValid()).toBe(true);
      expect(fieldState.isTouched()).toBe(false);
      expect(fieldState.getError()).toBeNull();
    });
  });

  describe('createFormSubmissionManager', () => {
    it('should manage submission state', () => {
      const manager = createFormSubmissionManager();
      const mockListener = vi.fn();
      
      const unsubscribe = manager.subscribe(mockListener);
      
      expect(manager.getState().isSubmitting).toBe(false);
      expect(manager.getState().isSubmitted).toBe(false);
      
      // Start submission
      manager.startSubmission();
      
      expect(manager.getState().isSubmitting).toBe(true);
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        isSubmitting: true,
      }));
      
      // Complete submission successfully
      manager.completeSubmission(true);
      
      expect(manager.getState().isSubmitting).toBe(false);
      expect(manager.getState().isSubmitted).toBe(true);
      expect(manager.getState().submissionSuccess).toBe(true);
      
      // Complete submission with error
      manager.completeSubmission(false, 'Test error');
      
      expect(manager.getState().submissionError).toBe('Test error');
      expect(manager.getState().submissionSuccess).toBe(false);
      
      // Reset
      manager.resetSubmission();
      
      expect(manager.getState().isSubmitting).toBe(false);
      expect(manager.getState().isSubmitted).toBe(false);
      expect(manager.getState().submissionError).toBeNull();
      
      // Unsubscribe
      unsubscribe();
    });
  });

  describe('getFormValidationSummary', () => {
    it('should provide validation summary for valid data', () => {
      const summary = getFormValidationSummary(validPatientData);
      
      expect(summary.isValid).toBe(true);
      expect(summary.isComplete).toBe(true);
      expect(summary.errors).toHaveLength(0);
      expect(summary.errorMessages).toHaveLength(0);
      expect(Object.keys(summary.fieldErrors)).toHaveLength(0);
    });

    it('should provide validation summary for invalid data', () => {
      const summary = getFormValidationSummary(invalidPatientData);
      
      expect(summary.isValid).toBe(false);
      expect(summary.isComplete).toBe(false);
      expect(summary.errors.length).toBeGreaterThan(0);
      expect(summary.errorMessages.length).toBeGreaterThan(0);
      expect(Object.keys(summary.fieldErrors).length).toBeGreaterThan(0);
      
      // Should have age error
      expect(summary.fieldErrors.age).toBeDefined();
    });
  });

  describe('createFieldEventHandlers', () => {
    it('should create focus and blur handlers', () => {
      const mockOnFocus = vi.fn();
      const mockOnBlur = vi.fn();
      
      const handlers = createFieldEventHandlers('age', mockOnFocus, mockOnBlur);
      
      // Test focus handler
      handlers.onFocus();
      expect(mockOnFocus).toHaveBeenCalledWith('age');
      
      // Test blur handler
      const mockEvent = {
        target: { value: '45' },
      } as React.FocusEvent<HTMLInputElement>;
      
      handlers.onBlur(mockEvent);
      expect(mockOnBlur).toHaveBeenCalledWith('age', '45');
    });

    it('should handle optional callbacks', () => {
      const handlers = createFieldEventHandlers('age');
      
      // Should not throw when callbacks are undefined
      expect(() => {
        handlers.onFocus();
        handlers.onBlur({ target: { value: '45' } } as React.FocusEvent<HTMLInputElement>);
      }).not.toThrow();
    });
  });
});