import type { PatientData, ValidationError } from '../types';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validates age input according to Framingham study range (30-79 years)
 */
export const validateAge = (age: number): ValidationError | null => {
  if (age === undefined || age === null || isNaN(age)) {
    return {
      field: 'age',
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value: age,
    };
  }

  if (age < VALIDATION_RULES.age.min || age > VALIDATION_RULES.age.max) {
    return {
      field: 'age',
      message: `Age must be between ${VALIDATION_RULES.age.min} and ${VALIDATION_RULES.age.max} years`,
      value: age,
    };
  }

  return null;
};

/**
 * Validates cholesterol values with unit-aware validation
 */
export const validateCholesterol = (
  value: number,
  unit: 'mg/dL' | 'mmol/L',
  fieldName: 'totalCholesterol' | 'hdlCholesterol'
): ValidationError | null => {
  if (value === undefined || value === null || isNaN(value)) {
    return {
      field: fieldName,
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value,
    };
  }

  const rules = VALIDATION_RULES[fieldName];
  const min = rules.min[unit];
  const max = rules.max[unit];

  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} must be between ${min} and ${max} ${unit}`,
      value,
    };
  }

  return null;
};

/**
 * Validates blood pressure values
 */
export const validateBloodPressure = (
  systolic: number,
  diastolic: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate systolic BP
  if (systolic === undefined || systolic === null || isNaN(systolic)) {
    errors.push({
      field: 'systolicBP',
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value: systolic,
    });
  } else if (systolic < VALIDATION_RULES.systolicBP.min || systolic > VALIDATION_RULES.systolicBP.max) {
    errors.push({
      field: 'systolicBP',
      message: `Systolic blood pressure must be between ${VALIDATION_RULES.systolicBP.min} and ${VALIDATION_RULES.systolicBP.max} mmHg`,
      value: systolic,
    });
  }

  // Validate diastolic BP
  if (diastolic === undefined || diastolic === null || isNaN(diastolic)) {
    errors.push({
      field: 'diastolicBP',
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value: diastolic,
    });
  } else if (diastolic < VALIDATION_RULES.diastolicBP.min || diastolic > VALIDATION_RULES.diastolicBP.max) {
    errors.push({
      field: 'diastolicBP',
      message: `Diastolic blood pressure must be between ${VALIDATION_RULES.diastolicBP.min} and ${VALIDATION_RULES.diastolicBP.max} mmHg`,
      value: diastolic,
    });
  }

  // Validate logical consistency (diastolic should be less than systolic)
  if (!isNaN(systolic) && !isNaN(diastolic) && diastolic >= systolic) {
    errors.push({
      field: 'diastolicBP',
      message: 'Diastolic blood pressure must be lower than systolic blood pressure',
      value: diastolic,
    });
  }

  return errors;
};

/**
 * Validates glucose values with unit-aware validation (optional field)
 */
export const validateGlucose = (
  value: number | undefined,
  unit: 'mg/dL' | 'mmol/L'
): ValidationError | null => {
  // Glucose is optional, so undefined/null is valid
  if (value === undefined || value === null) {
    return null;
  }

  if (isNaN(value)) {
    return {
      field: 'bloodGlucose',
      message: 'Please enter a valid glucose value',
      value,
    };
  }

  // Define glucose validation ranges
  const glucoseRanges = {
    'mg/dL': { min: 50, max: 400 },
    'mmol/L': { min: 2.8, max: 22.2 },
  };

  const { min, max } = glucoseRanges[unit];

  if (value < min || value > max) {
    return {
      field: 'bloodGlucose',
      message: `Blood glucose must be between ${min} and ${max} ${unit}`,
      value,
    };
  }

  return null;
};

/**
 * Validates required string fields
 */
export const validateRequiredField = (
  value: string | undefined | null,
  fieldName: string
): ValidationError | null => {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value,
    };
  }
  return null;
};

/**
 * Validates gender selection
 */
export const validateGender = (gender: string): ValidationError | null => {
  if (!gender || (gender !== 'male' && gender !== 'female')) {
    return {
      field: 'gender',
      message: 'Please select a gender',
      value: gender,
    };
  }
  return null;
};

/**
 * Validates smoking status
 */
export const validateSmokingStatus = (status: string): ValidationError | null => {
  const validStatuses = ['never', 'former', 'current'];
  if (!status || !validStatuses.includes(status)) {
    return {
      field: 'smokingStatus',
      message: 'Please select a smoking status',
      value: status,
    };
  }
  return null;
};

/**
 * Comprehensive validation for all patient data
 */
export const validatePatientData = (data: Partial<PatientData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate age
  const ageError = validateAge(data.age as number);
  if (ageError) errors.push(ageError);

  // Validate gender
  const genderError = validateGender(data.gender as string);
  if (genderError) errors.push(genderError);

  // Validate cholesterol values
  if (data.cholesterolUnit) {
    const totalCholError = validateCholesterol(
      data.totalCholesterol as number,
      data.cholesterolUnit,
      'totalCholesterol'
    );
    if (totalCholError) errors.push(totalCholError);

    const hdlCholError = validateCholesterol(
      data.hdlCholesterol as number,
      data.cholesterolUnit,
      'hdlCholesterol'
    );
    if (hdlCholError) errors.push(hdlCholError);
  }

  // Validate blood pressure
  const bpErrors = validateBloodPressure(
    data.systolicBP as number,
    data.diastolicBP as number
  );
  errors.push(...bpErrors);

  // Validate glucose (optional)
  if (data.glucoseUnit) {
    const glucoseError = validateGlucose(data.bloodGlucose, data.glucoseUnit);
    if (glucoseError) errors.push(glucoseError);
  }

  // Validate smoking status
  const smokingError = validateSmokingStatus(data.smokingStatus as string);
  if (smokingError) errors.push(smokingError);

  return errors;
};

/**
 * Validates a single field based on field name and value
 */
export const validateField = (
  fieldName: string,
  value: any,
  additionalData?: Partial<PatientData>
): ValidationError | null => {
  switch (fieldName) {
    case 'age':
      return validateAge(value);
    
    case 'gender':
      return validateGender(value);
    
    case 'totalCholesterol':
      return additionalData?.cholesterolUnit 
        ? validateCholesterol(value, additionalData.cholesterolUnit, 'totalCholesterol')
        : { field: fieldName, message: 'Cholesterol unit is required', value };
    
    case 'hdlCholesterol':
      return additionalData?.cholesterolUnit 
        ? validateCholesterol(value, additionalData.cholesterolUnit, 'hdlCholesterol')
        : { field: fieldName, message: 'Cholesterol unit is required', value };
    
    case 'systolicBP':
      return validateBloodPressure(value, additionalData?.diastolicBP as number)[0] || null;
    
    case 'diastolicBP':
      const bpErrors = validateBloodPressure(additionalData?.systolicBP as number, value);
      return bpErrors.find(error => error.field === 'diastolicBP') || null;
    
    case 'bloodGlucose':
      return additionalData?.glucoseUnit 
        ? validateGlucose(value, additionalData.glucoseUnit)
        : null;
    
    case 'smokingStatus':
      return validateSmokingStatus(value);
    
    default:
      return null;
  }
};

/**
 * Checks if patient data is complete and valid for calculation
 */
export const isPatientDataComplete = (data: Partial<PatientData>): boolean => {
  const errors = validatePatientData(data);
  return errors.length === 0;
};

/**
 * Gets user-friendly field display names
 */
export const getFieldDisplayName = (fieldName: string): string => {
  const displayNames: Record<string, string> = {
    age: 'Age',
    gender: 'Gender',
    totalCholesterol: 'Total Cholesterol',
    hdlCholesterol: 'HDL Cholesterol',
    ldlCholesterol: 'LDL Cholesterol',
    systolicBP: 'Systolic Blood Pressure',
    diastolicBP: 'Diastolic Blood Pressure',
    bloodGlucose: 'Blood Glucose',
    smokingStatus: 'Smoking Status',
    hasDiabetes: 'Diabetes Status',
    familyHistory: 'Family History',
    onBPMedication: 'Blood Pressure Medication',
  };
  
  return displayNames[fieldName] || fieldName;
};

/**
 * Formats validation error messages for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string[] => {
  return errors.map(error => error.message);
};

/**
 * Groups validation errors by field
 */
export const groupErrorsByField = (errors: ValidationError[]): Record<string, ValidationError[]> => {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
};