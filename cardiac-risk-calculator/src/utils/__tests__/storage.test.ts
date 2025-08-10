import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
  savePatientProfile,
  loadPatientProfile,
  getAllPatientProfiles,
  deletePatientProfile,
  clearAllPatientProfiles,
  getStorageInfo,
  validateProfileData
} from '../storage';
import { PatientProfile, PatientData, RiskResult } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

// Mock Web Crypto API
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    // Use fixed values for consistent testing
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256;
    }
    return array;
  }),
  subtle: {
    importKey: vi.fn().mockResolvedValue({}),
    deriveKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockImplementation(() => {
      // Return a fixed encrypted buffer
      const buffer = new ArrayBuffer(32);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < 32; i++) {
        view[i] = i;
      }
      return Promise.resolve(buffer);
    }),
    decrypt: vi.fn().mockImplementation(() => {
      // This will be overridden in individual tests as needed
      const testData = JSON.stringify({
        id: 'test-profile-1',
        name: 'John Doe',
        patientData: samplePatientData,
        riskResult: sampleRiskResult,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        version: '1.0'
      });
      return Promise.resolve(new TextEncoder().encode(testData));
    })
  }
};

// Sample test data
const samplePatientData: PatientData = {
  age: 45,
  gender: 'male',
  totalCholesterol: 200,
  hdlCholesterol: 50,
  ldlCholesterol: 120,
  cholesterolUnit: 'mg/dL',
  systolicBP: 130,
  diastolicBP: 80,
  onBPMedication: false,
  bloodGlucose: 100,
  glucoseUnit: 'mg/dL',
  smokingStatus: 'never',
  hasDiabetes: false,
  familyHistory: false
};

const sampleRiskResult: RiskResult = {
  tenYearRisk: 15.5,
  riskCategory: 'moderate',
  riskFactors: {
    age: 2.5,
    gender: 1.0,
    cholesterol: 1.2,
    bloodPressure: 1.1,
    smoking: 0,
    diabetes: 0,
    familyHistory: 0
  },
  comparisonData: {
    averageForAge: 12.0,
    averageForGender: 14.0,
    idealRisk: 8.0
  },
  recommendations: [],
  calculatedAt: new Date(),
  framinghamVersion: '1.0'
};

const sampleProfile: PatientProfile = {
  id: 'test-profile-1',
  name: 'John Doe',
  patientData: samplePatientData,
  riskResult: sampleRiskResult,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02')
};

