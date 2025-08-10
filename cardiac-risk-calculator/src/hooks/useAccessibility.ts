import { useEffect, useState } from 'react';
import { 
  focusManagement, 
  keyboardNavigation, 
  screenReader, 
  highContrast 
} from '../utils/accessibility';

/**
 * Hook for managing focus within a component
 */
export const useFocusManagement = (containerRef: React.RefObject<HTMLElement>) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const focusFirst = () => {
    if (!containerRef.current) return;
    const focusableElements = focusManagement.getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      setFocusedIndex(0);
    }
  };

  const focusLast = () => {
    if (!containerRef.current) return;
    const focusableElements = focusManagement.getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      const lastIndex = focusableElements.length - 1;
      focusableElements[lastIndex].focus();
      setFocusedIndex(lastIndex);
    }
  };

  const trapFocus = (event: KeyboardEvent) => {
    if (containerRef.current) {
      focusManagement.trapFocus(containerRef.current, event);
    }
  };

  return {
    focusFirst,
    focusLast,
    trapFocus,
    focusedIndex,
    setFocusedIndex
  };
};

/**
 * Hook for managing keyboard navigation in lists or groups
 */
export const useKeyboardNavigation = (
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    const newIndex = keyboardNavigation.handleArrowNavigation(
      event,
      items,
      currentIndex,
      orientation
    );
    setCurrentIndex(newIndex);
  };

  const handleActivation = (callback: () => void) => {
    return (event: KeyboardEvent) => {
      keyboardNavigation.handleActivation(event, callback);
    };
  };

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
    handleActivation
  };
};

/**
 * Hook for managing screen reader announcements
 */
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.announce(message, priority);
  };

  const updateLiveRegion = (regionId: string, message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.updateLiveRegion(regionId, message, priority);
  };

  return {
    announce,
    updateLiveRegion
  };
};

/**
 * Hook for managing high contrast mode
 */
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Initialize high contrast mode
    highContrast.initializeHighContrastMode();
    setIsHighContrast(highContrast.isHighContrastMode());

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = () => {
      setIsHighContrast(highContrast.isHighContrastMode());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    highContrast.toggleHighContrastMode();
    setIsHighContrast(highContrast.isHighContrastMode());
  };

  return {
    isHighContrast,
    toggleHighContrast
  };
};

/**
 * Hook for managing ARIA live regions
 */
export const useLiveRegion = (regionId: string) => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.updateLiveRegion(regionId, message, priority);
  };

  useEffect(() => {
    // Cleanup live region on unmount
    return () => {
      const region = document.getElementById(regionId);
      if (region) {
        document.body.removeChild(region);
      }
    };
  }, [regionId]);

  return { announce };
};

/**
 * Hook for managing skip links
 */
export const useSkipLinks = () => {
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  const skipToNavigation = () => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView();
    }
  };

  return {
    skipToContent,
    skipToNavigation
  };
};

/**
 * Hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};