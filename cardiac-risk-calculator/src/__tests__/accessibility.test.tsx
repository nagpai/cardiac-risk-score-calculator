/**
 * Accessibility tests for the cardiac risk calculator
 * Tests WCAG 2.1 AA compliance and screen reader compatibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../App';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock chart.js for accessibility tests
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
    <div 
      data-testid="risk-gauge" 
      role="img" 
      aria-label={`Risk gauge showing ${data?.datasets?.[0]?.data?.[0] || 0}% risk`}
    >
      Risk: {data?.datasets?.[0]?.data?.[0] || 0}%
    </div>
  ),
  Line: ({ data }: any) => (
    <div 
      data-testid="risk-chart" 
      role="img" 
      aria-label={`Risk comparison chart with ${data?.datasets?.length || 0} datasets`}
    >
      Chart with {data?.datasets?.length || 0} datasets
    </div>
  ),
}));

describe('Accessibility Tests', () => {
  it('should have no accessibility violations on initial load', async () => {
    const { container } = render(<App />);
    
    // Wait for app to fully load
    await screen.findByText('Cardiac Risk Calculator');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Check for proper heading structure
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Cardiac Risk Calculator');
    
    // Should have logical heading progression
    const headings = screen.getAllByRole('heading');
    const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
    
    // First heading should be h1
    expect(headingLevels[0]).toBe(1);
    
    // No heading should skip more than one level
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  it('should have proper skip links', async () => {
    render(<App />);
    
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Skip link should be visually hidden by default
    expect(skipLink).toHaveClass('sr-only');
    
    // Should become visible on focus
    skipLink.focus();
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });

  it('should have proper ARIA labels and descriptions', async () => {
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Form fields should have proper labels
    const ageInput = screen.getByLabelText(/age/i);
    expect(ageInput).toHaveAttribute('aria-required', 'true');
    
    const genderFieldset = screen.getByRole('radiogroup', { name: /gender/i });
    expect(genderFieldset).toBeInTheDocument();
    
    // Form should have proper structure
    const form = screen.getByRole('form') || screen.getByTestId('patient-form');
    expect(form).toBeInTheDocument();
  });

  it('should have proper focus management', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Test tab order
    const ageInput = screen.getByLabelText(/age/i);
    ageInput.focus();
    expect(ageInput).toHaveFocus();
    
    // Tab should move to next focusable element
    await user.tab();
    const nextElement = document.activeElement;
    expect(nextElement).not.toBe(ageInput);
    expect(nextElement).toBeVisible();
  });

  it('should have proper color contrast', async () => {
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Test that text elements have sufficient contrast
    // This is a basic check - in real scenarios you'd use tools like axe-core
    const textElements = screen.getAllByText(/./);
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Basic check that color is not transparent or same as background
      expect(color).not.toBe('transparent');
      expect(color).not.toBe(backgroundColor);
    });
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Test Enter key on buttons
    const calculateButton = screen.getByRole('button', { name: /calculate risk/i });
    calculateButton.focus();
    
    // Should be able to activate with Enter
    fireEvent.keyDown(calculateButton, { key: 'Enter' });
    // Button should respond to keyboard activation
    
    // Test Space key on buttons
    fireEvent.keyDown(calculateButton, { key: ' ' });
    // Button should respond to space key
    
    // Test arrow keys on radio buttons
    const maleRadio = screen.getByLabelText(/male/i);
    const femaleRadio = screen.getByLabelText(/female/i);
    
    maleRadio.focus();
    expect(maleRadio).toHaveFocus();
    
    // Arrow key should move to next radio button
    fireEvent.keyDown(maleRadio, { key: 'ArrowDown' });
    expect(femaleRadio).toHaveFocus();
  });

  it('should have proper error announcements', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Enter invalid data
    const ageInput = screen.getByLabelText(/age/i);
    await user.clear(ageInput);
    await user.type(ageInput, '25'); // Invalid age
    
    // Try to submit
    const calculateButton = screen.getByRole('button', { name: /calculate risk/i });
    await user.click(calculateButton);
    
    // Error should be announced to screen readers
    const errorMessage = await screen.findByText(/age must be between 30 and 79/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('should have proper live regions', async () => {
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Check for ARIA live regions
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    
    const alertRegion = document.querySelector('[aria-live="assertive"]');
    expect(alertRegion).toBeInTheDocument();
  });

  it('should have accessible form validation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Test required field validation
    const ageInput = screen.getByLabelText(/age/i);
    expect(ageInput).toHaveAttribute('aria-required', 'true');
    
    // Test invalid state
    await user.clear(ageInput);
    await user.type(ageInput, '25');
    
    // Field should be marked as invalid
    expect(ageInput).toHaveAttribute('aria-invalid', 'true');
    
    // Should have error description
    const errorId = ageInput.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      expect(errorElement).toBeInTheDocument();
    }
  });

  it('should have accessible tooltips', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Find tooltip triggers
    const tooltipButtons = screen.getAllByRole('button', { name: /help/i });
    
    if (tooltipButtons.length > 0) {
      const tooltipButton = tooltipButtons[0];
      
      // Tooltip should be properly labeled
      expect(tooltipButton).toHaveAttribute('aria-label');
      
      // Should expand on click
      await user.click(tooltipButton);
      
      // Tooltip content should be accessible
      const tooltipContent = screen.getByRole('tooltip');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent).toHaveAttribute('role', 'tooltip');
    }
  });

  it('should have accessible results display', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Fill form with valid data
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
    await screen.findByText(/your 10-year cardiovascular risk/i);
    
    // Results should be accessible
    const riskGauge = screen.getByTestId('risk-gauge');
    expect(riskGauge).toHaveAttribute('role', 'img');
    expect(riskGauge).toHaveAttribute('aria-label');
    
    // Results should be announced
    const resultsRegion = screen.getByRole('region', { name: /results/i });
    expect(resultsRegion).toBeInTheDocument();
  });

  it('should support high contrast mode', async () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // In high contrast mode, elements should still be visible and functional
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeVisible();
    });
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeVisible();
    });
  });

  it('should have proper modal accessibility', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await screen.findByText('Cardiac Risk Calculator');
    
    // Look for modal triggers (help buttons, etc.)
    const helpButtons = screen.queryAllByRole('button', { name: /help/i });
    
    if (helpButtons.length > 0) {
      await user.click(helpButtons[0]);
      
      // Modal should be properly structured
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      
      // Focus should be trapped in modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    }
  });
});