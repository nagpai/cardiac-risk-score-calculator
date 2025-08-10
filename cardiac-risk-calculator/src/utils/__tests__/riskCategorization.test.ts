import { describe, it, expect } from 'vitest';
import {
  categorizeRisk,
  generateRecommendations,
  getRiskCategoryColor,
  getRiskCategoryDescription,
  isValidRiskPercentage,
  formatRiskPercentage,
  getPriorityIcon,
  getCategoryIcon,
} from '../riskCategorization';
import { createSamplePatientData } from '../framingham';
import type { PatientData } from '../../types';

describe('Risk Categorization and Recommendation Engine', () => {
  describe('categorizeRisk', () => {
    it('should categorize low risk correctly', () => {
      expect(categorizeRisk(5)).toBe('low');
      expect(categorizeRisk(9.9)).toBe('low');
      expect(categorizeRisk(0)).toBe('low');
    });

    it('should categorize moderate risk correctly', () => {
      expect(categorizeRisk(10)).toBe('moderate');
      expect(categorizeRisk(15)).toBe('moderate');
      expect(categorizeRisk(19.9)).toBe('moderate');
    });

    it('should categorize high risk correctly', () => {
      expect(categorizeRisk(20)).toBe('high');
      expect(categorizeRisk(25)).toBe('high');
      expect(categorizeRisk(50)).toBe('high');
      expect(categorizeRisk(100)).toBe('high');
    });

    it('should handle edge cases', () => {
      expect(categorizeRisk(9.99)).toBe('low');
      expect(categorizeRisk(10.01)).toBe('moderate');
      expect(categorizeRisk(19.99)).toBe('moderate');
      expect(categorizeRisk(20.01)).toBe('high');
    });
  });

  describe('generateRecommendations', () => {
    let basePatient: PatientData;

    beforeEach(() => {
      basePatient = createSamplePatientData();
    });

    describe('low risk recommendations', () => {
      it('should generate appropriate recommendations for low risk patients', () => {
        // Use a patient with normal blood pressure to avoid extra recommendations
        const normalPatient: PatientData = {
          ...basePatient,
          systolicBP: 120,
          diastolicBP: 80
        };
        const recommendations = generateRecommendations('low', 5, normalPatient);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].category).toBe('lifestyle');
        expect(recommendations[0].title).toContain('Maintain Healthy Lifestyle');
        expect(recommendations[1].category).toBe('monitoring');
        expect(recommendations[1].title).toContain('Regular Health Check-ups');
      });

      it('should include risk percentage in description', () => {
        const normalPatient: PatientData = {
          ...basePatient,
          systolicBP: 120,
          diastolicBP: 80
        };
        const recommendations = generateRecommendations('low', 7.5, normalPatient);
        
        expect(recommendations[0].description).toContain('7.5%');
      });
    });

    describe('moderate risk recommendations', () => {
      it('should generate appropriate recommendations for moderate risk patients', () => {
        const recommendations = generateRecommendations('moderate', 15, basePatient);
        
        expect(recommendations.length).toBeGreaterThanOrEqual(3);
        
        const medicalRec = recommendations.find(r => r.category === 'medical');
        const lifestyleRec = recommendations.find(r => r.category === 'lifestyle');
        const monitoringRec = recommendations.find(r => r.category === 'monitoring');
        
        expect(medicalRec).toBeDefined();
        expect(lifestyleRec).toBeDefined();
        expect(monitoringRec).toBeDefined();
        
        expect(medicalRec?.priority).toBe('high');
        expect(lifestyleRec?.priority).toBe('high');
      });
    });

    describe('high risk recommendations', () => {
      it('should generate appropriate recommendations for high risk patients', () => {
        const recommendations = generateRecommendations('high', 25, basePatient);
        
        expect(recommendations.length).toBeGreaterThanOrEqual(3);
        
        const medicalRec = recommendations.find(r => r.category === 'medical');
        expect(medicalRec?.title).toContain('Immediate Medical Consultation');
        expect(medicalRec?.priority).toBe('high');
      });
    });

    describe('personalized recommendations', () => {
      it('should add smoking cessation recommendations for current smokers', () => {
        const smokerPatient: PatientData = { ...basePatient, smokingStatus: 'current' };
        const recommendations = generateRecommendations('moderate', 15, smokerPatient);
        
        const smokingRec = recommendations.find(r => r.title.includes('Smoking Cessation'));
        expect(smokingRec).toBeDefined();
        expect(smokingRec?.priority).toBe('high');
        expect(smokingRec?.actionItems.some(item => item.includes('QUIT-NOW'))).toBe(true);
      });

      it('should add maintenance recommendations for former smokers', () => {
        const formerSmokerPatient: PatientData = { ...basePatient, smokingStatus: 'former' };
        const recommendations = generateRecommendations('low', 5, formerSmokerPatient);
        
        const smokingRec = recommendations.find(r => r.title.includes('Smoke-Free Status'));
        expect(smokingRec).toBeDefined();
        expect(smokingRec?.priority).toBe('medium');
      });

      it('should add diabetes management recommendations for diabetic patients', () => {
        const diabeticPatient: PatientData = { ...basePatient, hasDiabetes: true };
        const recommendations = generateRecommendations('moderate', 15, diabeticPatient);
        
        const diabetesRec = recommendations.find(r => r.title.includes('Diabetes Management'));
        expect(diabetesRec).toBeDefined();
        expect(diabetesRec?.priority).toBe('high');
        expect(diabetesRec?.actionItems.some(item => item.includes('HbA1c'))).toBe(true);
      });

      it('should add blood pressure recommendations for hypertensive patients', () => {
        const hypertensivePatient: PatientData = { 
          ...basePatient, 
          systolicBP: 150, 
          diastolicBP: 95 
        };
        const recommendations = generateRecommendations('moderate', 15, hypertensivePatient);
        
        const bpRec = recommendations.find(r => r.title.includes('Blood Pressure Management'));
        expect(bpRec).toBeDefined();
        expect(bpRec?.description).toContain('150/95');
      });

      it('should add cholesterol recommendations for patients with high cholesterol', () => {
        const highCholPatient: PatientData = { 
          ...basePatient, 
          totalCholesterol: 280,
          hdlCholesterol: 35
        };
        const recommendations = generateRecommendations('moderate', 15, highCholPatient);
        
        const cholRec = recommendations.find(r => r.title.includes('Cholesterol Management'));
        expect(cholRec).toBeDefined();
        expect(cholRec?.actionItems.some(item => item.includes('saturated'))).toBe(true);
      });

      it('should add age-specific recommendations for elderly patients', () => {
        const elderlyPatient: PatientData = { ...basePatient, age: 70 };
        const recommendations = generateRecommendations('moderate', 15, elderlyPatient);
        
        const ageRec = recommendations.find(r => r.title.includes('Age-Related'));
        expect(ageRec).toBeDefined();
        expect(ageRec?.category).toBe('monitoring');
      });

      it('should add family history recommendations', () => {
        const familyHistoryPatient: PatientData = { ...basePatient, familyHistory: true };
        const recommendations = generateRecommendations('low', 5, familyHistoryPatient);
        
        const familyRec = recommendations.find(r => r.title.includes('Family History'));
        expect(familyRec).toBeDefined();
        expect(familyRec?.actionItems.some(item => item.toLowerCase().includes('family history'))).toBe(true);
      });

      it('should handle mmol/L cholesterol units correctly', () => {
        const mmolPatient: PatientData = { 
          ...basePatient, 
          totalCholesterol: 7.0, // High in mmol/L
          hdlCholesterol: 1.0,   // Low in mmol/L
          cholesterolUnit: 'mmol/L'
        };
        const recommendations = generateRecommendations('moderate', 15, mmolPatient);
        
        const cholRec = recommendations.find(r => r.title.includes('Cholesterol Management'));
        expect(cholRec).toBeDefined();
      });
    });

    describe('recommendation sorting', () => {
      it('should sort recommendations by priority (high first)', () => {
        const highRiskPatient: PatientData = { 
          ...basePatient, 
          smokingStatus: 'current',
          hasDiabetes: true
        };
        const recommendations = generateRecommendations('high', 25, highRiskPatient);
        
        // First few recommendations should be high priority
        expect(recommendations[0].priority).toBe('high');
        expect(recommendations[1].priority).toBe('high');
        
        // Check that high priority comes before medium/low
        const priorities = recommendations.map(r => r.priority);
        const firstMediumIndex = priorities.indexOf('medium');
        const firstLowIndex = priorities.indexOf('low');
        
        if (firstMediumIndex !== -1) {
          const lastHighIndex = priorities.lastIndexOf('high');
          expect(lastHighIndex).toBeLessThan(firstMediumIndex);
        }
        
        if (firstLowIndex !== -1) {
          const lastMediumIndex = priorities.lastIndexOf('medium');
          if (lastMediumIndex !== -1) {
            expect(lastMediumIndex).toBeLessThan(firstLowIndex);
          }
        }
      });

      it('should sort by category within same priority', () => {
        const recommendations = generateRecommendations('moderate', 15, basePatient);
        
        const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
        if (highPriorityRecs.length > 1) {
          // Medical should come before lifestyle, lifestyle before monitoring
          const categories = highPriorityRecs.map(r => r.category);
          const medicalIndex = categories.indexOf('medical');
          const lifestyleIndex = categories.indexOf('lifestyle');
          
          if (medicalIndex !== -1 && lifestyleIndex !== -1) {
            expect(medicalIndex).toBeLessThan(lifestyleIndex);
          }
        }
      });
    });
  });

  describe('utility functions', () => {
    describe('getRiskCategoryColor', () => {
      it('should return correct colors for each category', () => {
        expect(getRiskCategoryColor('low')).toBe('#22c55e');
        expect(getRiskCategoryColor('moderate')).toBe('#f59e0b');
        expect(getRiskCategoryColor('high')).toBe('#ef4444');
      });

      it('should return default color for unknown category', () => {
        expect(getRiskCategoryColor('unknown' as any)).toBe('#6b7280');
      });
    });

    describe('getRiskCategoryDescription', () => {
      it('should return correct descriptions for each category', () => {
        expect(getRiskCategoryDescription('low')).toBe('Low Risk (<10%)');
        expect(getRiskCategoryDescription('moderate')).toBe('Moderate Risk (10-20%)');
        expect(getRiskCategoryDescription('high')).toBe('High Risk (≥20%)');
      });

      it('should return default description for unknown category', () => {
        expect(getRiskCategoryDescription('unknown' as any)).toBe('Unknown Risk');
      });
    });

    describe('isValidRiskPercentage', () => {
      it('should validate correct risk percentages', () => {
        expect(isValidRiskPercentage(0)).toBe(true);
        expect(isValidRiskPercentage(50)).toBe(true);
        expect(isValidRiskPercentage(100)).toBe(true);
        expect(isValidRiskPercentage(15.5)).toBe(true);
      });

      it('should reject invalid risk percentages', () => {
        expect(isValidRiskPercentage(-1)).toBe(false);
        expect(isValidRiskPercentage(101)).toBe(false);
        expect(isValidRiskPercentage(NaN)).toBe(false);
        expect(isValidRiskPercentage(Infinity)).toBe(false);
        expect(isValidRiskPercentage('15' as any)).toBe(false);
      });
    });

    describe('formatRiskPercentage', () => {
      it('should format valid percentages correctly', () => {
        expect(formatRiskPercentage(15)).toBe('15.0%');
        expect(formatRiskPercentage(15.5)).toBe('15.5%');
        expect(formatRiskPercentage(0)).toBe('0.0%');
        expect(formatRiskPercentage(100)).toBe('100.0%');
      });

      it('should handle invalid percentages', () => {
        expect(formatRiskPercentage(NaN)).toBe('Invalid');
        expect(formatRiskPercentage(-1)).toBe('Invalid');
        expect(formatRiskPercentage(101)).toBe('Invalid');
      });
    });

    describe('getPriorityIcon', () => {
      it('should return correct icons for each priority', () => {
        expect(getPriorityIcon('high')).toBe('🔴');
        expect(getPriorityIcon('medium')).toBe('🟡');
        expect(getPriorityIcon('low')).toBe('🟢');
      });

      it('should return default icon for unknown priority', () => {
        expect(getPriorityIcon('unknown' as any)).toBe('⚪');
      });
    });

    describe('getCategoryIcon', () => {
      it('should return correct icons for each category', () => {
        expect(getCategoryIcon('medical')).toBe('🏥');
        expect(getCategoryIcon('lifestyle')).toBe('🏃');
        expect(getCategoryIcon('monitoring')).toBe('📊');
      });

      it('should return default icon for unknown category', () => {
        expect(getCategoryIcon('unknown' as any)).toBe('📋');
      });
    });
  });

  describe('comprehensive recommendation scenarios', () => {
    it('should generate comprehensive recommendations for high-risk smoker with diabetes', () => {
      const highRiskPatient: PatientData = {
        age: 65,
        gender: 'male',
        totalCholesterol: 280,
        hdlCholesterol: 30,
        cholesterolUnit: 'mg/dL',
        systolicBP: 160,
        diastolicBP: 100,
        onBPMedication: true,
        glucoseUnit: 'mg/dL',
        smokingStatus: 'current',
        hasDiabetes: true,
        familyHistory: true,
      };

      const recommendations = generateRecommendations('high', 30, highRiskPatient);

      // Should have multiple high-priority recommendations
      const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
      expect(highPriorityRecs.length).toBeGreaterThanOrEqual(4);

      // Should include specific recommendations for each risk factor
      expect(recommendations.some(r => r.title.includes('Smoking Cessation'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('Diabetes Management'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('Blood Pressure'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('Cholesterol'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('Age-Related'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('Family History'))).toBe(true);
    });

    it('should generate minimal recommendations for optimal low-risk patient', () => {
      const optimalPatient: PatientData = {
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

      const recommendations = generateRecommendations('low', 3, optimalPatient);

      // Should have basic maintenance recommendations only
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].category).toBe('lifestyle');
      expect(recommendations[1].category).toBe('monitoring');
      expect(recommendations.every(r => r.priority === 'medium' || r.priority === 'low')).toBe(true);
    });
  });
});