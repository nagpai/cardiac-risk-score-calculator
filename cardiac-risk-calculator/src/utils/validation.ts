import type { PatientData, ValidationError } from '../types';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validates age input according to Framingham study range (30-79 years)
 * Handles edge cases like decimal values, negative numbers, and extreme values
 */
export const validateAge = (age: number): ValidationError | null => {
  // Handle null, undefined, or NaN values
  if (age === undefined || age === null || isNaN(age)) {
    return {
      field: 'age',
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value: age,
      code: 'REQUIRED_FIELD',
      severity: 'error',
    };
  }

  // Handle non-finite values (Infinity, -Infinity)
  if (!isFinite(age)) {
    return {
      field: 'age',
      message: 'Age must be a valid number',
      value: age,
      code: 'INVALID_NUMBER',
      severity: 'error',
    };
  }

  // Handle negative values
  if (age < 0) {
    return {
      field: 'age',
      message: 'Age cannot be negative',
      value: age,
      code: 'NEGATIVE_VALUE',
      severity: 'error',
    };
  }

  // Handle decimal values (warn but allow)
  if (age % 1 !== 0) {
    return {
      field: 'age',
      message: 'Age should be a whole number. Decimal values will be rounded.',
      value: age,
      code: 'DECIMAL_VALUE',
      severity: 'warning',
    };
  }

  // Handle extremely high values that are clearly errors
  if (age > 150) {
    return {
      field: 'age',
      message: 'Age seems unusually high. Please verify this value.',
      value: age,
      code: 'EXTREME_VALUE',
      severity: 'error',
    };
  }

  // Handle values outside Framingham range
  if (age < VALIDATION_RULES.age.min || age > VALIDATION_RULES.age.max) {
    const severity = (age >= 20 && age < 30) || (age > 79 && age <= 90) ? 'warning' : 'error';
    return {
      field: 'age',
      message: `Age must be between ${VALIDATION_RULES.age.min} and ${VALIDATION_RULES.age.max} years for accurate Framingham calculation`,
      value: age,
      code: 'BOUNDARY_VALUE',
      severity,
    };
  }

  return null;
};

/**
 * Validates cholesterol values with unit-aware validation and edge case handling
 */
export const validateCholesterol = (
  value: number,
  unit: 'mg/dL' | 'mmol/L',
  fieldName: 'totalCholesterol' | 'hdlCholesterol'
): ValidationError | null => {
  // Handle null, undefined, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return {
      field: fieldName,
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value,
      code: 'REQUIRED_FIELD',
      severity: 'error',
    };
  }

  // Handle non-finite values
  if (!isFinite(value)) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} must be a valid number`,
      value,
      code: 'INVALID_NUMBER',
      severity: 'error',
    };
  }

  // Handle negative values
  if (value < 0) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} cannot be negative`,
      value,
      code: 'NEGATIVE_VALUE',
      severity: 'error',
    };
  }

  // Handle zero values (medically unusual)
  if (value === 0) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} of zero is medically unusual. Please verify.`,
      value,
      code: 'UNUSUAL_VALUE',
      severity: 'warning',
    };
  }

  const rules = VALIDATION_RULES[fieldName];
  const min = rules.min[unit];
  const max = rules.max[unit];

  // Check for values that might indicate unit confusion
  if (unit === 'mg/dL' && value < 10) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} seems too low for mg/dL. Did you mean mmol/L?`,
      value,
      code: 'UNIT_CONFUSION',
      severity: 'warning',
    };
  }

  if (unit === 'mmol/L' && value > 20) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} seems too high for mmol/L. Did you mean mg/dL?`,
      value,
      code: 'UNIT_CONFUSION',
      severity: 'warning',
    };
  }

  // Handle extreme values that might be data entry errors
  const extremeMax = unit === 'mg/dL' ? max * 2 : max * 2;
  if (value > extremeMax) {
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} value seems extremely high. Please verify.`,
      value,
      code: 'EXTREME_VALUE',
      severity: 'error',
    };
  }

  // Standard range validation
  if (value < min || value > max) {
    const severity = (value >= min * 0.8 && value < min) || (value > max && value <= max * 1.2) ? 'warning' : 'error';
    return {
      field: fieldName,
      message: `${getFieldDisplayName(fieldName)} must be between ${min} and ${max} ${unit}`,
      value,
      code: 'BOUNDARY_VALUE',
      severity,
    };
  }

  return null;
};

