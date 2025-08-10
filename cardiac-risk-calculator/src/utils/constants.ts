import type { ValidationRules, FraminghamCoefficients } from '../types';

// Medical validation ranges
export const VALIDATION_RULES: ValidationRules = {
  age: { min: 30, max: 79, required: true },
  totalCholesterol: { 
    min: { 'mg/dL': 100, 'mmol/L': 2.6 }, 
    max: { 'mg/dL': 400, 'mmol/L': 10.3 }, 
    required: true 
  },
  hdlCholesterol: { 
    min: { 'mg/dL': 20, 'mmol/L': 0.5 }, 
    max: { 'mg/dL': 100, 'mmol/L': 2.6 }, 
    required: true 
  },
  systolicBP: { min: 80, max: 200, required: true },
  diastolicBP: { min: 40, max: 120, required: true },
};

// Framingham Risk Score coefficients
export const FRAMINGHAM_COEFFICIENTS: FraminghamCoefficients = {
  male: {
    age: 3.06117,
    totalCholesterol: 1.12370,
    hdlCholesterol: -0.93263,
    systolicBP: 1.93303,
    systolicBPTreated: 1.99881,
    smoking: 0.65451,
    diabetes: 0.57367,
  },
  female: {
    age: 2.32888,
    totalCholesterol: 1.20904,
    hdlCholesterol: -0.70833,
    systolicBP: 2.76157,
    systolicBPTreated: 2.82263,
    smoking: 0.52873,
    diabetes: 0.69154,
  },
};

// Unit conversion factors
export const CONVERSION_FACTORS = {
  CHOLESTEROL_MG_DL_TO_MMOL_L: 0.02586,
  CHOLESTEROL_MMOL_L_TO_MG_DL: 38.67,
  GLUCOSE_MG_DL_TO_MMOL_L: 0.05551,
  GLUCOSE_MMOL_L_TO_MG_DL: 18.018,
};

// Risk categorization thresholds
export const RISK_THRESHOLDS = {
  LOW: 10,      // <10%
  MODERATE: 20, // 10-20%
  // HIGH: >=20%
};

// Application constants
export const APP_CONFIG = {
  FRAMINGHAM_VERSION: '2008',
  CALCULATION_TIMEOUT_MS: 100,
  MAX_DECIMAL_PLACES: 1,
};

// Form field options
export const FORM_OPTIONS = {
  GENDER: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ],
  SMOKING_STATUS: [
    { value: 'never', label: 'Never smoked' },
    { value: 'former', label: 'Former smoker' },
    { value: 'current', label: 'Current smoker' },
  ],
  CHOLESTEROL_UNITS: [
    { value: 'mg/dL', label: 'mg/dL' },
    { value: 'mmol/L', label: 'mmol/L' },
  ],
  GLUCOSE_UNITS: [
    { value: 'mg/dL', label: 'mg/dL' },
    { value: 'mmol/L', label: 'mmol/L' },
  ],
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_AGE: 'Age must be between 30 and 79 years',
  INVALID_CHOLESTEROL: 'Please enter a valid cholesterol value',
  INVALID_BLOOD_PRESSURE: 'Please enter a valid blood pressure value',
  CALCULATION_ERROR: 'Unable to calculate risk. Please check your inputs.',
  VALIDATION_ERROR: 'Please correct the errors below',
};

// Medical disclaimers
export const MEDICAL_DISCLAIMERS = {
  PRIMARY: 'This calculator is for educational purposes only and should not replace professional medical advice.',
  SECONDARY: 'Always consult with a healthcare provider for medical decisions.',
  FRAMINGHAM_REFERENCE: 'Based on the Framingham Heart Study risk assessment model.',
};