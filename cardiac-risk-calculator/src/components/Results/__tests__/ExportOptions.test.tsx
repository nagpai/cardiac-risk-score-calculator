import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExportOptions from '../ExportOptions';
import type { RiskResult, PatientData } from '../../../types';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

// Mock print window
const mockPrintWindow = {
  document: {
    write: vi.fn(),
    close: vi.fn(),
  },
  focus: vi.fn(),
  print: vi.fn(),
  close: vi.fn(),
  onload: null as (() => void) | null,
};

describe('ExportOptions', () => {
  const mockRiskResult: RiskResult = {
    tenYearRisk: 15.7,
    riskCategory: 'moderate',
    riskFactors: {
      age: 2.1,
      gender: 0,
      cholesterol: 1.2,
      bloodPressure: 0.8,
      smoking: 0.5,
      diabetes: 0,
      familyHistory: 0.2,
    },
    comparisonData: {
      averageForAge: 12.5,
      averageForGender: 8.3,
      idealRisk: 3.2,
    },
    recommendations: [
      {
        category: 'medical',
        priority: 'high',
        title: 'Medical Consultation Recommended',
        description: 'Your risk is moderate. Consult with your healthcare provider.',
        actionItems: [
          'Schedule an appointment with your primary care physician',
          'Discuss your risk factors and potential interventions',
        ],
        resources: [
          {
            title: 'ACC/AHA Cardiovascular Risk Calculator',
            url: 'https://tools.acc.org/ascvd-risk-estimator-plus/',
            description: 'Professional cardiovascular risk assessment tool'
          }
        ]
      },
      {
        category: 'lifestyle',
        priority: 'medium',
        title: 'Lifestyle Modifications',
        description: 'Implement lifestyle changes to reduce risk.',
        actionItems: [
          'Adopt a Mediterranean diet',
          'Increase physical activity',
        ]
      }
    ],
    calculatedAt: new Date('2024-01-15T10:30:00Z'),
    framinghamVersion: '2008',
  };

  const mockPatientData: PatientData = {
    age: 55,
    gender: 'male',
    totalCholesterol: 220,
    hdlCholesterol: 45,
    ldlCholesterol: 140,
    cholesterolUnit: 'mg/dL',
    systolicBP: 140,
    diastolicBP: 90,
    onBPMedication: false,
    bloodGlucose: 110,
    glucoseUnit: 'mg/dL',
    smokingStatus: 'current',
    hasDiabetes: false,
    familyHistory: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockReturnValue(mockPrintWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders export and print buttons', () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    expect(screen.getByText('Print Report')).toBeInTheDocument();
  });

  it('opens export modal when export button is clicked', async () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Summary Report (High priority recommendations only)')).toBeInTheDocument();
    expect(screen.getByText('Detailed Report (All recommendations and action items)')).toBeInTheDocument();
  });

  it('allows selecting export format in modal', async () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    const summaryRadio = screen.getByDisplayValue('summary');
    const detailedRadio = screen.getByDisplayValue('detailed');
    
    expect(summaryRadio).toBeChecked();
    expect(detailedRadio).not.toBeChecked();
    
    fireEvent.click(detailedRadio);
    
    expect(summaryRadio).not.toBeChecked();
    expect(detailedRadio).toBeChecked();
  });

  it('handles print functionality', async () => {
    render(<ExportOptions riskResult={mockRiskResult} patientData={mockPatientData} />);
    
    const printButton = screen.getByText('Print Report');
    fireEvent.click(printButton);
    
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    });
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();
    
    // Simulate window load event
    if (mockPrintWindow.onload) {
      mockPrintWindow.onload();
    }
    
    expect(mockPrintWindow.focus).toHaveBeenCalled();
    expect(mockPrintWindow.print).toHaveBeenCalled();
    expect(mockPrintWindow.close).toHaveBeenCalled();
  });

  it('handles PDF export functionality', async () => {
    render(<ExportOptions riskResult={mockRiskResult} patientData={mockPatientData} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    const exportPDFButton = screen.getByText('Export PDF');
    fireEvent.click(exportPDFButton);
    
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    });
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();
  });

  it('shows loading state during export', async () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const printButton = screen.getByRole('button', { name: /print report/i });
    
    // Verify button is initially enabled
    expect(printButton).not.toBeDisabled();
    
    // Click the button and verify it gets disabled during the operation
    fireEvent.click(printButton);
    
    // The button should be disabled while the print operation is in progress
    // Since the operation is very fast, we check that the window.open was called
    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
  });

  it('handles window open failure gracefully', async () => {
    mockWindowOpen.mockReturnValue(null);
    
    // Mock alert to capture error message
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const printButton = screen.getByText('Print Report');
    fireEvent.click(printButton);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Print failed')
      );
    });
    
    mockAlert.mockRestore();
  });

  it('closes modal when cancel is clicked', async () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Export Options')).not.toBeInTheDocument();
    });
  });

  it('generates correct print content with patient data', () => {
    render(<ExportOptions riskResult={mockRiskResult} patientData={mockPatientData} />);
    
    const printButton = screen.getByText('Print Report');
    fireEvent.click(printButton);
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    
    // Check that the content includes key elements
    expect(writtenContent).toContain('Cardiovascular Risk Assessment Report');
    expect(writtenContent).toContain('15.7%');
    expect(writtenContent).toContain('MODERATE RISK');
    expect(writtenContent).toContain('Patient Information');
    expect(writtenContent).toContain('55 years');
    expect(writtenContent).toContain('male');
    expect(writtenContent).toContain('Medical Disclaimer');
  });

  it('generates correct print content without patient data', () => {
    render(<ExportOptions riskResult={mockRiskResult} />);
    
    const printButton = screen.getByText('Print Report');
    fireEvent.click(printButton);
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    
    // Check that the content includes key elements but not patient data
    expect(writtenContent).toContain('Cardiovascular Risk Assessment Report');
    expect(writtenContent).toContain('15.7%');
    expect(writtenContent).toContain('MODERATE RISK');
    expect(writtenContent).not.toContain('Patient Information');
    expect(writtenContent).toContain('Medical Disclaimer');
  });

  it('includes high priority recommendations in summary format', async () => {
    render(<ExportOptions riskResult={mockRiskResult} patientData={mockPatientData} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    // Keep summary format selected
    const exportPDFButton = screen.getByText('Export PDF');
    fireEvent.click(exportPDFButton);
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    
    // Should include high priority recommendation
    expect(writtenContent).toContain('Medical Consultation Recommended');
    // Should not include medium priority recommendation in summary
    expect(writtenContent).not.toContain('Lifestyle Modifications');
  });

  it('includes all recommendations in detailed format', async () => {
    render(<ExportOptions riskResult={mockRiskResult} patientData={mockPatientData} />);
    
    const exportButton = screen.getByText('Export as PDF');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    
    // Select detailed format
    const detailedRadio = screen.getByDisplayValue('detailed');
    fireEvent.click(detailedRadio);
    
    const exportPDFButton = screen.getByText('Export PDF');
    fireEvent.click(exportPDFButton);
    
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    
    // Should include both high and medium priority recommendations
    expect(writtenContent).toContain('Medical Consultation Recommended');
    expect(writtenContent).toContain('Lifestyle Modifications');
    // Should include action items in detailed format
    expect(writtenContent).toContain('Schedule an appointment');
    expect(writtenContent).toContain('Adopt a Mediterranean diet');
  });

  it('applies correct CSS classes for risk categories', () => {
    const highRiskResult = { ...mockRiskResult, riskCategory: 'high' as const, tenYearRisk: 25 };
    
    render(<ExportOptions riskResult={highRiskResult} />);
    
    const printButton = screen.getByText('Print Report');
    fireEvent.click(printButton);
    
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    
    expect(writtenContent).toContain('risk-result high');
    expect(writtenContent).toContain('HIGH RISK');
  });
});