/**
 * Validates blood pressure values with comprehensive edge case handling
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
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  } else {
    // Handle non-finite values
    if (!isFinite(systolic)) {
      errors.push({
        field: 'systolicBP',
        message: 'Systolic blood pressure must be a valid number',
        value: systolic,
        code: 'INVALID_NUMBER',
        severity: 'error',
      });
    }
    // Handle negative values
    else if (systolic < 0) {
      errors.push({
        field: 'systolicBP',
        message: 'Systolic blood pressure cannot be negative',
        value: systolic,
        code: 'NEGATIVE_VALUE',
        severity: 'error',
      });
    }
    // Handle extremely low values
    else if (systolic > 0 && systolic < 50) {
      errors.push({
        field: 'systolicBP',
        message: 'Systolic blood pressure seems dangerously low. Please verify.',
        value: systolic,
        code: 'EXTREME_VALUE',
        severity: 'error',
      });
    }
    // Handle extremely high values
    else if (systolic > 300) {
      errors.push({
        field: 'systolicBP',
        message: 'Systolic blood pressure seems extremely high. Please verify.',
        value: systolic,
        code: 'EXTREME_VALUE',
        severity: 'error',
      });
    }
    // Handle decimal values (unusual for BP)
    else if (systolic % 1 !== 0) {
      errors.push({
        field: 'systolicBP',
        message: 'Blood pressure is typically measured in whole numbers.',
        value: systolic,
        code: 'DECIMAL_VALUE',
        severity: 'warning',
      });
    }
    // Standard range validation
    else if (systolic < VALIDATION_RULES.systolicBP.min || systolic > VALIDATION_RULES.systolicBP.max) {
      const severity = (systolic >= 70 && systolic < 80) || (systolic > 200 && systolic <= 250) ? 'warning' : 'error';
      errors.push({
        field: 'systolicBP',
        message: `Systolic blood pressure must be between ${VALIDATION_RULES.systolicBP.min} and ${VALIDATION_RULES.systolicBP.max} mmHg for accurate calculation`,
        value: systolic,
        code: 'BOUNDARY_VALUE',
        severity,
      });
    }
  }

  // Validate diastolic BP
  if (diastolic === undefined || diastolic === null || isNaN(diastolic)) {
    errors.push({
      field: 'diastolicBP',
      message: ERROR_MESSAGES.REQUIRED_FIELD,
      value: diastolic,
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  } else {
    // Handle non-finite values
    if (!isFinite(diastolic)) {
      errors.push({
        field: 'diastolicBP',
        message: 'Diastolic blood pressure must be a valid number',
        value: diastolic,
        code: 'INVALID_NUMBER',
        severity: 'error',
      });
    }
    // Handle negative values
    else if (diastolic < 0) {
      errors.push({
        field: 'diastolicBP',
        message: 'Diastolic blood pressure cannot be negative',
        value: diastolic,
        code: 'NEGATIVE_VALUE',
        severity: 'error',
      });
    }
    // Handle extremely low values
    else if (diastolic > 0 && diastolic < 30) {
      errors.push({
        field: 'diastolicBP',
        message: 'Diastolic blood pressure seems dangerously low. Please verify.',
        value: diastolic,
        code: 'EXTREME_VALUE',
        severity: 'error',
      });
    }
    // Handle extremely high values
    else if (diastolic > 200) {
      errors.push({
        field: 'diastolicBP',
        message: 'Diastolic blood pressure seems extremely high. Please verify.',
        value: diastolic,
        code: 'EXTREME_VALUE',
        severity: 'error',
      });
    }
    // Handle decimal values
    else if (diastolic % 1 !== 0) {
      errors.push({
        field: 'diastolicBP',
        message: 'Blood pressure is typically measured in whole numbers.',
        value: diastolic,
        code: 'DECIMAL_VALUE',
        severity: 'warning',
      });
    }
    // Standard range validation
    else if (diastolic < VALIDATION_RULES.diastolicBP.min || diastolic > VALIDATION_RULES.diastolicBP.max) {
      const severity = (diastolic >= 30 && diastolic < 40) || (diastolic > 120 && diastolic <= 140) ? 'warning' : 'error';
      errors.push({
        field: 'diastolicBP',
        message: `Diastolic blood pressure must be between ${VALIDATION_RULES.diastolicBP.min} and ${VALIDATION_RULES.diastolicBP.max} mmHg for accurate calculation`,
        value: diastolic,
        code: 'BOUNDARY_VALUE',
        severity,
      });
    }
  }

  // Validate logical consistency between systolic and diastolic
  if (systolic && diastolic && isFinite(systolic) && isFinite(diastolic)) {
    if (diastolic >= systolic) {
      errors.push({
        field: 'diastolicBP',
        message: 'Diastolic blood pressure must be lower than systolic blood pressure',
        value: { systolic, diastolic },
        code: 'LOGICAL_INCONSISTENCY',
        severity: 'error',
      });
    }
    
    // Check for unusual pulse pressure (difference between systolic and diastolic)
    const pulsePressure = systolic - diastolic;
    if (pulsePressure < 20) {
      errors.push({
        field: 'systolicBP',
        message: 'The difference between systolic and diastolic pressure seems unusually small. Please verify both values.',
        value: { systolic, diastolic, pulsePressure },
        code: 'UNUSUAL_VALUE',
        severity: 'warning',
      });
    } else if (pulsePressure > 100) {
      errors.push({
        field: 'systolicBP',
        message: 'The difference between systolic and diastolic pressure seems unusually large. Please verify both values.',
        value: { systolic, diastolic, pulsePressure },
        code: 'UNUSUAL_VALUE',
        severity: 'warning',
      });
    }
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
 * Comprehensive validation for all patient data with cross-field validation
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

    // Cross-field cholesterol validation
    if (data.totalCholesterol && data.hdlCholesterol && 
        !isNaN(data.totalCholesterol) && !isNaN(data.hdlCholesterol)) {
      
      // HDL should be less than total cholesterol
      if (data.hdlCholesterol >= data.totalCholesterol) {
        errors.push({
          field: 'hdlCholesterol',
          message: 'HDL cholesterol cannot be higher than or equal to total cholesterol',
          value: { total: data.totalCholesterol, hdl: data.hdlCholesterol },
          code: 'LOGICAL_INCONSISTENCY',
          severity: 'error',
        });
      }

      // Check for unusual HDL/Total ratio
      const hdlRatio = data.hdlCholesterol / data.totalCholesterol;
      if (hdlRatio < 0.1) {
        errors.push({
          field: 'hdlCholesterol',
          message: 'HDL cholesterol seems unusually low compared to total cholesterol. Please verify both values.',
          value: { total: data.totalCholesterol, hdl: data.hdlCholesterol, ratio: hdlRatio },
          code: 'UNUSUAL_VALUE',
          severity: 'warning',
        });
      } else if (hdlRatio > 0.6) {
        errors.push({
          field: 'hdlCholesterol',
          message: 'HDL cholesterol seems unusually high compared to total cholesterol. Please verify both values.',
          value: { total: data.totalCholesterol, hdl: data.hdlCholesterol, ratio: hdlRatio },
          code: 'UNUSUAL_VALUE',
          severity: 'warning',
        });
      }
    }
  }

  // Validate blood pressure
  const bpErrors = validateBloodPressure(
    data.systolicBP as number,
    data.diastolicBP as number
  );
  errors.push(...bpErrors);

  // Validate glucose (optional)
  if (data.glucoseUnit && data.bloodGlucose !== undefined) {
    const glucoseError = validateGlucose(data.bloodGlucose, data.glucoseUnit);
    if (glucoseError) errors.push(glucoseError);
  }

  // Validate smoking status
  const smokingError = validateSmokingStatus(data.smokingStatus as string);
  if (smokingError) errors.push(smokingError);

  // Cross-field medical consistency checks
  if (data.age && data.hasDiabetes && data.bloodGlucose && data.glucoseUnit) {
    // Check if glucose levels are consistent with diabetes status
    const glucoseInMgDl = data.glucoseUnit === 'mmol/L' ? data.bloodGlucose * 18 : data.bloodGlucose;
    
    if (data.hasDiabetes && glucoseInMgDl < 100) {
      errors.push({
        field: 'bloodGlucose',
        message: 'Blood glucose seems low for someone with diabetes. Please verify diabetes status and glucose value.',
        value: { glucose: data.bloodGlucose, unit: data.glucoseUnit, hasDiabetes: data.hasDiabetes },
        code: 'MEDICAL_INCONSISTENCY',
        severity: 'warning',
      });
    } else if (!data.hasDiabetes && glucoseInMgDl > 200) {
      errors.push({
        field: 'hasDiabetes',
        message: 'High blood glucose may indicate diabetes. Please verify diabetes status.',
        value: { glucose: data.bloodGlucose, unit: data.glucoseUnit, hasDiabetes: data.hasDiabetes },
        code: 'MEDICAL_INCONSISTENCY',
        severity: 'warning',
      });
    }
  }

  // Age-related consistency checks
  if (data.age && data.familyHistory && data.age < 35) {
    errors.push({
      field: 'familyHistory',
      message: 'Family history of heart disease in someone under 35 may indicate genetic factors. Consider genetic counseling.',
      value: { age: data.age, familyHistory: data.familyHistory },
      code: 'MEDICAL_ADVISORY',
      severity: 'info',
    });
  }

  // Gender-specific validation
  if (data.gender && data.hdlCholesterol && data.cholesterolUnit === 'mg/dL') {
    if (data.gender === 'male' && data.hdlCholesterol > 80) {
      errors.push({
        field: 'hdlCholesterol',
        message: 'HDL cholesterol seems unusually high for males. Please verify.',
        value: { gender: data.gender, hdl: data.hdlCholesterol },
        code: 'GENDER_UNUSUAL',
        severity: 'warning',
      });
    } else if (data.gender === 'female' && data.hdlCholesterol < 30) {
      errors.push({
        field: 'hdlCholesterol',
        message: 'HDL cholesterol seems unusually low for females. Please verify.',
        value: { gender: data.gender, hdl: data.hdlCholesterol },
        code: 'GENDER_UNUSUAL',
        severity: 'warning',
      });
    }
  }

  return errors;
};

/**
 * Validates a single field based on field name and value
 */
