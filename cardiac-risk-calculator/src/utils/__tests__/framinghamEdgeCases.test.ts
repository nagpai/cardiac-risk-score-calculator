import { calculateFraminghamRisk, validateFraminghamInputs } from '../framingham';
import type { PatientData } from '../../types';

describe('Framingham Edge Cases', () => {
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

  describe('Input validation edge cases', () => {
    it('should reject invalid age values', () => {
      const invalidAgeData = { ...validPatientData, age: 25 };
      const errors = validateFraminghamInputs(invalidAgeData);
      expect(errors).toContain('Age must be between 30 and 79 years');
    });

    it('should reject invalid gender values', () => {
      const invalidGenderData = { ...validPatientData, gender: 'other' as any };
      const errors = validateFraminghamInputs(invalidGenderData);
      expect(errors).toContain('Gender must be specified as male or female');
    });

    it('should reject zero or negative cholesterol values', () => {
      const zeroTotalChol = { ...validPatientData, totalCholesterol: 0 };
      const negativeTotalChol = { ...validPatientData, totalCholesterol: -50 };
      const zeroHDL = { ...validPatientData, hdlCholesterol: 0 };
      const negativeHDL = { ...validPatientData, hdlCholesterol: -20 };

      expect(validateFraminghamInputs(zeroTotalChol)).toContain('Total cholesterol must be provided and greater than 0');
      expect(validateFraminghamInputs(negativeTotalChol)).toContain('Total cholesterol must be provided and greater than 0');
      expect(validateFraminghamInputs(zeroHDL)).toContain('HDL cholesterol must be provided and greater than 0');
      expect(validateFraminghamInputs(negativeHDL)).toContain('HDL cholesterol must be provided and greater than 0');
    });

    it('should reject invalid blood pressure values', () => {
      const zeroBP = { ...validPatientData, systolicBP: 0, diastolicBP: 0 };
      const negativeBP = { ...validPatientData, systolicBP: -120, diastolicBP: -80 };
      const inconsistentBP = { ...validPatientData, systolicBP: 80, diastolicBP: 90 };

      expect(validateFraminghamInputs(zeroBP)).toContain('Systolic blood pressure must be provided and greater than 0');
      expect(validateFraminghamInputs(negativeBP)).toContain('Systolic blood pressure must be provided and greater than 0');
      expect(validateFraminghamInputs(inconsistentBP)).toContain('Systolic blood pressure must be higher than diastolic blood pressure');
    });
  });

  describe('Calculation edge cases', () => {
    it('should handle boundary age values', () => {
      const minAge = { ...validPatientData, age: 30 };
      const maxAge = { ...validPatientData, age: 79 };

      expect(() => calculateFraminghamRisk(minAge)).not.toThrow();
      expect(() => calculateFraminghamRisk(maxAge)).not.toThrow();

      const result30 = calculateFraminghamRisk(minAge);
      const result79 = calculateFraminghamRisk(maxAge);

      expect(result30.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result30.tenYearRisk).toBeLessThanOrEqual(100);
      expect(result79.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result79.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('should handle extreme but valid cholesterol values', () => {
      const lowChol = { ...validPatientData, totalCholesterol: 100, hdlCholesterol: 20 };
      const highChol = { ...validPatientData, totalCholesterol: 400, hdlCholesterol: 100 };

      expect(() => calculateFraminghamRisk(lowChol)).not.toThrow();
      expect(() => calculateFraminghamRisk(highChol)).not.toThrow();

      const lowResult = calculateFraminghamRisk(lowChol);
      const highResult = calculateFraminghamRisk(highChol);

      expect(lowResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(lowResult.tenYearRisk).toBeLessThanOrEqual(100);
      expect(highResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(highResult.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('should handle extreme but valid blood pressure values', () => {
      const lowBP = { ...validPatientData, systolicBP: 80, diastolicBP: 40 };
      const highBP = { ...validPatientData, systolicBP: 200, diastolicBP: 120 };

      expect(() => calculateFraminghamRisk(lowBP)).not.toThrow();
      expect(() => calculateFraminghamRisk(highBP)).not.toThrow();

      const lowResult = calculateFraminghamRisk(lowBP);
      const highResult = calculateFraminghamRisk(highBP);

      expect(lowResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(lowResult.tenYearRisk).toBeLessThanOrEqual(100);
      expect(highResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(highResult.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('should handle unit conversion edge cases', () => {
      const mmolData = {
        ...validPatientData,
        cholesterolUnit: 'mmol/L' as const,
        totalCholesterol: 5.2, // ~200 mg/dL
        hdlCholesterol: 1.3,   // ~50 mg/dL
      };

      expect(() => calculateFraminghamRisk(mmolData)).not.toThrow();

      const result = calculateFraminghamRisk(mmolData);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('should handle all risk factors present', () => {
      const highRiskData = {
        ...validPatientData,
        age: 70,
        totalCholesterol: 300,
        hdlCholesterol: 30,
        systolicBP: 180,
        diastolicBP: 100,
        onBPMedication: true,
        smokingStatus: 'current' as const,
        hasDiabetes: true,
        familyHistory: true,
      };

      expect(() => calculateFraminghamRisk(highRiskData)).not.toThrow();

      const result = calculateFraminghamRisk(highRiskData);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
      expect(result.riskCategory).toBe('high');
    });

    it('should handle minimal risk factors', () => {
      const lowRiskData = {
        ...validPatientData,
        age: 30,
        gender: 'female' as const,
        totalCholesterol: 150,
        hdlCholesterol: 80,
        systolicBP: 90,
        diastolicBP: 60,
        onBPMedication: false,
        smokingStatus: 'never' as const,
        hasDiabetes: false,
        familyHistory: false,
      };

      expect(() => calculateFraminghamRisk(lowRiskData)).not.toThrow();

      const result = calculateFraminghamRisk(lowRiskData);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
      expect(result.riskCategory).toBe('low');
    });
  });

  describe('Error handling', () => {
    it('should throw error for HDL higher than total cholesterol', () => {
      const invalidData = {
        ...validPatientData,
        totalCholesterol: 150,
        hdlCholesterol: 160,
      };

      expect(() => calculateFraminghamRisk(invalidData)).toThrow('HDL cholesterol cannot be higher than or equal to total cholesterol');
    });

    it('should throw error for diastolic higher than systolic BP', () => {
      const invalidData = {
        ...validPatientData,
        systolicBP: 80,
        diastolicBP: 90,
      };

      expect(() => calculateFraminghamRisk(invalidData)).toThrow();
    });

    it('should throw error for invalid gender', () => {
      const invalidData = {
        ...validPatientData,
        gender: 'invalid' as any,
      };

      expect(() => calculateFraminghamRisk(invalidData)).toThrow(/Gender must be specified as male or female|Invalid gender/);
    });

    it('should handle NaN values gracefully', () => {
      const nanData = {
        ...validPatientData,
        totalCholesterol: NaN,
      };

      expect(() => calculateFraminghamRisk(nanData)).toThrow();
    });

    it('should handle infinite values gracefully', () => {
      const infiniteData = {
        ...validPatientData,
        totalCholesterol: Infinity,
      };

      expect(() => calculateFraminghamRisk(infiniteData)).toThrow();
    });

    it('should handle extremely high values', () => {
      const extremeData = {
        ...validPatientData,
        totalCholesterol: 10000,
      };

      expect(() => calculateFraminghamRisk(extremeData)).toThrow('Cholesterol values are outside calculable range');
    });
  });

  describe('Result validation', () => {
    it('should always return valid risk percentages', () => {
      const testCases = [
        { ...validPatientData, age: 30, gender: 'female' as const },
        { ...validPatientData, age: 50, gender: 'male' as const },
        { ...validPatientData, age: 79, gender: 'female' as const },
      ];

      testCases.forEach(testCase => {
        const result = calculateFraminghamRisk(testCase);
        
        expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
        expect(result.tenYearRisk).toBeLessThanOrEqual(100);
        expect(isFinite(result.tenYearRisk)).toBe(true);
        expect(result.riskCategory).toMatch(/^(low|moderate|high)$/);
        expect(result.recommendations).toBeInstanceOf(Array);
        expect(result.recommendations.length).toBeGreaterThan(0);
      });
    });

    it('should return consistent results for identical inputs', () => {
      const result1 = calculateFraminghamRisk(validPatientData);
      const result2 = calculateFraminghamRisk(validPatientData);

      expect(result1.tenYearRisk).toBe(result2.tenYearRisk);
      expect(result1.riskCategory).toBe(result2.riskCategory);
    });

    it('should handle decimal precision correctly', () => {
      const precisionData = {
        ...validPatientData,
        totalCholesterol: 200.5,
        hdlCholesterol: 50.3,
        systolicBP: 120.7,
        diastolicBP: 80.2,
      };

      expect(() => calculateFraminghamRisk(precisionData)).not.toThrow();

      const result = calculateFraminghamRisk(precisionData);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
    });
  });

  describe('Gender-specific calculations', () => {
    it('should produce different results for male vs female with same parameters', () => {
      const maleData = { ...validPatientData, gender: 'male' as const };
      const femaleData = { ...validPatientData, gender: 'female' as const };

      const maleResult = calculateFraminghamRisk(maleData);
      const femaleResult = calculateFraminghamRisk(femaleData);

      // Results should be different due to gender-specific coefficients
      expect(maleResult.tenYearRisk).not.toBe(femaleResult.tenYearRisk);
    });

    it('should handle edge cases for both genders', () => {
      const edgeCases = [
        { age: 30, totalCholesterol: 100, hdlCholesterol: 20 },
        { age: 79, totalCholesterol: 400, hdlCholesterol: 100 },
      ];

      edgeCases.forEach(edgeCase => {
        const maleData = { ...validPatientData, ...edgeCase, gender: 'male' as const };
        const femaleData = { ...validPatientData, ...edgeCase, gender: 'female' as const };

        expect(() => calculateFraminghamRisk(maleData)).not.toThrow();
        expect(() => calculateFraminghamRisk(femaleData)).not.toThrow();

        const maleResult = calculateFraminghamRisk(maleData);
        const femaleResult = calculateFraminghamRisk(femaleData);

        expect(maleResult.tenYearRisk).toBeGreaterThanOrEqual(0);
        expect(maleResult.tenYearRisk).toBeLessThanOrEqual(100);
        expect(femaleResult.tenYearRisk).toBeGreaterThanOrEqual(0);
        expect(femaleResult.tenYearRisk).toBeLessThanOrEqual(100);
      });
    });
  });
});