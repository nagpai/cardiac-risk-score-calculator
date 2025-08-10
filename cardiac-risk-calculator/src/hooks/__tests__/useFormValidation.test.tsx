import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useFormValidation } from '../useFormValidation';
import type { PatientData } from '../../types';

describe('useFormValidation', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    expect(result.current.formData.cholesterolUnit).toBe('mg/dL');
    expect(result.current.formData.glucoseUnit).toBe('mg/dL');
    expect(result.current.formData.onBPMedication).toBe(false);
    expect(result.current.formData.hasDiabetes).toBe(false);
    expect(result.current.formData.familyHistory).toBe(false);
  });

  it('should validate single field correctly', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    act(() => {
      result.current.form.setValue('age', 45);
    });
    
    act(() => {
      const isValid = result.current.validateSingleField('age', 45);
      expect(isValid).toBe(true);
    });
    
    act(() => {
      const isValid = result.current.validateSingleField('age', 25);
      expect(isValid).toBe(false);
    });
  });

  it('should validate all fields', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    // Set valid data
    act(() => {
      result.current.form.setValue('age', 45);
      result.current.form.setValue('gender', 'male');
      result.current.form.setValue('totalCholesterol', 200);
      result.current.form.setValue('hdlCholesterol', 50);
      result.current.form.setValue('cholesterolUnit', 'mg/dL');
      result.current.form.setValue('systolicBP', 120);
      result.current.form.setValue('diastolicBP', 80);
      result.current.form.setValue('smokingStatus', 'never');
    });
    
    act(() => {
      const isValid = result.current.validateAllFields();
      expect(isValid).toBe(true);
    });
  });

  it('should detect incomplete form', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    expect(result.current.isFormComplete).toBe(false);
    
    // Set partial data
    act(() => {
      result.current.form.setValue('age', 45);
      result.current.form.setValue('gender', 'male');
    });
    
    expect(result.current.isFormComplete).toBe(false);
  });

  it('should detect complete and valid form', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    act(() => {
      result.current.form.setValue('age', 45);
      result.current.form.setValue('gender', 'male');
      result.current.form.setValue('totalCholesterol', 200);
      result.current.form.setValue('hdlCholesterol', 50);
      result.current.form.setValue('cholesterolUnit', 'mg/dL');
      result.current.form.setValue('systolicBP', 120);
      result.current.form.setValue('diastolicBP', 80);
      result.current.form.setValue('onBPMedication', false);
      result.current.form.setValue('glucoseUnit', 'mg/dL');
      result.current.form.setValue('smokingStatus', 'never');
      result.current.form.setValue('hasDiabetes', false);
      result.current.form.setValue('familyHistory', false);
    });
    
    expect(result.current.isFormComplete).toBe(true);
  });

  it('should validate blood pressure consistency', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    act(() => {
      result.current.form.setValue('systolicBP', 120);
      result.current.form.setValue('diastolicBP', 80);
    });
    
    act(() => {
      const isValid = result.current.validateBloodPressureConsistency();
      expect(isValid).toBe(true);
    });
    
    act(() => {
      result.current.form.setValue('diastolicBP', 130); // Higher than systolic
    });
    
    act(() => {
      const isValid = result.current.validateBloodPressureConsistency();
      expect(isValid).toBe(false);
    });
  });

  it('should get field validation rules', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    const ageRules = result.current.getFieldValidationRules('age');
    expect(ageRules.required).toBe('Age is required');
    expect(ageRules.min?.value).toBe(30);
    expect(ageRules.max?.value).toBe(79);
    expect(ageRules.valueAsNumber).toBe(true);
    
    const genderRules = result.current.getFieldValidationRules('gender');
    expect(genderRules.required).toBe('Gender is required');
    
    const glucoseRules = result.current.getFieldValidationRules('bloodGlucose');
    expect(glucoseRules.valueAsNumber).toBe(true);
    expect(glucoseRules.required).toBeUndefined(); // Optional field
  });

  it('should handle field errors', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    act(() => {
      result.current.form.setError('age', {
        type: 'validation',
        message: 'Age is required',
      });
    });
    
    expect(result.current.hasFieldError('age')).toBe(true);
    expect(result.current.getFieldError('age')).toBe('Age is required');
    
    act(() => {
      result.current.clearErrors('age');
    });
    
    expect(result.current.hasFieldError('age')).toBe(false);
    expect(result.current.getFieldError('age')).toBeUndefined();
  });

  it('should get all errors', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    
    act(() => {
      result.current.form.setError('age', {
        type: 'validation',
        message: 'Age is required',
      });
      result.current.form.setError('gender', {
        type: 'validation',
        message: 'Gender is required',
      });
    });
    
    const allErrors = result.current.getAllErrors();
    expect(allErrors).toHaveLength(2);
    expect(allErrors.some(error => error.field === 'age')).toBe(true);
    expect(allErrors.some(error => error.field === 'gender')).toBe(true);
  });

  it('should create submit handler', () => {
    const { result } = renderHook(() => useFormValidation<PatientData>());
    const mockOnValid = vi.fn();
    const mockOnInvalid = vi.fn();
    
    const submitHandler = result.current.handleSubmit(mockOnValid, mockOnInvalid);
    
    expect(typeof submitHandler).toBe('function');
  });
});