export const validateField = (
  fieldName: string,
  value: unknown,
  additionalData?: Partial<PatientData>
): ValidationError | null => {
  switch (fieldName) {
    case 'age':
      return validateAge(value as number);
    
    case 'gender':
      return validateGender(value as string);
    
    case 'totalCholesterol':
      return additionalData?.cholesterolUnit 
        ? validateCholesterol(value as number, additionalData.cholesterolUnit, 'totalCholesterol')
        : { field: fieldName, message: 'Cholesterol unit is required', value };
    
    case 'hdlCholesterol':
      return additionalData?.cholesterolUnit 
        ? validateCholesterol(value as number, additionalData.cholesterolUnit, 'hdlCholesterol')
        : { field: fieldName, message: 'Cholesterol unit is required', value };
    
    case 'systolicBP':
      return validateBloodPressure(value as number, additionalData?.diastolicBP as number)[0] || null;
    
    case 'diastolicBP': {
      const bpErrors = validateBloodPressure(additionalData?.systolicBP as number, value as number);
      return bpErrors.find(error => error.field === 'diastolicBP') || null;
    }
    
    case 'bloodGlucose':
      return additionalData?.glucoseUnit 
        ? validateGlucose(value as number | undefined, additionalData.glucoseUnit)
        : null;
    
    case 'smokingStatus':
      return validateSmokingStatus(value as string);
    
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