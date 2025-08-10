import type { PatientProfile, StorageError, EncryptedData } from '../types';

/**
 * Storage utilities for patient profiles with encryption
 * Implements secure local storage using Web Crypto API
 */

const STORAGE_KEY_PREFIX = 'cardiac_risk_profiles_';
const STORAGE_VERSION = '1.0';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Custom error class for storage operations
 */
class StorageErrorImpl extends Error implements StorageError {
  code: StorageError['code'];

  constructor(message: string, code: StorageError['code']) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Web Crypto API is available
 */
function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.crypto && 
         window.crypto.subtle &&
         typeof window.crypto.subtle.encrypt === 'function';
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random initialization vector
 */
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
async function encryptData(data: string, password: string): Promise<EncryptedData> {
  if (!isCryptoAvailable()) {
    throw new StorageErrorImpl('Web Crypto API not available', 'ENCRYPTION_FAILED');
  }

  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(password, salt);
    
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv: iv },
      key,
      encodedData
    );

    return {
      data: Array.from(new Uint8Array(encryptedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      salt: Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    };
  } catch (error) {
    throw new StorageErrorImpl(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'ENCRYPTION_FAILED'
    );
  }
}

/**
 * Decrypt data using AES-GCM
 */
async function decryptData(encryptedData: EncryptedData, password: string): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new StorageErrorImpl('Web Crypto API not available', 'DECRYPTION_FAILED');
  }

  try {
    const salt = new Uint8Array(
      encryptedData.salt.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    const iv = new Uint8Array(
      encryptedData.iv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    const data = new Uint8Array(
      encryptedData.data.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    const key = await deriveKey(password, salt);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv: iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new StorageErrorImpl(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DECRYPTION_FAILED'
    );
  }
}

/**
 * Generate a default encryption password based on browser fingerprint
 * Note: This provides basic obfuscation, not true security
 */
function generateDefaultPassword(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  
  // Simple hash function for consistent password generation
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `cardiac_risk_${Math.abs(hash)}_${STORAGE_VERSION}`;
}

/**
 * Save a patient profile to encrypted local storage
 */
export async function savePatientProfile(profile: PatientProfile): Promise<void> {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const profileData = {
      ...profile,
      version: STORAGE_VERSION,
      updatedAt: new Date()
    };

    const jsonData = JSON.stringify(profileData);
    const password = generateDefaultPassword();
    const encryptedData = await encryptData(jsonData, password);
    
    const storageKey = `${STORAGE_KEY_PREFIX}${profile.id}`;
    localStorage.setItem(storageKey, JSON.stringify(encryptedData));
  } catch (error) {
    if (error instanceof StorageErrorImpl) {
      throw error;
    }
    
    // Check for quota exceeded error
    if ((error instanceof DOMException && error.code === 22) || 
        (error instanceof Error && (error as any).code === 22)) {
      throw new StorageErrorImpl('Storage quota exceeded', 'QUOTA_EXCEEDED');
    }
    
    throw new StorageErrorImpl(
      `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_UNAVAILABLE'
    );
  }
}

/**
 * Load a patient profile from encrypted local storage
 */
export async function loadPatientProfile(profileId: string): Promise<PatientProfile | null> {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${profileId}`;
    const encryptedDataStr = localStorage.getItem(storageKey);
    
    if (!encryptedDataStr) {
      return null;
    }

    const encryptedData: EncryptedData = JSON.parse(encryptedDataStr);
    const password = generateDefaultPassword();
    const decryptedData = await decryptData(encryptedData, password);
    
    const profileData = JSON.parse(decryptedData);
    
    // Convert date strings back to Date objects
    return {
      ...profileData,
      createdAt: new Date(profileData.createdAt),
      updatedAt: new Date(profileData.updatedAt),
      riskResult: profileData.riskResult ? {
        ...profileData.riskResult,
        calculatedAt: new Date(profileData.riskResult.calculatedAt)
      } : undefined
    };
  } catch (error) {
    if (error instanceof StorageErrorImpl) {
      throw error;
    }
    
    throw new StorageErrorImpl(
      `Failed to load profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INVALID_DATA'
    );
  }
}

/**
 * Get all patient profile IDs and names
 */
export async function getAllPatientProfiles(): Promise<Array<{ id: string; name: string; updatedAt: Date }>> {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  const profiles: Array<{ id: string; name: string; updatedAt: Date }> = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const profileId = key.replace(STORAGE_KEY_PREFIX, '');
        try {
          const profile = await loadPatientProfile(profileId);
          if (profile) {
            profiles.push({
              id: profile.id,
              name: profile.name,
              updatedAt: profile.updatedAt
            });
          }
        } catch (error) {
          // Skip corrupted profiles but continue with others
          console.warn(`Failed to load profile ${profileId}:`, error);
        }
      }
    }
    
    // Sort by most recently updated
    return profiles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    throw new StorageErrorImpl(
      `Failed to get profiles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_UNAVAILABLE'
    );
  }
}

/**
 * Delete a patient profile from local storage
 */
export function deletePatientProfile(profileId: string): void {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${profileId}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    throw new StorageErrorImpl(
      `Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_UNAVAILABLE'
    );
  }
}

/**
 * Clear all patient profiles from local storage
 */
export function clearAllPatientProfiles(): void {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    throw new StorageErrorImpl(
      `Failed to clear profiles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_UNAVAILABLE'
    );
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; available: number; profileCount: number } {
  if (!isStorageAvailable()) {
    throw new StorageErrorImpl('Local storage not available', 'STORAGE_UNAVAILABLE');
  }

  let used = 0;
  let profileCount = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
          if (key.startsWith(STORAGE_KEY_PREFIX)) {
            profileCount++;
          }
        }
      }
    }
    
    // Estimate available space (most browsers have ~5-10MB limit)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    const available = Math.max(0, estimatedLimit - used);
    
    return { used, available, profileCount };
  } catch (error) {
    throw new StorageErrorImpl(
      `Failed to get storage info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_UNAVAILABLE'
    );
  }
}

/**
 * Validate profile data structure
 */
export function validateProfileData(profile: unknown): profile is PatientProfile {
  if (typeof profile !== 'object' || profile === null) {
    return false;
  }

  const p = profile as Record<string, any>;
  
  // Check if patientData exists and is an object
  if (typeof p.patientData !== 'object' || p.patientData === null) {
    return false;
  }

  const patientData = p.patientData as Record<string, any>;
  
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof patientData.age === 'number' &&
    (patientData.gender === 'male' || patientData.gender === 'female') &&
    typeof patientData.totalCholesterol === 'number' &&
    typeof patientData.hdlCholesterol === 'number' &&
    (patientData.cholesterolUnit === 'mg/dL' || patientData.cholesterolUnit === 'mmol/L') &&
    typeof patientData.systolicBP === 'number' &&
    typeof patientData.diastolicBP === 'number' &&
    typeof patientData.onBPMedication === 'boolean' &&
    (patientData.glucoseUnit === 'mg/dL' || patientData.glucoseUnit === 'mmol/L') &&
    ['never', 'former', 'current'].includes(patientData.smokingStatus) &&
    typeof patientData.hasDiabetes === 'boolean' &&
    typeof patientData.familyHistory === 'boolean' &&
    (p.createdAt instanceof Date || typeof p.createdAt === 'string') &&
    (p.updatedAt instanceof Date || typeof p.updatedAt === 'string')
  );
}