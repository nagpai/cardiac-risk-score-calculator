import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SaveProfileDialog from '../SaveProfileDialog';
import * as storage from '../../../utils/storage';

// Mock the storage utilities
vi.mock('../../../utils/storage', () => ({
  savePatientProfile: vi.fn(),
}));

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

const mockPatientData = {
  age: 45,
  gender: 'male' as const,
  totalCholesterol: 200,
  hdlCholesterol: 50,
  cholesterolUnit: 'mg/dL' as const,
  systolicBP: 120,
  diastolicBP: 80,
  onBPMedication: false,
  glucoseUnit: 'mg/dL' as const,
  smokingStatus: 'never' as const,
  hasDiabetes: false,
  familyHistory: false,
};

const mockRiskResult = {
  tenYearRisk: 5.2,
  riskCategory: 'low' as const,
  riskFactors: {
    age: 1.2,
    gender: 0.8,
    cholesterol: 1.1,
    bloodPressure: 1.0,
    smoking: 0.0,
    diabetes: 0.0,
    familyHistory: 0.0,
  },
  comparisonData: {
    averageForAge: 7.5,
    averageForGender: 6.2,
    idealRisk: 2.1,
  },
  recommendations: [],
  calculatedAt: new Date(),
  framinghamVersion: '2008',
};

describe('SaveProfileDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <SaveProfileDialog
        isOpen={true}
        onClose={mockOnClose}
        patientData={mockPatientData}
        riskResult={mockRiskResult}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Save Patient Profile')).toBeInTheDocument();
    expect(screen.getByText('Profile Summary')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile Name')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SaveProfileDialog
        isOpen={false}
        onClose={mockOnClose}
        patientData={mockPatientData}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Save Patient Profile')).not.toBeInTheDocument();
  });

  it('displays patient data summary', () => {
    render(
      <SaveProfileDialog
        isOpen={true}
        onClose={mockOnClose}
        patientData={mockPatientData}
        riskResult={mockRiskResult}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('45')).toBeInTheDocument(); // Age
    expect(screen.getByText('male')).toBeInTheDocument(); // Gender
    expect(screen.getByText('200 mg/dL')).toBeInTheDocument(); // Total cholesterol
    expect(screen.getByText('5.2%')).toBeInTheDocument(); // Risk score
  });

  it('saves profile with entered name', async () => {
    vi.mocked(storage.savePatientProfile).mockResolvedValue();

    render(
      <SaveProfileDialog
        isOpen={true}
        onClose={mockOnClose}
        patientData={mockPatientData}
        riskResult={mockRiskResult}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByLabelText('Profile Name');
    fireEvent.change(nameInput, { target: { value: 'Test Profile' } });

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(storage.savePatientProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Profile',
          patientData: mockPatientData,
          riskResult: mockRiskResult,
        })
      );
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error when profile name is empty', async () => {
    render(
      <SaveProfileDialog
        isOpen={true}
        onClose={mockOnClose}
        patientData={mockPatientData}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a profile name')).toBeInTheDocument();
    });

    expect(storage.savePatientProfile).not.toHaveBeenCalled();
  });

  it('uses suggested name when clicked', () => {
    render(
      <SaveProfileDialog
        isOpen={true}
        onClose={mockOnClose}
        patientData={mockPatientData}
        onSave={mockOnSave}
      />
    );

    const suggestedButton = screen.getByText(/Use suggested:/);
    fireEvent.click(suggestedButton);

    const nameInput = screen.getByLabelText('Profile Name') as HTMLInputElement;
    expect(nameInput.value).toContain('Patient M45');
  });
});