import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PatientDataForm from '../PatientDataForm';

describe('PatientDataForm - Basic Tests', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Demographics')).toBeInTheDocument();
  });

  it('renders all required form sections', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Cholesterol Levels')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Additional Health Information')).toBeInTheDocument();
    expect(screen.getByText('Blood Glucose', { selector: 'h3' })).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /calculate risk score/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('displays progress indicator by default', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Form Progress')).toBeInTheDocument();
  });

  it('hides progress indicator when showProgress is false', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} showProgress={false} />);

    expect(screen.queryByText('Form Progress')).not.toBeInTheDocument();
  });
});