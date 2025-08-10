// Core data interfaces for the Cardiac Risk Calculator

export interface PatientData {
  // Demographics
  age: number;                    // 30-79 years
  gender: 'male' | 'female';
  
  // Cholesterol (with unit support)
  totalCholesterol: number;       // Value in current unit
  hdlCholesterol: number;         // Value in current unit
  ldlCholesterol?: number;        // Optional, calculated if not provided
  cholesterolUnit: 'mg/dL' | 'mmol/L';
  
  // Blood Pressure (mmHg only)
  systolicBP: number;            // 80-200 mmHg
  diastolicBP: number;           // 40-120 mmHg
  onBPMedication: boolean;
  
  // Blood Glucose (with unit support)
  bloodGlucose?: number;         // Optional parameter
  glucoseUnit: 'mg/dL' | 'mmol/L';
  
  // Risk Factors
  smokingStatus: 'never' | 'former' | 'current';
  hasDiabetes: boolean;
  familyHistory: boolean;
}

export interface RiskResult {
  // Core Results
  tenYearRisk: number;           // Percentage (0-100)
  riskCategory: 'low' | 'moderate' | 'high';
  
  // Detailed Analysis
  riskFactors: {
    age: number;
    gender: number;
    cholesterol: number;
    bloodPressure: number;
    smoking: number;
    diabetes: number;
    familyHistory: number;
  };
  
  // Comparison Data
  comparisonData: {
    averageForAge: number;
    averageForGender: number;
    idealRisk: number;
  };
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  calculatedAt: Date;
  framinghamVersion: string;
}

export interface Recommendation {
  category: 'lifestyle' | 'medical' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  resources?: ExternalResource[];
}

export interface ExternalResource {
  title: string;
  url: string;
  description: string;
}

export interface UnitConverter {
  // Cholesterol conversions
  cholesterolMgDlToMmolL(value: number): number;
  cholesterolMmolLToMgDl(value: number): number;
  
  // Glucose conversions
  glucoseMgDlToMmolL(value: number): number;
  glucoseMmolLToMgDl(value: number): number;
  
  // Validation
  isValidCholesterolRange(value: number, unit: string): boolean;
  isValidGlucoseRange(value: number, unit: string): boolean;
}

export interface FraminghamCoefficients {
  male: {
    age: number;
    totalCholesterol: number;
    hdlCholesterol: number;
    systolicBP: number;
    systolicBPTreated: number;
    smoking: number;
    diabetes: number;
  };
  female: {
    age: number;
    totalCholesterol: number;
    hdlCholesterol: number;
    systolicBP: number;
    systolicBPTreated: number;
    smoking: number;
    diabetes: number;
  };
}

export interface ValidationRules {
  age: { min: number; max: number; required: boolean };
  totalCholesterol: { 
    min: { 'mg/dL': number; 'mmol/L': number }; 
    max: { 'mg/dL': number; 'mmol/L': number }; 
    required: boolean;
  };
  hdlCholesterol: { 
    min: { 'mg/dL': number; 'mmol/L': number }; 
    max: { 'mg/dL': number; 'mmol/L': number }; 
    required: boolean;
  };
  systolicBP: { min: number; max: number; required: boolean };
  diastolicBP: { min: number; max: number; required: boolean };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export type RiskCategory = 'low' | 'moderate' | 'high';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  tooltip?: string;
  unit?: string;
  error?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Storage interfaces
export interface PatientProfile {
  id: string;
  name: string;
  patientData: PatientData;
  riskResult?: RiskResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageError extends Error {
  code: 'QUOTA_EXCEEDED' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED' | 'STORAGE_UNAVAILABLE' | 'INVALID_DATA';
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}