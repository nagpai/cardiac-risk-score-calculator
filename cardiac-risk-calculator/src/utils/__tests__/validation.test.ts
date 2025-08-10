import {
  validateAge,
  validateCholesterol,
  validateBloodPressure,
  validateGlucose,
  validateGender,
  validateSmokingStatus,
  validatePatientData,
  validateField,
  isPatientDataComplete,
  getFieldDisplayName,
  formatValidationErrors,
  groupErrorsByField,
} from '../validation';
import type { PatientData, ValidationError } from '../../types';

describe('Validation Utilities', () => {
  describe('validateAge', () => {
    it('should accept valid ages within Framingham range', () => {
      expect(validateAge(30)).toBeNull();
      expect(validateAge(50)).toBeNull();
      expect(validateAge(79)).toBeNull();
    });

    it('should reject ages below minimum', () => {
      const result = validateAge(29);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('age');
      expect(result?.message).toContain('30 and 79');
    });

    it('should reject ages above maximum', () => {
      const result = validateAge(80);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('age');
      expect(result?.message).toContain('30 and 79');
    });

    it('should reject invalid age values', () => {
      expect(validateAge(NaN)).not.toBeNull();
      expect(validateAge(undefined as any)).not.toBeNull();
      expect(validateAge(null as any)).not.toBeNull();
    });
  });

  describe('validateCholesterol', () => {
    describe('mg/dL units', () => {
      it('should accept valid total cholesterol values', () => {
        expect(validateCholesterol(150, 'mg/dL', 'totalCholesterol')).toBeNull();
        expect(validateCholesterol(200, 'mg/dL', 'totalCholesterol')).toBeNull();
        expect(validateCholesterol(300, 'mg/dL', 'totalCholesterol')).toBeNull();
      });

      it('should accept valid HDL cholesterol values', () => {
        expect(validateCholesterol(40, 'mg/dL', 'hdlCholesterol')).toBeNull();
        expect(validateCholesterol(60, 'mg/dL', 'hdlCholesterol')).toBeNull();
        expect(validateCholesterol(80, 'mg/dL', 'hdlCholesterol')).toBeNull();
      });

      it('should reject total cholesterol values outside range', () => {
        const lowResult = validateCholesterol(99, 'mg/dL', 'totalCholesterol');
        expect(lowResult).not.toBeNull();
        expect(lowResult?.message).toContain('100 and 400');

        const highResult = validateCholesterol(401, 'mg/dL', 'totalCholesterol');
        expect(highResult).not.toBeNull();
        expect(highResult?.message).toContain('100 and 400');
      });

      it('should reject HDL cholesterol values outside range', () => {
        const lowResult = validateCholesterol(19, 'mg/dL', 'hdlCholesterol');
        expect(lowResult).not.toBeNull();
        expect(lowResult?.message).toContain('20 and 100');

        const highResult = validateCholesterol(101, 'mg/dL', 'hdlCholesterol');
        expect(highResult).not.toBeNull();
        expect(highResult?.message).toContain('20 and 100');
      });
    });

    describe('mmol/L units', () => {
      it('should accept valid total cholesterol values', () => {
        expect(validateCholesterol(4.0, 'mmol/L', 'totalCholesterol')).toBeNull();
        expect(validateCholesterol(6.0, 'mmol/L', 'totalCholesterol')).toBeNull();
        expect(validateCholesterol(8.0, 'mmol/L', 'totalCholesterol')).toBeNull();
      });

      it('should accept valid HDL cholesterol values', () => {
        expect(validateCholesterol(1.0, 'mmol/L', 'hdlCholesterol')).toBeNull();
        expect(validateCholesterol(1.5, 'mmol/L', 'hdlCholesterol')).toBeNull();
        expect(validateCholesterol(2.0, 'mmol/L', 'hdlCholesterol')).toBeNull();
      });

      it('should reject values outside mmol/L ranges', () => {
        const lowResult = validateCholesterol(2.5, 'mmol/L', 'totalCholesterol');
        expect(lowResult).not.toBeNull();

        const highResult = validateCholesterol(10.4, 'mmol/L', 'totalCholesterol');
        expect(highResult).not.toBeNull();
      });
    });

    it('should reject invalid cholesterol values', () => {
      expect(validateCholesterol(NaN, 'mg/dL', 'totalCholesterol')).not.toBeNull();
      expect(validateCholesterol(undefined as any, 'mg/dL', 'totalCholesterol')).not.toBeNull();
    });
  });

  describe('validateBloodPressure', () => {
    it('should accept valid blood pressure values', () => {
      const result = validateBloodPressure(120, 80);
      expect(result).toHaveLength(0);
    });

    it('should accept boundary values', () => {
      const result1 = validateBloodPressure(80, 40);
      expect(result1).toHaveLength(0);

      const result2 = validateBloodPressure(200, 120);
      expect(result2).toHaveLength(0);
    });

    it('should reject systolic BP outside range', () => {
      const lowResult = validateBloodPressure(79, 80);
      expect(lowResult.some(error => error.field === 'systolicBP')).toBe(true);

      const highResult = validateBloodPressure(201, 80);
      expect(highResult.some(error => error.field === 'systolicBP')).toBe(true);
    });

    it('should reject diastolic BP outside range', () => {
      const lowResult = validateBloodPressure(120, 39);
      expect(lowResult.some(error => error.field === 'diastolicBP')).toBe(true);

      const highResult = validateBloodPressure(120, 121);
      expect(highResult.some(error => error.field === 'diastolicBP')).toBe(true);
    });

    it('should reject when diastolic >= systolic', () => {
      const result1 = validateBloodPressure(120, 120);
      expect(result1.some(error => error.message.includes('lower than systolic'))).toBe(true);

      const result2 = validateBloodPressure(120, 130);
      expect(result2.some(error => error.message.includes('lower than systolic'))).toBe(true);
    });

    it('should handle invalid blood pressure values', () => {
      const result = validateBloodPressure(NaN, 80);
      expect(result.some(error => error.field === 'systolicBP')).toBe(true);

      const result2 = validateBloodPressure(120, NaN);
      expect(result2.some(error => error.field === 'diastolicBP')).toBe(true);
    });
  });

  describe('validateGlucose', () => {
    it('should accept undefined glucose (optional field)', () => {
      expect(validateGlucose(undefined, 'mg/dL')).toBeNull();
      expect(validateGlucose(null as any, 'mg/dL')).toBeNull();
    });

    it('should accept valid glucose values in mg/dL', () => {
      expect(validateGlucose(100, 'mg/dL')).toBeNull();
      expect(validateGlucose(200, 'mg/dL')).toBeNull();
      expect(validateGlucose(300, 'mg/dL')).toBeNull();
    });

    it('should accept valid glucose values in mmol/L', () => {
      expect(validateGlucose(5.0, 'mmol/L')).toBeNull();
      expect(validateGlucose(10.0, 'mmol/L')).toBeNull();
      expect(validateGlucose(15.0, 'mmol/L')).toBeNull();
    });

    it('should reject glucose values outside mg/dL range', () => {
      const lowResult = validateGlucose(49, 'mg/dL');
      expect(lowResult).not.toBeNull();

      const highResult = validateGlucose(401, 'mg/dL');
      expect(highResult).not.toBeNull();
    });

    it('should reject glucose values outside mmol/L range', () => {
      const lowResult = validateGlucose(2.7, 'mmol/L');
      expect(lowResult).not.toBeNull();

      const highResult = validateGlucose(22.3, 'mmol/L');
      expect(highResult).not.toBeNull();
    });

    it('should reject invalid glucose values', () => {
      expect(validateGlucose(NaN, 'mg/dL')).not.toBeNull();
    });
  });

  describe('validateGender', () => {
    it('should accept valid gender values', () => {
      expect(validateGender('male')).toBeNull();
      expect(validateGender('female')).toBeNull();
    });

    it('should reject invalid gender values', () => {
      expect(validateGender('other')).not.toBeNull();
      expect(validateGender('')).not.toBeNull();
      expect(validateGender(undefined as any)).not.toBeNull();
    });
  });

  describe('validateSmokingStatus', () => {
    it('should accept valid smoking status values', () => {
      expect(validateSmokingStatus('never')).toBeNull();
      expect(validateSmokingStatus('former')).toBeNull();
      expect(validateSmokingStatus('current')).toBeNull();
    });

    it('should reject invalid smoking status values', () => {
      expect(validateSmokingStatus('sometimes')).not.toBeNull();
      expect(validateSmokingStatus('')).not.toBeNull();
      expect(validateSmokingStatus(undefined as any)).not.toBeNull();
    });
  });

  describe('validatePatientData', () => {
    const validPatientData: PatientData = {
      age: 45,
      gender: 'male',
      totalCholesterol: 200,
      hdlCholesterol: 50,
      cholesterolUnit: 'mg/dL',
      systolicBP: 120,
      diastolicBP: 80,
      onBPMedication: false,
      bloodGlucose: 100,
      glucoseUnit: 'mg/dL',
      smokingStatus: 'never',
      hasDiabetes: false,
      familyHistory: false,
    };

    it('should return no errors for valid patient data', () => {
      const errors = validatePatientData(validPatientData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid age', () => {
      const invalidData = { ...validPatientData, age: 25 };
      const errors = validatePatientData(invalidData);
      expect(errors.some(error => error.field === 'age')).toBe(true);
    });

    it('should return errors for invalid cholesterol', () => {
      const invalidData = { ...validPatientData, totalCholesterol: 50 };
      const errors = validatePatientData(invalidData);
      expect(errors.some(error => error.field === 'totalCholesterol')).toBe(true);
    });

    it('should return errors for invalid blood pressure', () => {
      const invalidData = { ...validPatientData, systolicBP: 70 };
      const errors = validatePatientData(invalidData);
      expect(errors.some(error => error.field === 'systolicBP')).toBe(true);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        ...validPatientData,
        age: 25,
        totalCholesterol: 50,
        systolicBP: 70,
      };
      const errors = validatePatientData(invalidData);
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateField', () => {
    it('should validate individual fields correctly', () => {
      expect(validateField('age', 45)).toBeNull();
      expect(validateField('age', 25)).not.toBeNull();
      expect(validateField('gender', 'male')).toBeNull();
      expect(validateField('gender', 'other')).not.toBeNull();
    });

    it('should handle fields requiring additional data', () => {
      const additionalData = { cholesterolUnit: 'mg/dL' as const };
      expect(validateField('totalCholesterol', 200, additionalData)).toBeNull();
      expect(validateField('totalCholesterol', 50, additionalData)).not.toBeNull();
    });

    it('should return null for unknown fields', () => {
      expect(validateField('unknownField', 'value')).toBeNull();
    });
  });

  describe('isPatientDataComplete', () => {
    const validData: PatientData = {
      age: 45,
      gender: 'male',
      totalCholesterol: 200,
      hdlCholesterol: 50,
      cholesterolUnit: 'mg/dL',
      systolicBP: 120,
      diastolicBP: 80,
      onBPMedication: false,
      smokingStatus: 'never',
      hasDiabetes: false,
      familyHistory: false,
      glucoseUnit: 'mg/dL',
    };

    it('should return true for complete valid data', () => {
      expect(isPatientDataComplete(validData)).toBe(true);
    });

    it('should return false for incomplete data', () => {
      const incompleteData = { ...validData, age: undefined };
      expect(isPatientDataComplete(incompleteData)).toBe(false);
    });

    it('should return false for invalid data', () => {
      const invalidData = { ...validData, age: 25 };
      expect(isPatientDataComplete(invalidData)).toBe(false);
    });
  });

  describe('getFieldDisplayName', () => {
    it('should return proper display names for known fields', () => {
      expect(getFieldDisplayName('age')).toBe('Age');
      expect(getFieldDisplayName('totalCholesterol')).toBe('Total Cholesterol');
      expect(getFieldDisplayName('systolicBP')).toBe('Systolic Blood Pressure');
    });

    it('should return the field name for unknown fields', () => {
      expect(getFieldDisplayName('unknownField')).toBe('unknownField');
    });
  });

  describe('formatValidationErrors', () => {
    it('should format error messages correctly', () => {
      const errors: ValidationError[] = [
        { field: 'age', message: 'Age is required' },
        { field: 'gender', message: 'Gender is required' },
      ];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toEqual(['Age is required', 'Gender is required']);
    });
  });

  describe('groupErrorsByField', () => {
    it('should group errors by field correctly', () => {
      const errors: ValidationError[] = [
        { field: 'age', message: 'Age is required' },
        { field: 'age', message: 'Age must be valid' },
        { field: 'gender', message: 'Gender is required' },
      ];
      const grouped = groupErrorsByField(errors);
      expect(grouped.age).toHaveLength(2);
      expect(grouped.gender).toHaveLength(1);
    });
  });
});