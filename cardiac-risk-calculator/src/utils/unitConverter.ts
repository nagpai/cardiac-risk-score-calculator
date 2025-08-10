import type { UnitConverter } from '../types';
import { CONVERSION_FACTORS, VALIDATION_RULES } from './constants';

/**
 * Unit Converter Class
 * Handles conversion between mg/dL and mmol/L for cholesterol and glucose measurements
 * Includes validation for medical ranges
 */
export class UnitConverterImpl implements UnitConverter {
  /**
   * Converts cholesterol from mg/dL to mmol/L
   * @param value - Cholesterol value in mg/dL
   * @returns Cholesterol value in mmol/L
   */
  cholesterolMgDlToMmolL(value: number): number {
    if (!this.isValidNumber(value)) {
      throw new Error('Invalid cholesterol value: must be a valid number');
    }
    
    const result = value * CONVERSION_FACTORS.CHOLESTEROL_MG_DL_TO_MMOL_L;
    return Math.round(result * 100) / 100;
  }

  /**
   * Converts cholesterol from mmol/L to mg/dL
   * @param value - Cholesterol value in mmol/L
   * @returns Cholesterol value in mg/dL
   */
  cholesterolMmolLToMgDl(value: number): number {
    if (!this.isValidNumber(value)) {
      throw new Error('Invalid cholesterol value: must be a valid number');
    }
    
    return Math.round(value * CONVERSION_FACTORS.CHOLESTEROL_MMOL_L_TO_MG_DL);
  }

  /**
   * Converts glucose from mg/dL to mmol/L
   * @param value - Glucose value in mg/dL
   * @returns Glucose value in mmol/L
   */
  glucoseMgDlToMmolL(value: number): number {
    if (!this.isValidNumber(value)) {
      throw new Error('Invalid glucose value: must be a valid number');
    }
    
    const result = value * CONVERSION_FACTORS.GLUCOSE_MG_DL_TO_MMOL_L;
    return Math.round(result * 10) / 10;
  }

  /**
   * Converts glucose from mmol/L to mg/dL
   * @param value - Glucose value in mmol/L
   * @returns Glucose value in mg/dL
   */
  glucoseMmolLToMgDl(value: number): number {
    if (!this.isValidNumber(value)) {
      throw new Error('Invalid glucose value: must be a valid number');
    }
    
    return Math.round(value * CONVERSION_FACTORS.GLUCOSE_MMOL_L_TO_MG_DL);
  }

  /**
   * Validates if a cholesterol value is within acceptable medical ranges
   * @param value - Cholesterol value
   * @param unit - Unit of measurement ('mg/dL' or 'mmol/L')
   * @returns True if value is within valid range
   */
  isValidCholesterolRange(value: number, unit: string): boolean {
    if (!this.isValidNumber(value) || !this.isValidUnit(unit, ['mg/dL', 'mmol/L'])) {
      return false;
    }

    // Check against total cholesterol ranges (most permissive)
    const rules = VALIDATION_RULES.totalCholesterol;
    const min = rules.min[unit as 'mg/dL' | 'mmol/L'];
    const max = rules.max[unit as 'mg/dL' | 'mmol/L'];

    return value >= min && value <= max;
  }

  /**
   * Validates if a glucose value is within acceptable medical ranges
   * @param value - Glucose value
   * @param unit - Unit of measurement ('mg/dL' or 'mmol/L')
   * @returns True if value is within valid range
   */
  isValidGlucoseRange(value: number, unit: string): boolean {
    if (!this.isValidNumber(value) || !this.isValidUnit(unit, ['mg/dL', 'mmol/L'])) {
      return false;
    }

    // Define glucose ranges (fasting glucose ranges)
    const glucoseRanges = {
      'mg/dL': { min: 70, max: 400 },   // Covers normal to severe diabetes
      'mmol/L': { min: 3.9, max: 22.2 }, // Equivalent ranges in mmol/L
    };

    const range = glucoseRanges[unit as 'mg/dL' | 'mmol/L'];
    return value >= range.min && value <= range.max;
  }

