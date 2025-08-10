import { vi } from 'vitest';
import { 
  focusManagement, 
  keyboardNavigation, 
  screenReader, 
  highContrast, 
  colorContrast, 
  aria, 
  formAccessibility 
} from '../accessibility';

// Mock DOM methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('focusManagement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('focusElement', () => {
    it('should focus element by ID', () => {
      const element = document.createElement('button');
      element.id = 'test-button';
      element.focus = vi.fn();
      document.body.appendChild(element);

      const result = focusManagement.focusElement('test-button');

      expect(result).toBe(true);
      expect(element.focus).toHaveBeenCalled();
    });

    it('should return false if element not found', () => {
      const result = focusManagement.focusElement('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    it('should return focusable elements', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const input = document.createElement('input');
      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;

      container.appendChild(button);
      container.appendChild(input);
      container.appendChild(disabledButton);

      const focusableElements = focusManagement.getFocusableElements(container);

      expect(focusableElements).toHaveLength(2);
      expect(focusableElements).toContain(button);
      expect(focusableElements).toContain(input);
      expect(focusableElements).not.toContain(disabledButton);
    });
  });

  describe('trapFocus', () => {
    it('should trap focus within container', () => {
      const container = document.createElement('div');
      const firstButton = document.createElement('button');
      const lastButton = document.createElement('button');
      
      firstButton.focus = vi.fn();
      lastButton.focus = vi.fn();
      
      container.appendChild(firstButton);
      container.appendChild(lastButton);

      // Mock activeElement
      Object.defineProperty(document, 'activeElement', {
        value: lastButton,
        writable: true
      });

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      event.preventDefault = vi.fn();

      focusManagement.trapFocus(container, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(firstButton.focus).toHaveBeenCalled();
    });
  });
});

describe('keyboardNavigation', () => {
  describe('handleArrowNavigation', () => {
    it('should navigate down in vertical orientation', () => {
      const elements = [
        { focus: vi.fn() } as any,
        { focus: vi.fn() } as any,
        { focus: vi.fn() } as any
      ];

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      event.preventDefault = vi.fn();

      const newIndex = keyboardNavigation.handleArrowNavigation(
        event,
        elements,
        0,
        'vertical'
      );

      expect(newIndex).toBe(1);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(elements[1].focus).toHaveBeenCalled();
    });

    it('should wrap around at end of list', () => {
      const elements = [
        { focus: vi.fn() } as any,
        { focus: vi.fn() } as any
      ];

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      event.preventDefault = vi.fn();

      const newIndex = keyboardNavigation.handleArrowNavigation(
        event,
        elements,
        1,
        'vertical'
      );

      expect(newIndex).toBe(0);
      expect(elements[0].focus).toHaveBeenCalled();
    });
  });

  describe('handleActivation', () => {
    it('should call callback on Enter key', () => {
      const callback = vi.fn();
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      event.preventDefault = vi.fn();

      keyboardNavigation.handleActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should call callback on Space key', () => {
      const callback = vi.fn();
      const event = new KeyboardEvent('keydown', { key: ' ' });
      event.preventDefault = vi.fn();

      keyboardNavigation.handleActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });
  });
});

describe('screenReader', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('announce', () => {
    it('should create announcement element', () => {
      screenReader.announce('Test message');

      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test message');
    });

    it('should use assertive priority when specified', () => {
      screenReader.announce('Urgent message', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
    });
  });

  describe('updateLiveRegion', () => {
    it('should create live region if it does not exist', () => {
      screenReader.updateLiveRegion('test-region', 'Test message');

      const region = document.getElementById('test-region');
      expect(region).toBeTruthy();
      expect(region?.textContent).toBe('Test message');
      expect(region?.getAttribute('aria-live')).toBe('polite');
    });

    it('should update existing live region', () => {
      screenReader.updateLiveRegion('test-region', 'First message');
      screenReader.updateLiveRegion('test-region', 'Second message');

      const region = document.getElementById('test-region');
      expect(region?.textContent).toBe('Second message');
    });
  });
});

