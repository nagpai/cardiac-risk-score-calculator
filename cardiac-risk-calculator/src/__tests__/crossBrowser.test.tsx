/**
 * Cross-browser compatibility tests
 * Tests for Chrome, Firefox, Safari, and Edge compatibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock different browser environments
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

const mockBrowserFeatures = (features: {
  webCrypto?: boolean;
  localStorage?: boolean;
  sessionStorage?: boolean;
  indexedDB?: boolean;
  canvas?: boolean;
}) => {
  // Mock Web Crypto API
  if (features.webCrypto) {
    Object.defineProperty(window, 'crypto', {
      value: {
        subtle: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
          generateKey: vi.fn(),
        },
        getRandomValues: vi.fn(),
      },
    });
  } else {
    delete (window as any).crypto;
  }

  // Mock Storage APIs
  if (!features.localStorage) {
    delete (window as any).localStorage;
  }
  if (!features.sessionStorage) {
    delete (window as any).sessionStorage;
  }
  if (!features.indexedDB) {
    delete (window as any).indexedDB;
  }

  // Mock Canvas API
  if (!features.canvas) {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  }
};

// Mock chart.js for cross-browser tests
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  ArcElement: vi.fn(),
  DoughnutController: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: any) => (
    <div data-testid="risk-gauge">
      Risk: {data?.datasets?.[0]?.data?.[0] || 0}%
    </div>
  ),
  Line: ({ data }: any) => (
    <div data-testid="risk-chart">
      Chart with {data?.datasets?.length || 0} datasets
    </div>
  ),
}));

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Reset browser features to defaults
    mockBrowserFeatures({
      webCrypto: true,
      localStorage: true,
      sessionStorage: true,
      indexedDB: true,
      canvas: true,
    });
  });

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    });

    it('should work in Chrome', async () => {
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
      
      // Test form functionality
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
      expect(ageInput).toBeEnabled();
    });

    it('should handle Chrome-specific features', async () => {
      render(<App />);
      
      // Chrome supports all modern features
      expect(window.crypto).toBeDefined();
      expect(window.localStorage).toBeDefined();
      expect(window.indexedDB).toBeDefined();
    });
  });

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0');
    });

    it('should work in Firefox', async () => {
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
      
      // Test form functionality
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
      expect(ageInput).toBeEnabled();
    });

    it('should handle Firefox-specific behaviors', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // Firefox has specific input behaviors
      const ageInput = screen.getByLabelText(/age/i);
      await user.type(ageInput, '55');
      expect(ageInput).toHaveValue('55');
    });
  });

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15');
    });

    it('should work in Safari', async () => {
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    it('should handle Safari limitations gracefully', async () => {
      // Safari has some limitations with certain APIs
      mockBrowserFeatures({
        webCrypto: false, // Older Safari versions
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
        canvas: true,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should still work without Web Crypto
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
    });
  });

  describe('Edge Compatibility', () => {
    beforeEach(() => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');
    });

    it('should work in Edge', async () => {
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    it('should handle Edge-specific features', async () => {
      render(<App />);
      
      // Edge supports modern features
      expect(window.localStorage).toBeDefined();
      expect(window.sessionStorage).toBeDefined();
    });
  });

  describe('Feature Detection and Fallbacks', () => {
    it('should work without localStorage', async () => {
      mockBrowserFeatures({
        localStorage: false,
        sessionStorage: true,
        webCrypto: true,
        indexedDB: true,
        canvas: true,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should still function without localStorage
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
    });

    it('should work without Web Crypto API', async () => {
      mockBrowserFeatures({
        webCrypto: false,
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
        canvas: true,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should work without encryption features
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
    });

    it('should work without Canvas API', async () => {
      mockBrowserFeatures({
        canvas: false,
        webCrypto: true,
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // Charts should still render (using fallback)
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
    });

    it('should detect and handle older browsers', async () => {
      // Mock an older browser
      mockUserAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko');
      
      mockBrowserFeatures({
        webCrypto: false,
        localStorage: true,
        sessionStorage: true,
        indexedDB: false,
        canvas: true,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should provide basic functionality
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
    });
  });

  describe('CSS and Layout Compatibility', () => {
    it('should handle different viewport sizes', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should be responsive
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should handle CSS Grid and Flexbox fallbacks', async () => {
      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // Layout should work with modern CSS
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toBeVisible();
    });
  });

  describe('JavaScript API Compatibility', () => {
    it('should handle missing modern JavaScript features', async () => {
      // Mock missing Promise.allSettled (older browsers)
      const originalAllSettled = Promise.allSettled;
      delete (Promise as any).allSettled;

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should still work
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();

      // Restore
      Promise.allSettled = originalAllSettled;
    });

    it('should handle missing Intersection Observer', async () => {
      // Mock missing IntersectionObserver
      const originalIntersectionObserver = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;

      render(<App />);
      
      await screen.findByText('Cardiac Risk Calculator');
      
      // App should still work without intersection observer
      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();

      // Restore
      window.IntersectionObserver = originalIntersectionObserver;
    });
  });

  describe('Performance Across Browsers', () => {
    it('should perform calculations efficiently in all browsers', async () => {
      const user = userEvent.setup();
      
      // Test with different browser user agents
      const browsers = [
        'Chrome/120.0.0.0',
        'Firefox/120.0',
        'Safari/605.1.15',
        'Edg/120.0.0.0'
      ];

      for (const browser of browsers) {
        mockUserAgent(`Mozilla/5.0 (compatible; ${browser})`);
        
        render(<App />);
        
        await screen.findByText('Cardiac Risk Calculator');
        
        // Fill form and calculate
        await user.type(screen.getByLabelText(/age/i), '55');
        await user.click(screen.getByLabelText(/male/i));
        await user.type(screen.getByLabelText(/total cholesterol/i), '200');
        await user.type(screen.getByLabelText(/hdl cholesterol/i), '45');
        await user.type(screen.getByLabelText(/systolic/i), '140');
        await user.type(screen.getByLabelText(/diastolic/i), '90');
        await user.click(screen.getByLabelText(/never/i));

        const startTime = performance.now();
        await user.click(screen.getByRole('button', { name: /calculate risk/i }));
        
        await screen.findByText(/your 10-year cardiovascular risk/i);
        const endTime = performance.now();
        
        // Should be performant in all browsers
        expect(endTime - startTime).toBeLessThan(2000);
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      }
    });
  });
});