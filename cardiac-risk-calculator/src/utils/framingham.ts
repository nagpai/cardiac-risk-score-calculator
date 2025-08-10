import type { PatientData, RiskResult, FraminghamCoefficients } from '../types';
import { FRAMINGHAM_COEFFICIENTS, APP_CONFIG } from './constants';
import { categorizeRisk, generateRecommendations } from './riskCategorization';

/**
 * Framingham Risk Score Calculator
 * Implements the 2008 Framingham Heart Study algorithm for 10-year cardiovascular risk assessment
 */

/**
 * Calculates the 10-year cardiovascular risk using the Framingham Risk Score algorithm
 * @param patientData - Patient data with all required risk factors
 * @returns Risk result with percentage and detailed analysis
 */
export function calculateFraminghamRisk(patientData: PatientData): RiskResult {
  try {
    // Validate inputs first
    const validationErrors = validateFraminghamInputs(patientData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Convert all values to standard units (mg/dL for cholesterol)
    const standardizedData = standardizeUnits(patientData);
    
    // Check for NaN values after conversion
    if (isNaN(standardizedData.totalCholesterol) || isNaN(standardizedData.hdlCholesterol)) {
      throw new Error('Invalid cholesterol values after unit conversion');
    }
    
    // Get gender-specific coefficients
    const coefficients = FRAMINGHAM_COEFFICIENTS[patientData.gender];
    
    // Calculate individual risk factor scores
    const riskFactors = calculateRiskFactorScores(standardizedData, coefficients);
    
    // Calculate total risk score
    const totalScore = Object.values(riskFactors).reduce((sum, score) => sum + score, 0);
    
    // Convert score to 10-year risk percentage
    const tenYearRisk = convertScoreToRiskPercentage(totalScore, patientData.gender);
    
    // Generate comparison data
    const comparisonData = generateComparisonData(patientData);
    
    // Categorize risk and generate recommendations
    const riskCategory = categorizeRisk(tenYearRisk);
    const recommendations = generateRecommendations(riskCategory, tenYearRisk, patientData);
    
    return {
      tenYearRisk: Math.round(tenYearRisk * 10) / 10, // Round to 1 decimal place
      riskCategory,
      riskFactors,
      comparisonData,
      recommendations,
      calculatedAt: new Date(),
      framinghamVersion: APP_CONFIG.FRAMINGHAM_VERSION,
    };
  } catch (error) {
    throw new Error(`Framingham risk calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Standardizes patient data units to mg/dL for cholesterol calculations
 */
function standardizeUnits(patientData: PatientData): PatientData {
  const standardized = { ...patientData };
  
  // Convert cholesterol to mg/dL if needed
  if (patientData.cholesterolUnit === 'mmol/L') {
    standardized.totalCholesterol = mmolLToMgDl(patientData.totalCholesterol);
    standardized.hdlCholesterol = mmolLToMgDl(patientData.hdlCholesterol);
    if (patientData.ldlCholesterol) {
      standardized.ldlCholesterol = mmolLToMgDl(patientData.ldlCholesterol);
    }
  }
  
  return standardized;
}

/**
 * Calculates individual risk factor scores using Framingham coefficients
 */
function calculateRiskFactorScores(
  patientData: PatientData, 
  coefficients: FraminghamCoefficients['male'] | FraminghamCoefficients['female']
): RiskResult['riskFactors'] {
  // Age score (natural log of age)
  const ageScore = coefficients.age * Math.log(patientData.age);
  
  // Total cholesterol score (natural log of total cholesterol)
  const cholesterolScore = coefficients.totalCholesterol * Math.log(patientData.totalCholesterol);
  
  // HDL cholesterol score (natural log of HDL cholesterol)
  const hdlScore = coefficients.hdlCholesterol * Math.log(patientData.hdlCholesterol);
  
  // Blood pressure score (natural log of systolic BP)
  const bpCoefficient = patientData.onBPMedication 
    ? coefficients.systolicBPTreated 
    : coefficients.systolicBP;
  const bloodPressureScore = bpCoefficient * Math.log(patientData.systolicBP);
  
  // Smoking score (1 if current smoker, 0 otherwise)
  const smokingScore = patientData.smokingStatus === 'current' 
    ? coefficients.smoking 
    : 0;
  
  // Diabetes score (1 if diabetic, 0 otherwise)
  const diabetesScore = patientData.hasDiabetes 
    ? coefficients.diabetes 
    : 0;
  
  // Family history is not part of the original Framingham algorithm
  // but we'll include it as a modifier (simplified approach)
  const familyHistoryScore = patientData.familyHistory ? 0.2 : 0;
  
  return {
    age: ageScore,
    gender: 0, // Gender is handled by coefficient selection
    cholesterol: cholesterolScore + hdlScore, // Combined cholesterol effect
    bloodPressure: bloodPressureScore,
    smoking: smokingScore,
    diabetes: diabetesScore,
    familyHistory: familyHistoryScore,
  };
}

/**
 * Converts the total risk score to a 10-year risk percentage
 * Uses gender-specific baseline survival functions from Framingham study
 */
function convertScoreToRiskPercentage(totalScore: number, gender: 'male' | 'female'): number {
  // Gender-specific baseline survival probabilities at 10 years
  // These are derived from the Framingham Heart Study
  const baselineSurvival = {
    male: 0.88431,    // 88.431% baseline 10-year survival for men
    female: 0.95012,  // 95.012% baseline 10-year survival for women
  };
  
  // Calculate risk using the Framingham formula
  // Risk = 1 - (baseline_survival ^ exp(total_score - mean_score))
  
  // Mean scores for the reference population (from Framingham study)
  const meanScores = {
    male: 23.9802,
    female: 26.1931,
  };
  
  const adjustedScore = totalScore - meanScores[gender];
  const survivalProbability = Math.pow(baselineSurvival[gender], Math.exp(adjustedScore));
  const riskProbability = 1 - survivalProbability;
  
  // Convert to percentage and ensure it's within reasonable bounds
  const riskPercentage = Math.max(0, Math.min(100, riskProbability * 100));
  
  return riskPercentage;
}

// Risk categorization is now handled by the riskCategorization module

/**
 * Generates comparison data for the patient's demographic
 */
function generateComparisonData(patientData: PatientData): RiskResult['comparisonData'] {
  // These are approximate values based on population studies
  // In a real implementation, these would come from comprehensive datasets
  
  const ageGroup = Math.floor(patientData.age / 10) * 10; // Round to nearest decade
  
  // Approximate average risks by age and gender (simplified)
  const averageRisks = {
    male: {
      30: 3, 40: 5, 50: 9, 60: 16, 70: 25,
    },
    female: {
      30: 1, 40: 2, 50: 5, 60: 8, 70: 12,
    },
  };
  
  const genderRisks = averageRisks[patientData.gender];
  const averageForAge = genderRisks[ageGroup as keyof typeof genderRisks] || 10;
  
  // Overall gender average (simplified)
  const averageForGender = patientData.gender === 'male' ? 12 : 6;
  
  // Ideal risk (optimal health profile)
  const idealRisk = patientData.gender === 'male' ? 2 : 1;
  
  return {
    averageForAge,
    averageForGender,
    idealRisk,
  };
}

/**
 * Helper function to convert mmol/L to mg/dL for cholesterol
 */
function mmolLToMgDl(mmolL: number): number {
  return mmolL * 38.67;
}

/**
 * Validates that patient data contains all required fields for Framingham calculation
 */
export function validateFraminghamInputs(patientData: PatientData): string[] {
  const errors: string[] = [];
  
  if (!patientData.age || patientData.age < 30 || patientData.age > 79) {
    errors.push('Age must be between 30 and 79 years');
  }
  
  if (!patientData.gender || !['male', 'female'].includes(patientData.gender)) {
    errors.push('Gender must be specified as male or female');
  }
  
  if (!patientData.totalCholesterol || patientData.totalCholesterol <= 0) {
    errors.push('Total cholesterol must be provided and greater than 0');
  }
  
  if (!patientData.hdlCholesterol || patientData.hdlCholesterol <= 0) {
    errors.push('HDL cholesterol must be provided and greater than 0');
  }
  
  if (!patientData.systolicBP || patientData.systolicBP <= 0) {
    errors.push('Systolic blood pressure must be provided and greater than 0');
  }
  
  if (!patientData.diastolicBP || patientData.diastolicBP <= 0) {
    errors.push('Diastolic blood pressure must be provided and greater than 0');
  }
  
  if (patientData.systolicBP && patientData.diastolicBP && 
      patientData.systolicBP <= patientData.diastolicBP) {
    errors.push('Systolic blood pressure must be higher than diastolic blood pressure');
  }
  
  return errors;
}

/**
 * Creates a sample patient data object for testing
 */
export function createSamplePatientData(): PatientData {
  return {
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
}