describe('highContrast', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('high-contrast');
  });

  describe('isHighContrastMode', () => {
    it('should return false by default', () => {
      expect(highContrast.isHighContrastMode()).toBe(false);
    });

    it('should return true when localStorage setting is enabled', () => {
      localStorage.setItem('high-contrast-mode', 'true');
      expect(highContrast.isHighContrastMode()).toBe(true);
    });
  });

  describe('toggleHighContrastMode', () => {
    it('should enable high contrast mode when disabled', () => {
      highContrast.toggleHighContrastMode();

      expect(localStorage.getItem('high-contrast-mode')).toBe('true');
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('should disable high contrast mode when enabled', () => {
      localStorage.setItem('high-contrast-mode', 'true');
      document.documentElement.classList.add('high-contrast');

      highContrast.toggleHighContrastMode();

      expect(localStorage.getItem('high-contrast-mode')).toBe('false');
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });
});

describe('colorContrast', () => {
  describe('getRelativeLuminance', () => {
    it('should calculate luminance for white', () => {
      const luminance = colorContrast.getRelativeLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate luminance for black', () => {
      const luminance = colorContrast.getRelativeLuminance(0, 0, 0);
      expect(luminance).toBeCloseTo(0, 2);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between black and white', () => {
      const ratio = colorContrast.getContrastRatio([0, 0, 0], [255, 255, 255]);
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should return true for high contrast combinations', () => {
      const result = colorContrast.meetsWCAGAA([0, 0, 0], [255, 255, 255]);
      expect(result).toBe(true);
    });

    it('should return false for low contrast combinations', () => {
      const result = colorContrast.meetsWCAGAA([200, 200, 200], [255, 255, 255]);
      expect(result).toBe(false);
    });
  });
});

describe('aria', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = aria.generateId();
      const id2 = aria.generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^aria-/);
    });

    it('should use custom prefix', () => {
      const id = aria.generateId('custom');
      expect(id).toMatch(/^custom-/);
    });
  });

  describe('setupRelationship', () => {
    it('should set up aria-describedby relationship', () => {
      const element = document.createElement('input');
      const relatedElement = document.createElement('div');

      aria.setupRelationship(element, relatedElement, 'describedby');

      expect(relatedElement.id).toBeTruthy();
      expect(element.getAttribute('aria-describedby')).toBe(relatedElement.id);
    });

    it('should append to existing aria attributes', () => {
      const element = document.createElement('input');
      const relatedElement1 = document.createElement('div');
      const relatedElement2 = document.createElement('div');
      
      relatedElement1.id = 'existing-id';
      element.setAttribute('aria-describedby', 'existing-id');

      aria.setupRelationship(element, relatedElement2, 'describedby');

      expect(element.getAttribute('aria-describedby')).toContain('existing-id');
      expect(element.getAttribute('aria-describedby')).toContain(relatedElement2.id);
    });
  });
});

describe('formAccessibility', () => {
  describe('enhanceFormField', () => {
    it('should enhance form field with proper ARIA attributes', () => {
      const field = document.createElement('input');
      const label = document.createElement('label');
      const error = document.createElement('div');

      formAccessibility.enhanceFormField(field, label, error);

      expect(field.getAttribute('aria-labelledby')).toBe(label.id);
      expect(field.getAttribute('aria-describedby')).toBe(error.id);
      expect(field.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-invalid to false when no error', () => {
      const field = document.createElement('input');
      const label = document.createElement('label');

      formAccessibility.enhanceFormField(field, label);

      expect(field.getAttribute('aria-invalid')).toBe('false');
    });
  });

  describe('announceFormErrors', () => {
    it('should announce single error', () => {
      const spy = vi.spyOn(screenReader, 'announce');
      
      formAccessibility.announceFormErrors(['Age is required']);

      expect(spy).toHaveBeenCalledWith('Form error: Age is required', 'assertive');
    });

    it('should announce multiple errors', () => {
      const spy = vi.spyOn(screenReader, 'announce');
      
      formAccessibility.announceFormErrors(['Age is required', 'Email is invalid']);

      expect(spy).toHaveBeenCalledWith(
        'Form has 2 errors: Age is required, Email is invalid', 
        'assertive'
      );
    });

    it('should not announce when no errors', () => {
      const spy = vi.spyOn(screenReader, 'announce');
      
      formAccessibility.announceFormErrors([]);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});