  /**
   * Validates if a number is valid (not NaN, not infinite)
   */
  private isValidNumber(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Validates if a unit is in the allowed list
   */
  private isValidUnit(unit: string, allowedUnits: string[]): boolean {
    return typeof unit === 'string' && allowedUnits.includes(unit);
  }
}

// Create a singleton instance for easy use
export const unitConverter = new UnitConverterImpl();

/**
 * Utility functions for direct use without class instantiation
 */

/**
 * Converts cholesterol from mg/dL to mmol/L
 */
export function convertCholesterolMgDlToMmolL(value: number): number {
  return unitConverter.cholesterolMgDlToMmolL(value);
}

/**
 * Converts cholesterol from mmol/L to mg/dL
 */
export function convertCholesterolMmolLToMgDl(value: number): number {
  return unitConverter.cholesterolMmolLToMgDl(value);
}

/**
 * Converts glucose from mg/dL to mmol/L
 */
export function convertGlucoseMgDlToMmolL(value: number): number {
  return unitConverter.glucoseMgDlToMmolL(value);
}

/**
 * Converts glucose from mmol/L to mg/dL
 */
export function convertGlucoseMmolLToMgDl(value: number): number {
  return unitConverter.glucoseMmolLToMgDl(value);
}

/**
 * Validates cholesterol range for given unit
 */
export function isValidCholesterolRange(value: number, unit: 'mg/dL' | 'mmol/L'): boolean {
  return unitConverter.isValidCholesterolRange(value, unit);
}

/**
 * Validates glucose range for given unit
 */
export function isValidGlucoseRange(value: number, unit: 'mg/dL' | 'mmol/L'): boolean {
  return unitConverter.isValidGlucoseRange(value, unit);
}

/**
 * Converts any cholesterol value to mg/dL (standard unit for calculations)
 */
export function convertCholesterolToMgDl(value: number, fromUnit: 'mg/dL' | 'mmol/L'): number {
  if (fromUnit === 'mg/dL') {
    return value;
  }
  return convertCholesterolMmolLToMgDl(value);
}

/**
 * Converts any glucose value to mg/dL (standard unit for calculations)
 */
export function convertGlucoseToMgDl(value: number, fromUnit: 'mg/dL' | 'mmol/L'): number {
  if (fromUnit === 'mg/dL') {
    return value;
  }
  return convertGlucoseMmolLToMgDl(value);
}

/**
 * Converts cholesterol from mg/dL to the specified target unit
 */
export function convertCholesterolFromMgDl(value: number, toUnit: 'mg/dL' | 'mmol/L'): number {
  if (toUnit === 'mg/dL') {
    return value;
  }
  return convertCholesterolMgDlToMmolL(value);
}

/**
 * Converts glucose from mg/dL to the specified target unit
 */
export function convertGlucoseFromMgDl(value: number, toUnit: 'mg/dL' | 'mmol/L'): number {
  if (toUnit === 'mg/dL') {
    return value;
  }
  return convertGlucoseMgDlToMmolL(value);
}

/**
 * Gets the appropriate decimal places for display based on unit
 */
export function getDecimalPlaces(unit: 'mg/dL' | 'mmol/L', type: 'cholesterol' | 'glucose'): number {
  if (unit === 'mg/dL') {
    return 0; // Whole numbers for mg/dL
  }
  
  // mmol/L typically uses 1-2 decimal places
  return type === 'cholesterol' ? 2 : 1;
}

/**
 * Formats a value for display with appropriate decimal places
 */
export function formatValueForDisplay(
  value: number, 
  unit: 'mg/dL' | 'mmol/L', 
  type: 'cholesterol' | 'glucose'
): string {
  const decimalPlaces = getDecimalPlaces(unit, type);
  return value.toFixed(decimalPlaces);
}

/**
 * Conversion reference data for UI display
 */
export const CONVERSION_REFERENCE = {
  cholesterol: {
    examples: [
      { mgDl: 200, mmolL: 5.17 },
      { mgDl: 240, mmolL: 6.21 },
      { mgDl: 300, mmolL: 7.76 },
    ],
    note: 'Total cholesterol: mg/dL × 0.02586 = mmol/L',
  },
  glucose: {
    examples: [
      { mgDl: 100, mmolL: 5.6 },
      { mgDl: 126, mmolL: 7.0 },
      { mgDl: 200, mmolL: 11.1 },
    ],
    note: 'Glucose: mg/dL × 0.05551 = mmol/L',
  },
};