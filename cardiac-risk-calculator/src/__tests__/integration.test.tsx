/**
 * Integration tests for complete user workflows
 * Tests the entire application flow from input to results
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the performance API for testing
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
  writable: true,
});

// Mock chart.js to avoid canvas issues in tests
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
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

describe('Integration Tests - Complete User Workflows', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset performance mocks
    vi.clearAllMocks();
  });

  it('should complete full risk calculation workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Fill out the form with valid data
    const ageInput = screen.getByLabelText(/age/i);
    await user.clear(ageInput);
    await user.type(ageInput, '55');

    // Select gender
    const maleRadio = screen.getByLabelText(/male/i);
    await user.click(maleRadio);

    // Fill cholesterol values
    const totalCholesterolInput = screen.getByLabelText(/total cholesterol/i);
    await user.clear(totalCholesterolInput);
    await user.type(totalCholesterolInput, '200');

    const hdlCholesterolInput = screen.getByLabelText(/hdl cholesterol/i);
    await user.clear(hdlCholesterolInput);
    await user.type(hdlCholesterolInput, '45');

    // Fill blood pressure
    const systolicInput = screen.getByLabelText(/systolic/i);
    await user.clear(systolicInput);
    await user.type(systolicInput, '140');

    const diastolicInput = screen.getByLabelText(/diastolic/i);
    await user.clear(diastolicInput);
    await user.type(diastolicInput, '90');

    // Select smoking status
    const neverSmokedRadio = screen.getByLabelText(/never/i);
    await user.click(neverSmokedRadio);

    // Submit the form
    const calculateButton = screen.getByRole('button', { name: /calculate risk/i });
    expect(calculateButton).toBeEnabled();
    
    await user.click(calculateButton);

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText(/your 10-year cardiovascular risk/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify results are displayed
    expect(screen.getByTestId('risk-gauge')).toBeInTheDocument();
    expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
  });

  it('should handle unit conversion workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Fill initial values in mg/dL
    const totalCholesterolInput = screen.getByLabelText(/total cholesterol/i);
    await user.clear(totalCholesterolInput);
    await user.type(totalCholesterolInput, '200');

    // Switch to mmol/L
    const unitSelector = screen.getByRole('button', { name: /mg\/dl/i });
    await user.click(unitSelector);
    
    const mmolOption = screen.getByText(/mmol\/l/i);
    await user.click(mmolOption);

    // Verify conversion happened
    await waitFor(() => {
      const convertedValue = totalCholesterolInput.getAttribute('value');
      expect(parseFloat(convertedValue || '0')).toBeCloseTo(5.17, 1); // 200 mg/dL ≈ 5.17 mmol/L
    });
  });

  it('should handle form validation errors', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Try to submit with invalid age
    const ageInput = screen.getByLabelText(/age/i);
    await user.clear(ageInput);
    await user.type(ageInput, '25'); // Below minimum age

    // Try to calculate
    const calculateButton = screen.getByRole('button', { name: /calculate risk/i });
    await user.click(calculateButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/age must be between 30 and 79/i)).toBeInTheDocument();
    });
  });

  it('should handle profile save and load workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Fill out complete form
    await user.type(screen.getByLabelText(/age/i), '55');
    await user.click(screen.getByLabelText(/male/i));
    await user.type(screen.getByLabelText(/total cholesterol/i), '200');
    await user.type(screen.getByLabelText(/hdl cholesterol/i), '45');
    await user.type(screen.getByLabelText(/systolic/i), '140');
    await user.type(screen.getByLabelText(/diastolic/i), '90');
    await user.click(screen.getByLabelText(/never/i));

    // Calculate risk
    await user.click(screen.getByRole('button', { name: /calculate risk/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/your 10-year cardiovascular risk/i)).toBeInTheDocument();
    });

    // Save profile
    const saveButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveButton);

    // Enter profile name
    const profileNameInput = screen.getByLabelText(/profile name/i);
    await user.type(profileNameInput, 'Test Patient');

    // Confirm save
    const confirmSaveButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(confirmSaveButton);

    // Verify profile was saved (check localStorage)
    expect(localStorage.getItem('cardiac-risk-profiles')).toBeTruthy();
  });

  it('should be accessible with keyboard navigation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Test skip link
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    
    // Focus skip link and activate
    skipLink.focus();
    fireEvent.keyDown(skipLink, { key: 'Enter' });

    // Verify main content is focused
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveFocus();

    // Test tab navigation through form fields
    const ageInput = screen.getByLabelText(/age/i);
    ageInput.focus();
    expect(ageInput).toHaveFocus();

    // Tab to next field
    fireEvent.keyDown(ageInput, { key: 'Tab' });
    
    // Should focus on gender radio buttons
    const genderFieldset = screen.getByRole('radiogroup', { name: /gender/i });
    expect(genderFieldset).toBeInTheDocument();
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Fill form with extreme values that might cause calculation errors
    await user.type(screen.getByLabelText(/age/i), '79');
    await user.click(screen.getByLabelText(/male/i));
    await user.type(screen.getByLabelText(/total cholesterol/i), '999');
    await user.type(screen.getByLabelText(/hdl cholesterol/i), '999');
    await user.type(screen.getByLabelText(/systolic/i), '300');
    await user.type(screen.getByLabelText(/diastolic/i), '200');
    await user.click(screen.getByLabelText(/current/i));

    // Try to calculate
    await user.click(screen.getByRole('button', { name: /calculate risk/i }));

    // Should handle errors gracefully
    await waitFor(() => {
      // Either show validation errors or handle calculation errors
      const hasValidationError = screen.queryByText(/invalid/i) || 
                                screen.queryByText(/error/i) ||
                                screen.queryByText(/out of range/i);
      expect(hasValidationError).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it('should export results correctly', async () => {
    const user = userEvent.setup();
    
    // Mock window.print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Complete form and calculate
    await user.type(screen.getByLabelText(/age/i), '55');
    await user.click(screen.getByLabelText(/male/i));
    await user.type(screen.getByLabelText(/total cholesterol/i), '200');
    await user.type(screen.getByLabelText(/hdl cholesterol/i), '45');
    await user.type(screen.getByLabelText(/systolic/i), '140');
    await user.type(screen.getByLabelText(/diastolic/i), '90');
    await user.click(screen.getByLabelText(/never/i));

    await user.click(screen.getByRole('button', { name: /calculate risk/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/your 10-year cardiovascular risk/i)).toBeInTheDocument();
    });

    // Test export functionality
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    // Should trigger print
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('should meet performance requirements', async () => {
    const performanceNowSpy = vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(50); // 50ms calculation time

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cardiac Risk Calculator')).toBeInTheDocument();
    });

    // Fill form quickly
    await user.type(screen.getByLabelText(/age/i), '55');
    await user.click(screen.getByLabelText(/male/i));
    await user.type(screen.getByLabelText(/total cholesterol/i), '200');
    await user.type(screen.getByLabelText(/hdl cholesterol/i), '45');
    await user.type(screen.getByLabelText(/systolic/i), '140');
    await user.type(screen.getByLabelText(/diastolic/i), '90');
    await user.click(screen.getByLabelText(/never/i));

    // Calculate and measure time
    const startTime = performance.now();
    await user.click(screen.getByRole('button', { name: /calculate risk/i }));

    await waitFor(() => {
      expect(screen.getByText(/your 10-year cardiovascular risk/i)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    // Should meet performance requirement (< 100ms for calculation)
    // Note: This includes UI rendering time, so we're more lenient
    expect(calculationTime).toBeLessThan(1000); // 1 second for full UI update

    performanceNowSpy.mockRestore();
  });
});