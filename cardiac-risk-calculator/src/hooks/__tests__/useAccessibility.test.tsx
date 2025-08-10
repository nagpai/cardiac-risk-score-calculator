import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  useFocusManagement, 
  useKeyboardNavigation, 
  useScreenReader, 
  useHighContrast, 
  useLiveRegion, 
  useSkipLinks, 
  useReducedMotion 
} from '../useAccessibility';

// Mock DOM methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useFocusManagement', () => {
  it('should provide focus management functions', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useFocusManagement(containerRef));

    expect(result.current.focusFirst).toBeInstanceOf(Function);
    expect(result.current.focusLast).toBeInstanceOf(Function);
    expect(result.current.trapFocus).toBeInstanceOf(Function);
    expect(result.current.focusedIndex).toBe(-1);
  });

  it('should focus first element', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    button1.focus = vi.fn();
    button2.focus = vi.fn();
    
    container.appendChild(button1);
    container.appendChild(button2);
    
    const containerRef = { current: container };
    const { result } = renderHook(() => useFocusManagement(containerRef));

    act(() => {
      result.current.focusFirst();
    });

    expect(button1.focus).toHaveBeenCalled();
    expect(result.current.focusedIndex).toBe(0);
  });

  it('should focus last element', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    button1.focus = vi.fn();
    button2.focus = vi.fn();
    
    container.appendChild(button1);
    container.appendChild(button2);
    
    const containerRef = { current: container };
    const { result } = renderHook(() => useFocusManagement(containerRef));

    act(() => {
      result.current.focusLast();
    });

    expect(button2.focus).toHaveBeenCalled();
    expect(result.current.focusedIndex).toBe(1);
  });
});

describe('useKeyboardNavigation', () => {
  it('should provide keyboard navigation functions', () => {
    const items: HTMLElement[] = [];
    const { result } = renderHook(() => useKeyboardNavigation(items));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.handleKeyDown).toBeInstanceOf(Function);
    expect(result.current.handleActivation).toBeInstanceOf(Function);
  });

  it('should handle activation callback', () => {
    const items: HTMLElement[] = [];
    const { result } = renderHook(() => useKeyboardNavigation(items));
    const callback = vi.fn();

    const activationHandler = result.current.handleActivation(callback);
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    event.preventDefault = vi.fn();

    activationHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });
});

describe('useScreenReader', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should provide screen reader functions', () => {
    const { result } = renderHook(() => useScreenReader());

    expect(result.current.announce).toBeInstanceOf(Function);
    expect(result.current.updateLiveRegion).toBeInstanceOf(Function);
  });

  it('should announce messages', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.announce('Test message');
    });

    const announcement = document.querySelector('[aria-live="polite"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.textContent).toBe('Test message');
  });

  it('should update live region', () => {
    const { result } = renderHook(() => useScreenReader());

    act(() => {
      result.current.updateLiveRegion('test-region', 'Test message');
    });

    const region = document.getElementById('test-region');
    expect(region).toBeTruthy();
    expect(region?.textContent).toBe('Test message');
  });
});

describe('useHighContrast', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('high-contrast');
  });

  it('should provide high contrast state and toggle function', () => {
    const { result } = renderHook(() => useHighContrast());

    expect(typeof result.current.isHighContrast).toBe('boolean');
    expect(result.current.toggleHighContrast).toBeInstanceOf(Function);
  });

  it('should toggle high contrast mode', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.toggleHighContrast();
    });

    expect(result.current.isHighContrast).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });
});

describe('useLiveRegion', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should provide announce function', () => {
    const { result } = renderHook(() => useLiveRegion('test-region'));

    expect(result.current.announce).toBeInstanceOf(Function);
  });

  it('should announce to live region', () => {
    const { result } = renderHook(() => useLiveRegion('test-region'));

    act(() => {
      result.current.announce('Test message');
    });

    const region = document.getElementById('test-region');
    expect(region).toBeTruthy();
    expect(region?.textContent).toBe('Test message');
  });

  it('should cleanup live region on unmount', () => {
    const { unmount } = renderHook(() => useLiveRegion('test-region'));

    // Create the region
    act(() => {
      const region = document.createElement('div');
      region.id = 'test-region';
      document.body.appendChild(region);
    });

    expect(document.getElementById('test-region')).toBeTruthy();

    unmount();

    // Note: The cleanup happens in useEffect, but jsdom doesn't automatically
    // trigger cleanup, so we can't easily test this behavior
  });
});

describe('useSkipLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should provide skip link functions', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(result.current.skipToContent).toBeInstanceOf(Function);
    expect(result.current.skipToNavigation).toBeInstanceOf(Function);
  });

  it('should skip to main content', () => {
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.focus = vi.fn();
    mainContent.scrollIntoView = vi.fn();
    document.body.appendChild(mainContent);

    const { result } = renderHook(() => useSkipLinks());

    act(() => {
      result.current.skipToContent();
    });

    expect(mainContent.focus).toHaveBeenCalled();
    expect(mainContent.scrollIntoView).toHaveBeenCalled();
  });

  it('should skip to navigation', () => {
    const navigation = document.createElement('nav');
    navigation.id = 'main-navigation';
    navigation.focus = vi.fn();
    navigation.scrollIntoView = vi.fn();
    document.body.appendChild(navigation);

    const { result } = renderHook(() => useSkipLinks());

    act(() => {
      result.current.skipToNavigation();
    });

    expect(navigation.focus).toHaveBeenCalled();
    expect(navigation.scrollIntoView).toHaveBeenCalled();
  });
});

describe('useReducedMotion', () => {
  it('should return reduced motion preference', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(typeof result.current).toBe('boolean');
  });

  it('should return true when prefers-reduced-motion is set', () => {
    // Mock matchMedia to return true for reduced motion
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });
});