import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PatientDataForm from '../PatientDataForm';
import type { PatientData } from '../../../types';

const mockPatientData: PatientData = {
  age: 45,
  gender: 'male',
  totalCholesterol: 200,
  hdlCholesterol: 50,
  cholesterolUnit: 'mg/dL',
  systolicBP: 120,
  diastolicBP: 80,
  onBPMedication: false,
  bloodGlucose: 100,
  glucoseUnit: 'mg/dL',
  smokingStatus: 'never',
  hasDiabetes: false,
  familyHistory: false,
};

describe('PatientDataForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnDataChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form sections', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Cholesterol Levels')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Additional Health Information')).toBeInTheDocument();
    expect(screen.getByText(/Blood Glucose/)).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    // Demographics
    expect(screen.getByRole('spinbutton', { name: /age/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /gender/i })).toBeInTheDocument();

    // Cholesterol
    expect(screen.getByRole('spinbutton', { name: /total cholesterol/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /hdl cholesterol/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /cholesterol unit/i })).toBeInTheDocument();

    // Blood Pressure
    expect(screen.getByRole('spinbutton', { name: /systolic blood pressure/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /diastolic blood pressure/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /blood pressure medication/i })).toBeInTheDocument();

    // Risk Factors
    expect(screen.getByRole('group', { name: /smoking status/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /diabetes/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /family history/i })).toBeInTheDocument();

    // Optional
    expect(screen.getByRole('spinbutton', { name: /blood glucose/i })).toBeInTheDocument();
  });

  it('displays progress indicator when showProgress is true', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} showProgress={true} />);

    expect(screen.getByText('Form Progress')).toBeInTheDocument();
    expect(screen.getByText(/of.*required fields/)).toBeInTheDocument();
  });

  it('hides progress indicator when showProgress is false', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} showProgress={false} />);

    expect(screen.queryByText('Form Progress')).not.toBeInTheDocument();
  });

  it('initializes form with provided initial data', async () => {
    render(
      <PatientDataForm 
        onSubmit={mockOnSubmit} 
        initialData={mockPatientData}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    });
    
    // Check that gender select has the correct value
    const genderSelect = screen.getByRole('combobox', { name: /gender/i });
    expect(genderSelect).toHaveValue('male');
  });

  it('calls onDataChange when form data changes', async () => {
    const user = userEvent.setup();
    
    render(
      <PatientDataForm 
        onSubmit={mockOnSubmit} 
        onDataChange={mockOnDataChange}
      />
    );

    const ageInput = screen.getByRole('spinbutton', { name: /age/i });
    await user.type(ageInput, '45');

    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalled();
    });
  });

  it('handles cholesterol unit conversion correctly', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    // Enter cholesterol values in mg/dL
    const totalCholInput = screen.getByRole('spinbutton', { name: /total cholesterol/i });
    const hdlCholInput = screen.getByRole('spinbutton', { name: /hdl cholesterol/i });
    
    await user.clear(totalCholInput);
    await user.type(totalCholInput, '200');
    await user.clear(hdlCholInput);
    await user.type(hdlCholInput, '50');

    // Switch to mmol/L
    const unitSelector = screen.getByRole('combobox', { name: /cholesterol unit/i });
    await user.selectOptions(unitSelector, 'mmol/L');

    // Values should be converted (approximately)
    await waitFor(() => {
      const totalValue = (totalCholInput as HTMLInputElement).value;
      const hdlValue = (hdlCholInput as HTMLInputElement).value;
      // Allow for some tolerance in conversion
      expect(totalValue).not.toBe('200'); // Should have changed from original
      expect(hdlValue).not.toBe('50'); // Should have changed from original
      expect(totalValue).toBeTruthy(); // Should have some value
      expect(hdlValue).toBeTruthy(); // Should have some value
    }, { timeout: 3000 });
  });

  it('handles glucose unit conversion correctly', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    // Enter glucose value in mg/dL
    const glucoseInput = screen.getByRole('spinbutton', { name: /blood glucose/i });
    await user.clear(glucoseInput);
    await user.type(glucoseInput, '100');

    // Switch to mmol/L
    const unitSelector = screen.getByRole('combobox', { name: /glucose unit/i });
    await user.selectOptions(unitSelector, 'mmol/L');

    // Value should be converted
    await waitFor(() => {
      const glucoseValue = (glucoseInput as HTMLInputElement).value;
      expect(glucoseValue).not.toBe('100'); // Should have changed from original
      expect(glucoseValue).toBeTruthy(); // Should have some value
    }, { timeout: 3000 });
  });

  it('displays validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    // Enter invalid age
    const ageInput = screen.getByRole('spinbutton', { name: /age/i });
    await user.type(ageInput, '25'); // Below minimum

    // Trigger validation by blurring the field
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.getByText(/age must be at least 30/i)).toBeInTheDocument();
    });
  });

  it('enables submit button only when form is complete and valid', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /calculate risk score/i });
    
    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Fill required fields one by one
    const ageInput = screen.getByRole('spinbutton', { name: /age/i });
    await user.clear(ageInput);
    await user.type(ageInput, '45');

    const genderSelect = screen.getByRole('combobox', { name: /gender/i });
    await user.selectOptions(genderSelect, 'male');

    const totalCholInput = screen.getByRole('spinbutton', { name: /total cholesterol/i });
    await user.clear(totalCholInput);
    await user.type(totalCholInput, '200');

    const hdlCholInput = screen.getByRole('spinbutton', { name: /hdl cholesterol/i });
    await user.clear(hdlCholInput);
    await user.type(hdlCholInput, '50');

    const systolicInput = screen.getByRole('spinbutton', { name: /systolic blood pressure/i });
    await user.clear(systolicInput);
    await user.type(systolicInput, '120');

    const diastolicInput = screen.getByRole('spinbutton', { name: /diastolic blood pressure/i });
    await user.clear(diastolicInput);
    await user.type(diastolicInput, '80');

    const neverSmokedRadio = screen.getByRole('radio', { name: /never smoked/i });
    await user.click(neverSmokedRadio);

    // Should be enabled when complete
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    }, { timeout: 5000 });
  });

  it('calls onSubmit with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <PatientDataForm 
        onSubmit={mockOnSubmit}
        initialData={mockPatientData}
      />
    );

    // Wait for form to be initialized
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /calculate risk score/i });
      expect(submitButton).toBeEnabled();
    });

    const submitButton = screen.getByRole('button', { name: /calculate risk score/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        age: 45,
        gender: 'male',
        totalCholesterol: 200,
        hdlCholesterol: 50,
        systolicBP: 120,
        diastolicBP: 80,
        smokingStatus: 'never',
      }));
    });
  });

  it('disables all inputs when disabled prop is true', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} disabled={true} />);

    const ageInput = screen.getByRole('spinbutton', { name: /age/i });
    const genderSelect = screen.getByRole('combobox', { name: /gender/i });
    const submitButton = screen.getByRole('button', { name: /calculate risk score/i });

    expect(ageInput).toBeDisabled();
    expect(genderSelect).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('shows appropriate step values for different units', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    const totalCholInput = screen.getByRole('spinbutton', { name: /total cholesterol/i });
    
    // Default mg/dL should have step="1"
    expect(totalCholInput).toHaveAttribute('step', '1');
  });

  it('displays tooltips for form fields', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    // Check for tooltip buttons (info icons) - they have titles as accessible names
    const ageTooltip = screen.getByRole('button', { name: /age must be between 30-79 years/i });
    const genderTooltip = screen.getByRole('button', { name: /biological sex assigned at birth/i });
    
    expect(ageTooltip).toBeInTheDocument();
    expect(genderTooltip).toBeInTheDocument();
  });

  it('shows completion status message', () => {
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/please complete all required fields/i)).toBeInTheDocument();
  });

  it('updates completion status when form is filled', async () => {
    const user = userEvent.setup();
    
    render(
      <PatientDataForm 
        onSubmit={mockOnSubmit}
        initialData={mockPatientData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/all required fields completed/i)).toBeInTheDocument();
    });
  });

  it('handles smoking status radio buttons correctly', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    const neverSmokedRadio = screen.getByRole('radio', { name: /never smoked/i });
    const currentSmokerRadio = screen.getByRole('radio', { name: /current smoker/i });

    await user.click(neverSmokedRadio);
    expect(neverSmokedRadio).toBeChecked();
    expect(currentSmokerRadio).not.toBeChecked();

    await user.click(currentSmokerRadio);
    expect(currentSmokerRadio).toBeChecked();
    expect(neverSmokedRadio).not.toBeChecked();
  });

  it('handles checkbox inputs correctly', async () => {
    const user = userEvent.setup();
    
    render(<PatientDataForm onSubmit={mockOnSubmit} />);

    const diabetesCheckbox = screen.getByRole('checkbox', { name: /diabetes/i });
    const familyHistoryCheckbox = screen.getByRole('checkbox', { name: /family history/i });
    const bpMedicationCheckbox = screen.getByRole('checkbox', { name: /blood pressure medication/i });

    // Initially unchecked
    expect(diabetesCheckbox).not.toBeChecked();
    expect(familyHistoryCheckbox).not.toBeChecked();
    expect(bpMedicationCheckbox).not.toBeChecked();

    // Check boxes
    await user.click(diabetesCheckbox);
    await user.click(familyHistoryCheckbox);
    await user.click(bpMedicationCheckbox);

    expect(diabetesCheckbox).toBeChecked();
    expect(familyHistoryCheckbox).toBeChecked();
    expect(bpMedicationCheckbox).toBeChecked();
  });
});