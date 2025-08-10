import React, { createContext, useContext, useEffect, useState } from 'react';
import { useHighContrast, useReducedMotion } from '../../hooks/useAccessibility';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  prefersReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  // Initialize font size from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('font-size') as 'normal' | 'large' | 'extra-large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  // Update document class when font size changes
  useEffect(() => {
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-extra-large');
    document.documentElement.classList.add(`font-${fontSize}`);
    localStorage.setItem('font-size', fontSize);
  }, [fontSize]);

  // Update document class for reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', prefersReducedMotion);
  }, [prefersReducedMotion]);

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    prefersReducedMotion,
    fontSize,
    setFontSize,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};