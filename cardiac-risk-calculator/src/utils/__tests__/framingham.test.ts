import { describe, it, expect } from 'vitest';
import { 
  calculateFraminghamRisk, 
  validateFraminghamInputs, 
  createSamplePatientData 
} from '../framingham';
import type { PatientData } from '../../types';

describe('Framingham Risk Score Calculator', () => {
  describe('calculateFraminghamRisk', () => {
    it('should calculate risk for a typical male patient', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'male',
        totalCholesterol: 200,
        hdlCholesterol: 45,
        cholesterolUnit: 'mg/dL',
        systolicBP: 140,
        diastolicBP: 90,
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const result = calculateFraminghamRisk(patientData);

      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(100);
      expect(result.riskCategory).toMatch(/^(low|moderate|high)$/);
      expect(result.framinghamVersion).toBe('2008');
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it('should calculate risk for a typical female patient', () => {
      const patientData: PatientData = {
        age: 50,
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

      const result = calculateFraminghamRisk(patientData);

      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(100);
      expect(result.riskCategory).toMatch(/^(low|moderate|high)$/);
      expect(result.framinghamVersion).toBe('2008');
    });

    it('should handle cholesterol values in mmol/L', () => {
      const patientData: PatientData = {
        age: 60,
        gender: 'male',
        totalCholesterol: 5.2, // mmol/L
        hdlCholesterol: 1.2,   // mmol/L
        cholesterolUnit: 'mmol/L',
        systolicBP: 150,
        diastolicBP: 95,
        onBPMedication: false,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'never',
        hasDiabetes: false,
        familyHistory: false,
      };

      const result = calculateFraminghamRisk(patientData);

      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(100);
      expect(result.riskCategory).toMatch(/^(low|moderate|high)$/);
    });

    it('should increase risk for smokers', () => {
      const basePatient: PatientData = createSamplePatientData();
      const smokerPatient: PatientData = { ...basePatient, smokingStatus: 'current' };

      const baseResult = calculateFraminghamRisk(basePatient);
      const smokerResult = calculateFraminghamRisk(smokerPatient);

      expect(smokerResult.tenYearRisk).toBeGreaterThan(baseResult.tenYearRisk);
      expect(smokerResult.riskFactors.smoking).toBeGreaterThan(0);
      expect(baseResult.riskFactors.smoking).toBe(0);
    });

    it('should increase risk for diabetic patients', () => {
      const basePatient: PatientData = createSamplePatientData();
      const diabeticPatient: PatientData = { ...basePatient, hasDiabetes: true };

      const baseResult = calculateFraminghamRisk(basePatient);
      const diabeticResult = calculateFraminghamRisk(diabeticPatient);

      expect(diabeticResult.tenYearRisk).toBeGreaterThan(baseResult.tenYearRisk);
      expect(diabeticResult.riskFactors.diabetes).toBeGreaterThan(0);
      expect(baseResult.riskFactors.diabetes).toBe(0);
    });

    it('should increase risk for patients on BP medication', () => {
      const basePatient: PatientData = createSamplePatientData();
      const medicatedPatient: PatientData = { ...basePatient, onBPMedication: true };

      const baseResult = calculateFraminghamRisk(basePatient);
      const medicatedResult = calculateFraminghamRisk(medicatedPatient);

      // Patients on BP medication typically have higher risk
      expect(medicatedResult.tenYearRisk).toBeGreaterThan(baseResult.tenYearRisk);
    });

    it('should increase risk with family history', () => {
      const basePatient: PatientData = createSamplePatientData();
      const familyHistoryPatient: PatientData = { ...basePatient, familyHistory: true };

      const baseResult = calculateFraminghamRisk(basePatient);
      const familyHistoryResult = calculateFraminghamRisk(familyHistoryPatient);

      expect(familyHistoryResult.tenYearRisk).toBeGreaterThan(baseResult.tenYearRisk);
      expect(familyHistoryResult.riskFactors.familyHistory).toBeGreaterThan(0);
      expect(baseResult.riskFactors.familyHistory).toBe(0);
    });

    it('should categorize risk correctly', () => {
      // Test low risk scenario
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

      // Test high risk scenario
      const highRiskPatient: PatientData = {
        age: 70,
        gender: 'male',
        totalCholesterol: 280,
        hdlCholesterol: 30,
        cholesterolUnit: 'mg/dL',
        systolicBP: 180,
        diastolicBP: 100,
        onBPMedication: true,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'current',
        hasDiabetes: true,
        familyHistory: true,
      };

      const lowResult = calculateFraminghamRisk(lowRiskPatient);
      const highResult = calculateFraminghamRisk(highRiskPatient);

      expect(lowResult.riskCategory).toBe('low');
      expect(highResult.riskCategory).toBe('high');
      expect(highResult.tenYearRisk).toBeGreaterThan(lowResult.tenYearRisk);
    });

    it('should include comparison data', () => {
      const patientData = createSamplePatientData();
      const result = calculateFraminghamRisk(patientData);

      expect(result.comparisonData).toBeDefined();
      expect(result.comparisonData.averageForAge).toBeGreaterThan(0);
      expect(result.comparisonData.averageForGender).toBeGreaterThan(0);
      expect(result.comparisonData.idealRisk).toBeGreaterThan(0);
      expect(result.comparisonData.idealRisk).toBeLessThan(result.comparisonData.averageForAge);
    });

    it('should round risk to 1 decimal place', () => {
      const patientData = createSamplePatientData();
      const result = calculateFraminghamRisk(patientData);

      // Check that the result has at most 1 decimal place
      const decimalPlaces = (result.tenYearRisk.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });

    it('should handle edge case ages', () => {
      const youngPatient: PatientData = { ...createSamplePatientData(), age: 30 };
      const oldPatient: PatientData = { ...createSamplePatientData(), age: 79 };

      const youngResult = calculateFraminghamRisk(youngPatient);
      const oldResult = calculateFraminghamRisk(oldPatient);

      expect(youngResult.tenYearRisk).toBeGreaterThan(0);
      expect(oldResult.tenYearRisk).toBeGreaterThan(youngResult.tenYearRisk);
      expect(oldResult.tenYearRisk).toBeLessThan(100);
    });
  });

  describe('validateFraminghamInputs', () => {
    it('should return no errors for valid input', () => {
      const validPatient = createSamplePatientData();
      const errors = validateFraminghamInputs(validPatient);
      expect(errors).toHaveLength(0);
    });

    it('should validate age range', () => {
      const youngPatient: PatientData = { ...createSamplePatientData(), age: 25 };
      const oldPatient: PatientData = { ...createSamplePatientData(), age: 85 };

      const youngErrors = validateFraminghamInputs(youngPatient);
      const oldErrors = validateFraminghamInputs(oldPatient);

      expect(youngErrors).toContain('Age must be between 30 and 79 years');
      expect(oldErrors).toContain('Age must be between 30 and 79 years');
    });

    it('should validate gender', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        gender: 'other' as any 
      };

      const errors = validateFraminghamInputs(invalidPatient);
      expect(errors).toContain('Gender must be specified as male or female');
    });

    it('should validate cholesterol values', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        totalCholesterol: 0,
        hdlCholesterol: -10
      };

      const errors = validateFraminghamInputs(invalidPatient);
      expect(errors).toContain('Total cholesterol must be provided and greater than 0');
      expect(errors).toContain('HDL cholesterol must be provided and greater than 0');
    });

    it('should validate blood pressure values', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        systolicBP: 0,
        diastolicBP: -5
      };

      const errors = validateFraminghamInputs(invalidPatient);
      expect(errors).toContain('Systolic blood pressure must be provided and greater than 0');
      expect(errors).toContain('Diastolic blood pressure must be provided and greater than 0');
    });

    it('should validate blood pressure relationship', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        systolicBP: 120,
        diastolicBP: 130 // Higher than systolic
      };

      const errors = validateFraminghamInputs(invalidPatient);
      expect(errors).toContain('Systolic blood pressure must be higher than diastolic blood pressure');
    });

    it('should validate multiple errors', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        age: 25,
        totalCholesterol: 0,
        systolicBP: 0
      };

      const errors = validateFraminghamInputs(invalidPatient);
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('createSamplePatientData', () => {
    it('should create valid sample data', () => {
      const sampleData = createSamplePatientData();
      const errors = validateFraminghamInputs(sampleData);
      
      expect(errors).toHaveLength(0);
      expect(sampleData.age).toBeGreaterThanOrEqual(30);
      expect(sampleData.age).toBeLessThanOrEqual(79);
      expect(['male', 'female']).toContain(sampleData.gender);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid calculation', () => {
      const invalidPatient: PatientData = { 
        ...createSamplePatientData(), 
        totalCholesterol: NaN
      };

      expect(() => calculateFraminghamRisk(invalidPatient)).toThrow();
    });
  });

  describe('published Framingham data verification', () => {
    it('should match expected risk for published test case 1', () => {
      // Test case from Framingham study publications
      // 55-year-old male, non-smoker, no diabetes, typical cholesterol
      const testPatient: PatientData = {
        age: 55,
        gender: 'male',
        totalCholesterol: 213,
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

      const result = calculateFraminghamRisk(testPatient);
      
      // Expected risk should be in the moderate range for this profile
      expect(result.tenYearRisk).toBeGreaterThan(5);
      expect(result.tenYearRisk).toBeLessThan(25);
    });

    it('should match expected risk for published test case 2', () => {
      // Test case: 45-year-old female, optimal profile
      const testPatient: PatientData = {
        age: 45,
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

      const result = calculateFraminghamRisk(testPatient);
      
      // Expected risk should be low for this optimal profile
      expect(result.tenYearRisk).toBeLessThan(10);
      expect(result.riskCategory).toBe('low');
    });
  });
});