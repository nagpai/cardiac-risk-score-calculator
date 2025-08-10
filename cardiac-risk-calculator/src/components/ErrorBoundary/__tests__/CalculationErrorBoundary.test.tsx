import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalculationErrorBoundary } from '../CalculationErrorBoundary';
import type { PatientData } from '../../../types';

// Mock component that throws different types of errors
const ThrowCalculationError = ({ errorType }: { errorType: 'validation' | 'calculation' | 'unknown' | null }) => {
  if (errorType === 'validation') {
    throw new Error('Validation failed: invalid input data');
  }
  if (errorType === 'calculation') {
    throw new Error('Framingham calculation error occurred');
  }
  if (errorType === 'unknown') {
    throw new Error('Some unexpected error');
  }
  return <div>Calculation successful</div>;
};

const mockPatientData: PatientData = {
  age: 45,
  gender: 'male',
  totalCholesterol: 200,
  hdlCholesterol: 50,
  cholesterolUnit: 'mg/dL',
  systolicBP: 120,
  diastolicBP: 80,
  onBPMedication: false,
  glucoseUnit: 'mg/dL',
  smokingStatus: 'never',
  hasDiabetes: false,
  familyHistory: false,
};

import { vi } from 'vitest';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('CalculationErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <CalculationErrorBoundary>
        <ThrowCalculationError errorType={null} />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Calculation successful')).toBeInTheDocument();
  });

  it('should render validation error UI for validation errors', () => {
    render(
      <CalculationErrorBoundary patientData={mockPatientData}>
        <ThrowCalculationError errorType="validation" />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Invalid Input Data')).toBeInTheDocument();
    expect(screen.getByText(/There was an issue with the provided health data/)).toBeInTheDocument();
    expect(screen.getByText(/Verify that all values are within the expected medical ranges/)).toBeInTheDocument();
  });

  it('should render calculation error UI for calculation errors', () => {
    render(
      <CalculationErrorBoundary patientData={mockPatientData}>
        <ThrowCalculationError errorType="calculation" />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Calculation Error')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an error while calculating your cardiovascular risk/)).toBeInTheDocument();
    expect(screen.getByText(/This may be due to an unusual combination of risk factors/)).toBeInTheDocument();
  });

  it('should render generic error UI for unknown errors', () => {
    render(
      <CalculationErrorBoundary patientData={mockPatientData}>
        <ThrowCalculationError errorType="unknown" />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    expect(screen.getByText(/Some unexpected error/)).toBeInTheDocument();
    expect(screen.getByText(/Please try again. If the problem persists, contact support/)).toBeInTheDocument();
  });

  it('should call onRetry callback when Try Again is clicked', () => {
    const onRetry = vi.fn();
    
    render(
      <CalculationErrorBoundary onRetry={onRetry}>
        <ThrowCalculationError errorType="validation" />
      </CalculationErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should call onReset callback when Start Over is clicked', () => {
    const onReset = vi.fn();
    
    render(
      <CalculationErrorBoundary onReset={onReset}>
        <ThrowCalculationError errorType="calculation" />
      </CalculationErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(onReset).toHaveBeenCalled();
  });

  it('should reset error boundary when patient data changes', () => {
    const { rerender } = render(
      <CalculationErrorBoundary patientData={mockPatientData}>
        <ThrowCalculationError errorType="validation" />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Invalid Input Data')).toBeInTheDocument();

    // Change patient data
    const newPatientData = { ...mockPatientData, age: 50 };
    rerender(
      <CalculationErrorBoundary patientData={newPatientData}>
        <ThrowCalculationError errorType={null} />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Calculation successful')).toBeInTheDocument();
  });

  it('should show development error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <CalculationErrorBoundary>
        <ThrowCalculationError errorType="validation" />
      </CalculationErrorBoundary>
    );

    expect(screen.getByText('Development Error Details:')).toBeInTheDocument();
    // Use getAllByText to handle multiple instances of the error message
    const errorMessages = screen.getAllByText(/Validation failed: invalid input data/);
    expect(errorMessages.length).toBeGreaterThan(0);

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show development error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <CalculationErrorBoundary>
        <ThrowCalculationError errorType="validation" />
      </CalculationErrorBoundary>
    );

    expect(screen.queryByText('Development Error Details:')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should log calculation context when error occurs', () => {
    render(
      <CalculationErrorBoundary patientData={mockPatientData}>
        <ThrowCalculationError errorType="calculation" />
      </CalculationErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'CalculationErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    expect(console.error).toHaveBeenCalledWith(
      'Calculation context:',
      expect.objectContaining({
        patientData: mockPatientData,
        timestamp: expect.any(String),
        errorType: 'calculation',
      })
    );
  });

  it('should reset error state when Try Again is clicked', () => {
    const TestComponent = ({ errorType }: { errorType: 'validation' | null }) => (
      <CalculationErrorBoundary>
        <ThrowCalculationError errorType={errorType} />
      </CalculationErrorBoundary>
    );

    const { rerender } = render(<TestComponent errorType="validation" />);

    expect(screen.getByText('Invalid Input Data')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with no error after clicking try again
    rerender(<TestComponent errorType={null} />);

    expect(screen.getByText('Calculation successful')).toBeInTheDocument();
  });
});