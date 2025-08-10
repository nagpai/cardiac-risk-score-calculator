/**
 * Accessibility utilities for the Cardiac Risk Calculator
 */

// Focus management utilities
export const focusManagement = {
  /**
   * Set focus to an element by ID with error handling
   */
  focusElement: (elementId: string): boolean => {
    try {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Failed to focus element ${elementId}:`, error);
      return false;
    }
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  /**
   * Trap focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const focusableElements = focusManagement.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation for radio groups and lists
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ): number => {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % elements.length;
      } else if (key === 'ArrowUp') {
        newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % elements.length;
      } else if (key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
      }
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      elements[newIndex]?.focus();
    }

    return newIndex;
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

// Screen reader utilities
export const screenReader = {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Create or update a live region for dynamic content
   */
  updateLiveRegion: (regionId: string, message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    let region = document.getElementById(regionId);
    
    if (!region) {
      region = document.createElement('div');
      region.id = regionId;
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
    }

    region.textContent = message;
  }
};

// High contrast mode utilities
export const highContrast = {
  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode: (): boolean => {
    // Check for Windows high contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return true;
    }

    // Check for forced colors (Windows high contrast)
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true;
    }

    // Check for custom high contrast setting
    return localStorage.getItem('high-contrast-mode') === 'true';
  },

  /**
   * Toggle high contrast mode
   */
  toggleHighContrastMode: (): void => {
    const isCurrentlyEnabled = highContrast.isHighContrastMode();
    const newState = !isCurrentlyEnabled;
    
    localStorage.setItem('high-contrast-mode', String(newState));
    document.documentElement.classList.toggle('high-contrast', newState);
    
    screenReader.announce(
      `High contrast mode ${newState ? 'enabled' : 'disabled'}`,
      'assertive'
    );
  },

  /**
   * Initialize high contrast mode based on user preference
   */
  initializeHighContrastMode: (): void => {
    if (highContrast.isHighContrastMode()) {
      document.documentElement.classList.add('high-contrast');
    }
  }
};

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getRelativeLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const l1 = colorContrast.getRelativeLuminance(...color1);
    const l2 = colorContrast.getRelativeLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (color1: [number, number, number], color2: [number, number, number]): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return ratio >= 4.5; // WCAG AA standard for normal text
  }
};

// ARIA utilities
export const aria = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set up ARIA relationships between elements
   */
  setupRelationship: (
    element: HTMLElement,
    relatedElement: HTMLElement,
    relationship: 'describedby' | 'labelledby' | 'controls' | 'owns'
  ): void => {
    if (!relatedElement.id) {
      relatedElement.id = aria.generateId();
    }
    
    const currentValue = element.getAttribute(`aria-${relationship}`) || '';
    const newValue = currentValue ? `${currentValue} ${relatedElement.id}` : relatedElement.id;
    element.setAttribute(`aria-${relationship}`, newValue);
  }
};

// Form accessibility utilities
export const formAccessibility = {
  /**
   * Enhance form field with proper ARIA attributes
   */
  enhanceFormField: (
    field: HTMLElement,
    label?: HTMLElement,
    error?: HTMLElement,
    description?: HTMLElement
  ): void => {
    // Set up label relationship
    if (label && !field.getAttribute('aria-labelledby')) {
      aria.setupRelationship(field, label, 'labelledby');
    }

    // Set up error relationship
    if (error) {
      aria.setupRelationship(field, error, 'describedby');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.setAttribute('aria-invalid', 'false');
    }

    // Set up description relationship
    if (description) {
      aria.setupRelationship(field, description, 'describedby');
    }
  },

  /**
   * Announce form validation errors
   */
  announceFormErrors: (errors: string[]): void => {
    if (errors.length === 0) return;

    const message = errors.length === 1
      ? `Form error: ${errors[0]}`
      : `Form has ${errors.length} errors: ${errors.join(', ')}`;

    screenReader.announce(message, 'assertive');
  }
};