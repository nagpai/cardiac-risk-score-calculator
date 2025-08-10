/**
 * End-to-End Validation Tests
 * Tests the complete application flow and validates calculation accuracy
 */

import { describe, it, expect } from 'vitest';
import { calculateFraminghamRisk } from '../utils/framingham';
import { validatePatientData, isPatientDataComplete } from '../utils/validation';
import { convertCholesterolMgDlToMmolL, convertCholesterolMmolLToMgDl } from '../utils/unitConverter';
import type { PatientData } from '../types';

describe('End-to-End Validation Tests', () => {
  describe('Calculation Accuracy', () => {
    it('should calculate risk correctly for known test cases', () => {
      // Test case 1: Low risk patient
      const lowRiskPatient: PatientData = {
        age: 35,
        gender: 'female',
        totalCholesterol: 180,
        hdlCholesterol: 60,
        cholesterolUnit: 'mg/dL',
        systolicBP: 110,
        diastolicBP: 70,
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const lowRiskResult = calculateFraminghamRisk(lowRiskPatient);
      expect(lowRiskResult.tenYearRisk).toBeLessThan(10);
      expect(lowRiskResult.riskCategory).toBe('low');

      // Test case 2: High risk patient
      const highRiskPatient: PatientData = {
        age: 70,
        gender: 'male',
        totalCholesterol: 280,
        hdlCholesterol: 35,
        cholesterolUnit: 'mg/dL',
        systolicBP: 160,
        diastolicBP: 95,
        onBPMedication: true,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'current',
        hasDiabetes: true,
        familyHistory: true,
      };

      const highRiskResult = calculateFraminghamRisk(highRiskPatient);
      expect(highRiskResult.tenYearRisk).toBeGreaterThan(20);
      expect(highRiskResult.riskCategory).toBe('high');
    });

    it('should handle edge cases correctly', () => {
      // Test minimum age
      const minAgePatient: PatientData = {
        age: 30,
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

      const minAgeResult = calculateFraminghamRisk(minAgePatient);
      expect(minAgeResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(minAgeResult.tenYearRisk).toBeLessThanOrEqual(100);

      // Test maximum age
      const maxAgePatient: PatientData = {
        ...minAgePatient,
        age: 79,
      };

      const maxAgeResult = calculateFraminghamRisk(maxAgePatient);
      expect(maxAgeResult.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(maxAgeResult.tenYearRisk).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Validation', () => {
    it('should validate complete patient data correctly', () => {
      const completeData: PatientData = {
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

      expect(isPatientDataComplete(completeData)).toBe(true);
      
      const validationErrors = validatePatientData(completeData);
      expect(validationErrors).toHaveLength(0);
    });

    it('should detect incomplete patient data', () => {
      const incompleteData = {
        age: 45,
        gender: 'male',
        cholesterolUnit: 'mg/dL',
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      } as Partial<PatientData>;

      expect(isPatientDataComplete(incompleteData)).toBe(false);
    });

    it('should validate input ranges correctly', () => {
      const invalidData: PatientData = {
        age: 25, // Too young
        gender: 'male',
        totalCholesterol: 500, // Too high
        hdlCholesterol: 10, // Too low
        cholesterolUnit: 'mg/dL',
        systolicBP: 250, // Too high
        diastolicBP: 30, // Too low
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const validationErrors = validatePatientData(invalidData);
      expect(validationErrors.length).toBeGreaterThan(0);
      
      // Should have errors for age, cholesterol, and blood pressure
      const errorFields = validationErrors.map(error => error.field);
      expect(errorFields).toContain('age');
      expect(errorFields).toContain('totalCholesterol');
      expect(errorFields).toContain('hdlCholesterol');
      expect(errorFields).toContain('systolicBP');
      expect(errorFields).toContain('diastolicBP');
    });
  });

  describe('Unit Conversion', () => {
    it('should convert cholesterol units correctly', () => {
      // Test mg/dL to mmol/L conversion
      const mgDlValue = 200;
      const mmolLValue = convertCholesterolMgDlToMmolL(mgDlValue);
      expect(mmolLValue).toBeCloseTo(5.17, 2);

      // Test mmol/L to mg/dL conversion
      const convertedBack = convertCholesterolMmolLToMgDl(mmolLValue);
      expect(convertedBack).toBeCloseTo(mgDlValue, 0);
    });

    it('should maintain calculation accuracy across unit conversions', () => {
      const patientMgDl: PatientData = {
        age: 50,
        gender: 'male',
        totalCholesterol: 240,
        hdlCholesterol: 40,
        cholesterolUnit: 'mg/dL',
        systolicBP: 140,
        diastolicBP: 90,
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'former',
        hasDiabetes: false,
        familyHistory: true,
      };

      const patientMmolL: PatientData = {
        ...patientMgDl,
        totalCholesterol: convertCholesterolMgDlToMmolL(240),
        hdlCholesterol: convertCholesterolMgDlToMmolL(40),
        cholesterolUnit: 'mmol/L',
      };

      const resultMgDl = calculateFraminghamRisk(patientMgDl);
      const resultMmolL = calculateFraminghamRisk(patientMmolL);

      // Results should be very close (within 0.1% difference)
      const difference = Math.abs(resultMgDl.tenYearRisk - resultMmolL.tenYearRisk);
      expect(difference).toBeLessThan(0.1);
    });
  });

  describe('Performance Requirements', () => {
    it('should calculate risk within 100ms', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'female',
        totalCholesterol: 220,
        hdlCholesterol: 55,
        cholesterolUnit: 'mg/dL',
        systolicBP: 130,
        diastolicBP: 85,
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const startTime = performance.now();
      const result = calculateFraminghamRisk(patientData);
      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(100);
      expect(result).toBeDefined();
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple calculations efficiently', () => {
      const basePatient: PatientData = {
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

      const startTime = performance.now();
      
      // Perform 100 calculations
      for (let i = 0; i < 100; i++) {
        const patient = { ...basePatient, age: 30 + (i % 50) };
        calculateFraminghamRisk(patient);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 100;

      expect(averageTime).toBeLessThan(10); // Average should be under 10ms
    });
  });

  describe('Medical Accuracy Validation', () => {
    it('should produce results consistent with Framingham study', () => {
      // Test cases based on published Framingham data
      const framinghamTestCases = [
        {
          patient: {
            age: 60,
            gender: 'male' as const,
            totalCholesterol: 200,
            hdlCholesterol: 45,
            cholesterolUnit: 'mg/dL' as const,
            systolicBP: 120,
            diastolicBP: 80,
            onBPMedication: false,
            glucoseUnit: 'mg/dL' as const,
            smokingStatus: 'never' as const,
            hasDiabetes: false,
            familyHistory: false,
          },
          expectedRiskRange: { min: 8, max: 15 },
        },
        {
          patient: {
            age: 65,
            gender: 'female' as const,
            totalCholesterol: 240,
            hdlCholesterol: 50,
            cholesterolUnit: 'mg/dL' as const,
            systolicBP: 140,
            diastolicBP: 90,
            onBPMedication: false,
            glucoseUnit: 'mg/dL' as const,
            smokingStatus: 'never' as const,
            hasDiabetes: false,
            familyHistory: false,
          },
          expectedRiskRange: { min: 10, max: 18 },
        },
      ];

      framinghamTestCases.forEach((testCase, index) => {
        const result = calculateFraminghamRisk(testCase.patient);
        expect(result.tenYearRisk).toBeGreaterThanOrEqual(testCase.expectedRiskRange.min);
        expect(result.tenYearRisk).toBeLessThanOrEqual(testCase.expectedRiskRange.max);
      });
    });

    it('should provide appropriate risk categorization', () => {
      const testCases = [
        { risk: 5, expectedCategory: 'low' },
        { risk: 15, expectedCategory: 'moderate' },
        { risk: 25, expectedCategory: 'high' },
      ];

      testCases.forEach(({ risk, expectedCategory }) => {
        // Create a patient that would result in approximately the target risk
        const patient: PatientData = {
          age: risk < 10 ? 35 : risk < 20 ? 55 : 70,
          gender: 'male',
          totalCholesterol: risk < 10 ? 180 : risk < 20 ? 220 : 280,
          hdlCholesterol: risk < 10 ? 60 : risk < 20 ? 45 : 35,
          cholesterolUnit: 'mg/dL',
          systolicBP: risk < 10 ? 110 : risk < 20 ? 130 : 160,
          diastolicBP: risk < 10 ? 70 : risk < 20 ? 85 : 95,
          onBPMedication: false,
          glucoseUnit: 'mg/dL',
          smokingStatus: risk >= 20 ? 'current' : 'never',
          hasDiabetes: risk >= 20,
          familyHistory: risk >= 15,
        };

        const result = calculateFraminghamRisk(patient);
        
        // Verify the risk category matches expectations
        if (result.tenYearRisk < 10) {
          expect(result.riskCategory).toBe('low');
        } else if (result.tenYearRisk < 20) {
          expect(result.riskCategory).toBe('moderate');
        } else {
          expect(result.riskCategory).toBe('high');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', () => {
      const invalidPatient = {
        age: -5,
        gender: 'invalid',
        totalCholesterol: 'not a number',
        hdlCholesterol: null,
      } as any;

      expect(() => {
        validatePatientData(invalidPatient);
      }).not.toThrow();

      const errors = validatePatientData(invalidPatient);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate blood pressure consistency', () => {
      const inconsistentBP: PatientData = {
        age: 45,
        gender: 'male',
        totalCholesterol: 200,
        hdlCholesterol: 50,
        cholesterolUnit: 'mg/dL',
        systolicBP: 80, // Lower than diastolic
        diastolicBP: 120, // Higher than systolic
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const errors = validatePatientData(inconsistentBP);
      const bpErrors = errors.filter(error => 
        error.field === 'systolicBP' || error.field === 'diastolicBP'
      );
      expect(bpErrors.length).toBeGreaterThan(0);
    });
  });
});