// Helper function to setup decrypt mock for specific profile data
const setupDecryptMock = (profileData: any) => {
  mockCrypto.subtle.decrypt.mockImplementation(() => {
    const testData = JSON.stringify({
      ...profileData,
      version: '1.0'
    });
    return Promise.resolve(new TextEncoder().encode(testData));
  });
};

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    Object.defineProperty(window, 'crypto', {
      value: mockCrypto,
      writable: true
    });

    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Setup default decrypt mock
    setupDecryptMock({
      id: 'test-profile-1',
      name: 'John Doe',
      patientData: samplePatientData,
      riskResult: sampleRiskResult,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('savePatientProfile', () => {
    it('should save a patient profile successfully', async () => {
      await savePatientProfile(sampleProfile);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cardiac_risk_profiles_test-profile-1',
        expect.any(String)
      );
    });

    it('should throw error when localStorage is not available', async () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      await expect(savePatientProfile(sampleProfile)).rejects.toThrow('Local storage not available');
    });

    it('should throw quota exceeded error', async () => {
      // Mock DOMException for quota exceeded
      const quotaError = new Error('Quota exceeded');
      Object.defineProperty(quotaError, 'name', { value: 'QuotaExceededError' });
      Object.defineProperty(quotaError, 'code', { value: 22 });
      
      // First allow the storage test to pass, then throw quota error on actual setItem
      let callCount = 0;
      localStorageMock.setItem.mockImplementation((key: string) => {
        callCount++;
        if (key === '__storage_test__') {
          return; // Allow storage test to pass
        }
        throw quotaError; // Throw quota error for actual profile storage
      });

      await expect(savePatientProfile(sampleProfile)).rejects.toThrow('Storage quota exceeded');
    });

    it('should handle encryption failure', async () => {
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await expect(savePatientProfile(sampleProfile)).rejects.toThrow('Encryption failed');
    });
  });

  describe('loadPatientProfile', () => {
    it('should load a patient profile successfully', async () => {
      // Mock localStorage to return encrypted data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: 'encrypted',
        iv: 'iv',
        salt: 'salt'
      }));
      
      const loadedProfile = await loadPatientProfile('test-profile-1');
      
      expect(loadedProfile).toBeTruthy();
      expect(loadedProfile?.id).toBe('test-profile-1');
      expect(loadedProfile?.name).toBe('John Doe');
      expect(loadedProfile?.patientData.age).toBe(45);
    });

    it('should return null for non-existent profile', async () => {
      const result = await loadPatientProfile('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error when localStorage is not available', async () => {
      // Mock localStorage.getItem to throw error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      await expect(loadPatientProfile('test-profile-1')).rejects.toThrow('Failed to load profile');
    });

    it('should handle decryption failure', async () => {
      // Set up encrypted data in localStorage
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: 'encrypted',
        iv: 'iv',
        salt: 'salt'
      }));
      
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(loadPatientProfile('test-profile-1')).rejects.toThrow('Decryption failed');
    });

    it('should handle invalid JSON data', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      await expect(loadPatientProfile('test-profile-1')).rejects.toThrow('Failed to load profile');
    });
  });

  describe('getAllPatientProfiles', () => {
    it('should return all patient profiles', async () => {
      // Mock localStorage to return profile keys
      localStorageMock.key.mockImplementation((index: number) => {
        const keys = ['cardiac_risk_profiles_profile-1', 'cardiac_risk_profiles_profile-2'];
        return keys[index] || null;
      });
      
      Object.defineProperty(localStorageMock, 'length', {
        get: () => 2
      });
      
      // Mock getItem to return encrypted data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key.includes('profile-1') || key.includes('profile-2')) {
          return JSON.stringify({ data: 'encrypted', iv: 'iv', salt: 'salt' });
        }
        return null;
      });
      
      // Mock decrypt to return different profiles based on call count
      let callCount = 0;
      mockCrypto.subtle.decrypt.mockImplementation(() => {
        callCount++;
        const profileData = callCount === 1 ? {
          id: 'profile-1',
          name: 'John Doe',
          patientData: samplePatientData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        } : {
          id: 'profile-2',
          name: 'Jane Smith',
          patientData: samplePatientData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        };
        
        const testData = JSON.stringify({ ...profileData, version: '1.0' });
        return Promise.resolve(new TextEncoder().encode(testData));
      });
      
      const profiles = await getAllPatientProfiles();
      
      expect(profiles).toHaveLength(2);
      expect(profiles.map(p => p.name)).toContain('John Doe');
      expect(profiles.map(p => p.name)).toContain('Jane Smith');
    });

    it('should return empty array when no profiles exist', async () => {
      const profiles = await getAllPatientProfiles();
      expect(profiles).toHaveLength(0);
    });

    it('should skip corrupted profiles and continue', async () => {
      // Mock localStorage to return both valid and corrupted profile keys
      localStorageMock.key.mockImplementation((index: number) => {
        const keys = ['cardiac_risk_profiles_test-profile-1', 'cardiac_risk_profiles_corrupted'];
        return keys[index] || null;
      });
      
      Object.defineProperty(localStorageMock, 'length', {
        get: () => 2
      });
      
      // Mock getItem to return different data for different keys
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key.includes('test-profile-1')) {
          return JSON.stringify({ data: 'encrypted', iv: 'iv', salt: 'salt' });
        } else if (key.includes('corrupted')) {
          return 'invalid-data';
        }
        return null;
      });
      
      const profiles = await getAllPatientProfiles();
      
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('John Doe');
    });

    it('should sort profiles by most recently updated', async () => {
      // Mock localStorage to return profile keys
      localStorageMock.key.mockImplementation((index: number) => {
        const keys = ['cardiac_risk_profiles_old-profile', 'cardiac_risk_profiles_new-profile'];
        return keys[index] || null;
      });
      
      Object.defineProperty(localStorageMock, 'length', {
        get: () => 2
      });
      
      // Mock getItem to return encrypted data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key.includes('old-profile') || key.includes('new-profile')) {
          return JSON.stringify({ data: 'encrypted', iv: 'iv', salt: 'salt' });
        }
        return null;
      });
      
      // Mock decrypt to return different profiles based on call count
      let callCount = 0;
      mockCrypto.subtle.decrypt.mockImplementation(() => {
        callCount++;
        const profileData = callCount === 1 ? {
          id: 'old-profile',
          name: 'Old Profile',
          patientData: samplePatientData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        } : {
          id: 'new-profile',
          name: 'New Profile',
          patientData: samplePatientData,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        };
        
        const testData = JSON.stringify({ ...profileData, version: '1.0' });
        return Promise.resolve(new TextEncoder().encode(testData));
      });
      
      const profiles = await getAllPatientProfiles();
      
      expect(profiles[0].name).toBe('New Profile');
      expect(profiles[1].name).toBe('Old Profile');
    });
  });

  describe('deletePatientProfile', () => {
    it('should delete a patient profile', async () => {
      await savePatientProfile(sampleProfile);
      
      deletePatientProfile('test-profile-1');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cardiac_risk_profiles_test-profile-1');
    });

    it('should throw error when localStorage is not available', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => deletePatientProfile('test-profile-1')).toThrow('Local storage not available');
    });
  });

  describe('clearAllPatientProfiles', () => {
    it('should clear all patient profiles', async () => {
      // Save multiple profiles
      await savePatientProfile({ ...sampleProfile, id: 'profile-1' });
      await savePatientProfile({ ...sampleProfile, id: 'profile-2' });
      
      // Add non-profile data to localStorage
      localStorageMock.setItem('other-data', 'should-not-be-removed');
      
      clearAllPatientProfiles();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cardiac_risk_profiles_profile-1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cardiac_risk_profiles_profile-2');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-data');
    });

    it('should throw error when localStorage is not available', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => clearAllPatientProfiles()).toThrow('Local storage not available');
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage usage information', async () => {
      await savePatientProfile(sampleProfile);
      localStorageMock.setItem('other-data', 'test');
      
      const info = getStorageInfo();
      
      expect(info.profileCount).toBe(1);
      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
    });

    it('should throw error when localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      expect(() => getStorageInfo()).toThrow('Local storage not available');
    });
  });

  describe('validateProfileData', () => {
    it('should validate correct profile data', () => {
      expect(validateProfileData(sampleProfile)).toBe(true);
    });

    it('should reject invalid profile data', () => {
      expect(validateProfileData(null)).toBe(false);
      expect(validateProfileData({})).toBe(false);
      expect(validateProfileData({ id: 'test' })).toBe(false);
      
      const invalidProfile = {
        ...sampleProfile,
        patientData: {
          ...sampleProfile.patientData,
          age: 'invalid' // Should be number
        }
      };
      expect(validateProfileData(invalidProfile)).toBe(false);
    });

    it('should validate profile with string dates', () => {
      const profileWithStringDates = {
        ...sampleProfile,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };
      
      expect(validateProfileData(profileWithStringDates)).toBe(true);
    });

    it('should reject profile with invalid gender', () => {
      const invalidProfile = {
        ...sampleProfile,
        patientData: {
          ...sampleProfile.patientData,
          gender: 'invalid'
        }
      };
      
      expect(validateProfileData(invalidProfile)).toBe(false);
    });

    it('should reject profile with invalid cholesterol unit', () => {
      const invalidProfile = {
        ...sampleProfile,
        patientData: {
          ...sampleProfile.patientData,
          cholesterolUnit: 'invalid'
        }
      };
      
      expect(validateProfileData(invalidProfile)).toBe(false);
    });

    it('should reject profile with invalid smoking status', () => {
      const invalidProfile = {
        ...sampleProfile,
        patientData: {
          ...sampleProfile.patientData,
          smokingStatus: 'invalid'
        }
      };
      
      expect(validateProfileData(invalidProfile)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Web Crypto API not available', async () => {
      Object.defineProperty(window, 'crypto', {
        value: undefined,
        writable: true
      });

      await expect(savePatientProfile(sampleProfile)).rejects.toThrow('Web Crypto API not available');
    });

    it('should handle localStorage test failure', async () => {
      localStorageMock.setItem.mockImplementation((key: string) => {
        if (key === '__storage_test__') {
          throw new Error('Storage test failed');
        }
      });

      await expect(savePatientProfile(sampleProfile)).rejects.toThrow('Local storage not available');
    });
  });

  describe('Encryption/Decryption', () => {
    it('should use consistent password generation', async () => {
      // Mock navigator and screen properties for consistent password generation
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test-agent',
        writable: true
      });
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        writable: true
      });
      Object.defineProperty(screen, 'width', {
        value: 1920,
        writable: true
      });
      Object.defineProperty(screen, 'height', {
        value: 1080,
        writable: true
      });

      // Mock localStorage to return encrypted data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: 'encrypted',
        iv: 'iv',
        salt: 'salt'
      }));
      
      // Save and load profile to ensure encryption/decryption works
      await savePatientProfile(sampleProfile);
      const loadedProfile = await loadPatientProfile('test-profile-1');
      
      expect(loadedProfile?.id).toBe(sampleProfile.id);
    });

    it('should handle encryption with different data types', async () => {
      const profileWithOptionalFields = {
        ...sampleProfile,
        patientData: {
          ...sampleProfile.patientData,
          ldlCholesterol: undefined,
          bloodGlucose: undefined
        },
        riskResult: undefined
      };

      // Setup decrypt mock for this specific profile
      setupDecryptMock({
        ...profileWithOptionalFields,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      });
      
      // Mock localStorage to return encrypted data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: 'encrypted',
        iv: 'iv',
        salt: 'salt'
      }));

      await savePatientProfile(profileWithOptionalFields);
      const loadedProfile = await loadPatientProfile(profileWithOptionalFields.id);
      
      expect(loadedProfile?.patientData.ldlCholesterol).toBeUndefined();
      expect(loadedProfile?.riskResult).toBeUndefined();
    });
  });
});