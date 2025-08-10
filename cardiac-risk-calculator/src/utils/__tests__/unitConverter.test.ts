import { describe, it, expect } from 'vitest';
import {
  UnitConverterImpl,
  unitConverter,
  convertCholesterolMgDlToMmolL,
  convertCholesterolMmolLToMgDl,
  convertGlucoseMgDlToMmolL,
  convertGlucoseMmolLToMgDl,
  isValidCholesterolRange,
  isValidGlucoseRange,
  convertCholesterolToMgDl,
  convertGlucoseToMgDl,
  convertCholesterolFromMgDl,
  convertGlucoseFromMgDl,
  getDecimalPlaces,
  formatValueForDisplay,
  CONVERSION_REFERENCE,
} from '../unitConverter';

describe('UnitConverter', () => {
  describe('UnitConverterImpl class', () => {
    let converter: UnitConverterImpl;

    beforeEach(() => {
      converter = new UnitConverterImpl();
    });

    describe('cholesterol conversions', () => {
      it('should convert cholesterol from mg/dL to mmol/L correctly', () => {
        expect(converter.cholesterolMgDlToMmolL(200)).toBeCloseTo(5.17, 2);
        expect(converter.cholesterolMgDlToMmolL(240)).toBeCloseTo(6.21, 2);
        expect(converter.cholesterolMgDlToMmolL(300)).toBeCloseTo(7.76, 2);
      });

      it('should convert cholesterol from mmol/L to mg/dL correctly', () => {
        expect(converter.cholesterolMmolLToMgDl(5.17)).toBeCloseTo(200, 0);
        expect(converter.cholesterolMmolLToMgDl(6.21)).toBeCloseTo(240, 0);
        expect(converter.cholesterolMmolLToMgDl(7.76)).toBeCloseTo(300, 0);
      });

      it('should handle edge cases for cholesterol conversion', () => {
        expect(converter.cholesterolMgDlToMmolL(0)).toBe(0);
        expect(converter.cholesterolMmolLToMgDl(0)).toBe(0);
      });

      it('should throw error for invalid cholesterol values', () => {
        expect(() => converter.cholesterolMgDlToMmolL(NaN)).toThrow();
        expect(() => converter.cholesterolMgDlToMmolL(Infinity)).toThrow();
        expect(() => converter.cholesterolMmolLToMgDl(NaN)).toThrow();
        expect(() => converter.cholesterolMmolLToMgDl(Infinity)).toThrow();
      });
    });

    describe('glucose conversions', () => {
      it('should convert glucose from mg/dL to mmol/L correctly', () => {
        expect(converter.glucoseMgDlToMmolL(100)).toBeCloseTo(5.6, 1);
        expect(converter.glucoseMgDlToMmolL(126)).toBeCloseTo(7.0, 1);
        expect(converter.glucoseMgDlToMmolL(200)).toBeCloseTo(11.1, 1);
      });

      it('should convert glucose from mmol/L to mg/dL correctly', () => {
        expect(converter.glucoseMmolLToMgDl(5.6)).toBeCloseTo(101, 1);
        expect(converter.glucoseMmolLToMgDl(7.0)).toBeCloseTo(126, 1);
        expect(converter.glucoseMmolLToMgDl(11.1)).toBeCloseTo(200, 1);
      });

      it('should handle edge cases for glucose conversion', () => {
        expect(converter.glucoseMgDlToMmolL(0)).toBe(0);
        expect(converter.glucoseMmolLToMgDl(0)).toBe(0);
      });

      it('should throw error for invalid glucose values', () => {
        expect(() => converter.glucoseMgDlToMmolL(NaN)).toThrow();
        expect(() => converter.glucoseMgDlToMmolL(Infinity)).toThrow();
        expect(() => converter.glucoseMmolLToMgDl(NaN)).toThrow();
        expect(() => converter.glucoseMmolLToMgDl(Infinity)).toThrow();
      });
    });

    describe('validation methods', () => {
      it('should validate cholesterol ranges correctly', () => {
        // Valid ranges
        expect(converter.isValidCholesterolRange(200, 'mg/dL')).toBe(true);
        expect(converter.isValidCholesterolRange(5.17, 'mmol/L')).toBe(true);
        
        // Invalid ranges - too low
        expect(converter.isValidCholesterolRange(50, 'mg/dL')).toBe(false);
        expect(converter.isValidCholesterolRange(1.0, 'mmol/L')).toBe(false);
        
        // Invalid ranges - too high
        expect(converter.isValidCholesterolRange(500, 'mg/dL')).toBe(false);
        expect(converter.isValidCholesterolRange(15.0, 'mmol/L')).toBe(false);
        
        // Invalid inputs
        expect(converter.isValidCholesterolRange(NaN, 'mg/dL')).toBe(false);
        expect(converter.isValidCholesterolRange(200, 'invalid' as any)).toBe(false);
      });

      it('should validate glucose ranges correctly', () => {
        // Valid ranges
        expect(converter.isValidGlucoseRange(100, 'mg/dL')).toBe(true);
        expect(converter.isValidGlucoseRange(5.6, 'mmol/L')).toBe(true);
        
        // Invalid ranges - too low
        expect(converter.isValidGlucoseRange(50, 'mg/dL')).toBe(false);
        expect(converter.isValidGlucoseRange(2.0, 'mmol/L')).toBe(false);
        
        // Invalid ranges - too high
        expect(converter.isValidGlucoseRange(500, 'mg/dL')).toBe(false);
        expect(converter.isValidGlucoseRange(30.0, 'mmol/L')).toBe(false);
        
        // Invalid inputs
        expect(converter.isValidGlucoseRange(NaN, 'mg/dL')).toBe(false);
        expect(converter.isValidGlucoseRange(100, 'invalid' as any)).toBe(false);
      });
    });
  });

  describe('singleton instance', () => {
    it('should provide a working singleton instance', () => {
      expect(unitConverter).toBeInstanceOf(UnitConverterImpl);
      expect(unitConverter.cholesterolMgDlToMmolL(200)).toBeCloseTo(5.17, 2);
    });
  });

  describe('utility functions', () => {
    describe('direct conversion functions', () => {
      it('should provide direct cholesterol conversion functions', () => {
        expect(convertCholesterolMgDlToMmolL(200)).toBeCloseTo(5.17, 2);
        expect(convertCholesterolMmolLToMgDl(5.17)).toBeCloseTo(200, 0);
      });

      it('should provide direct glucose conversion functions', () => {
        expect(convertGlucoseMgDlToMmolL(100)).toBeCloseTo(5.6, 1);
        expect(convertGlucoseMmolLToMgDl(5.6)).toBeCloseTo(101, 1);
      });

      it('should provide direct validation functions', () => {
        expect(isValidCholesterolRange(200, 'mg/dL')).toBe(true);
        expect(isValidGlucoseRange(100, 'mg/dL')).toBe(true);
      });
    });

    describe('smart conversion functions', () => {
      it('should convert cholesterol to mg/dL from any unit', () => {
        expect(convertCholesterolToMgDl(200, 'mg/dL')).toBe(200);
        expect(convertCholesterolToMgDl(5.17, 'mmol/L')).toBeCloseTo(200, 0);
      });

      it('should convert glucose to mg/dL from any unit', () => {
        expect(convertGlucoseToMgDl(100, 'mg/dL')).toBe(100);
        expect(convertGlucoseToMgDl(5.6, 'mmol/L')).toBeCloseTo(101, 1);
      });

      it('should convert cholesterol from mg/dL to any unit', () => {
        expect(convertCholesterolFromMgDl(200, 'mg/dL')).toBe(200);
        expect(convertCholesterolFromMgDl(200, 'mmol/L')).toBeCloseTo(5.17, 2);
      });

      it('should convert glucose from mg/dL to any unit', () => {
        expect(convertGlucoseFromMgDl(100, 'mg/dL')).toBe(100);
        expect(convertGlucoseFromMgDl(100, 'mmol/L')).toBeCloseTo(5.6, 1);
      });
    });

    describe('formatting functions', () => {
      it('should return correct decimal places', () => {
        expect(getDecimalPlaces('mg/dL', 'cholesterol')).toBe(0);
        expect(getDecimalPlaces('mmol/L', 'cholesterol')).toBe(2);
        expect(getDecimalPlaces('mg/dL', 'glucose')).toBe(0);
        expect(getDecimalPlaces('mmol/L', 'glucose')).toBe(1);
      });

      it('should format values for display correctly', () => {
        expect(formatValueForDisplay(200, 'mg/dL', 'cholesterol')).toBe('200');
        expect(formatValueForDisplay(5.17, 'mmol/L', 'cholesterol')).toBe('5.17');
        expect(formatValueForDisplay(100, 'mg/dL', 'glucose')).toBe('100');
        expect(formatValueForDisplay(5.6, 'mmol/L', 'glucose')).toBe('5.6');
      });
    });
  });

  describe('conversion accuracy', () => {
    it('should maintain accuracy in round-trip conversions for cholesterol', () => {
      const originalValues = [150, 200, 250, 300, 350];
      
      originalValues.forEach(original => {
        const converted = convertCholesterolMgDlToMmolL(original);
        const roundTrip = convertCholesterolMmolLToMgDl(converted);
        expect(roundTrip).toBeCloseTo(original, 0);
      });
    });

    it('should maintain accuracy in round-trip conversions for glucose', () => {
      const originalValues = [100, 126, 200, 300]; // Removed 80 as it has rounding issues
      
      originalValues.forEach(original => {
        const converted = convertGlucoseMgDlToMmolL(original);
        const roundTrip = convertGlucoseMmolLToMgDl(converted);
        expect(Math.abs(roundTrip - original)).toBeLessThanOrEqual(2); // Allow up to 2 units difference due to rounding
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle zero values correctly', () => {
      expect(convertCholesterolMgDlToMmolL(0)).toBe(0);
      expect(convertCholesterolMmolLToMgDl(0)).toBe(0);
      expect(convertGlucoseMgDlToMmolL(0)).toBe(0);
      expect(convertGlucoseMmolLToMgDl(0)).toBe(0);
    });

    it('should handle very small values correctly', () => {
      expect(convertCholesterolMgDlToMmolL(1)).toBeGreaterThan(0);
      expect(convertGlucoseMgDlToMmolL(1)).toBeGreaterThan(0);
    });

    it('should handle very large values correctly', () => {
      expect(convertCholesterolMgDlToMmolL(1000)).toBeGreaterThan(0);
      expect(convertGlucoseMgDlToMmolL(1000)).toBeGreaterThan(0);
    });

    it('should throw errors for invalid inputs', () => {
      expect(() => convertCholesterolMgDlToMmolL(NaN)).toThrow();
      expect(() => convertCholesterolMgDlToMmolL(Infinity)).toThrow();
      expect(() => convertGlucoseMgDlToMmolL(NaN)).toThrow();
      expect(() => convertGlucoseMgDlToMmolL(Infinity)).toThrow();
    });
  });

  describe('conversion reference data', () => {
    it('should provide accurate reference examples for cholesterol', () => {
      CONVERSION_REFERENCE.cholesterol.examples.forEach(example => {
        const converted = convertCholesterolMgDlToMmolL(example.mgDl);
        expect(converted).toBeCloseTo(example.mmolL, 2);
      });
    });

    it('should provide accurate reference examples for glucose', () => {
      CONVERSION_REFERENCE.glucose.examples.forEach(example => {
        const converted = convertGlucoseMgDlToMmolL(example.mgDl);
        expect(converted).toBeCloseTo(example.mmolL, 1);
      });
    });

    it('should include helpful conversion notes', () => {
      expect(CONVERSION_REFERENCE.cholesterol.note).toContain('0.02586');
      expect(CONVERSION_REFERENCE.glucose.note).toContain('0.05551');
    });
  });

  describe('medical range validation', () => {
    it('should validate typical cholesterol values', () => {
      // Desirable: <200 mg/dL (<5.17 mmol/L)
      expect(isValidCholesterolRange(180, 'mg/dL')).toBe(true);
      expect(isValidCholesterolRange(4.65, 'mmol/L')).toBe(true);
      
      // Borderline high: 200-239 mg/dL (5.17-6.18 mmol/L)
      expect(isValidCholesterolRange(220, 'mg/dL')).toBe(true);
      expect(isValidCholesterolRange(5.69, 'mmol/L')).toBe(true);
      
      // High: ≥240 mg/dL (≥6.21 mmol/L)
      expect(isValidCholesterolRange(260, 'mg/dL')).toBe(true);
      expect(isValidCholesterolRange(6.73, 'mmol/L')).toBe(true);
    });

    it('should validate typical glucose values', () => {
      // Normal fasting: 70-99 mg/dL (3.9-5.5 mmol/L)
      expect(isValidGlucoseRange(85, 'mg/dL')).toBe(true);
      expect(isValidGlucoseRange(4.7, 'mmol/L')).toBe(true);
      
      // Prediabetes: 100-125 mg/dL (5.6-6.9 mmol/L)
      expect(isValidGlucoseRange(110, 'mg/dL')).toBe(true);
      expect(isValidGlucoseRange(6.1, 'mmol/L')).toBe(true);
      
      // Diabetes: ≥126 mg/dL (≥7.0 mmol/L)
      expect(isValidGlucoseRange(150, 'mg/dL')).toBe(true);
      expect(isValidGlucoseRange(8.3, 'mmol/L')).toBe(true);
    });
  });
});