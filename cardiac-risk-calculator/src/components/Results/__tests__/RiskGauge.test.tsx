import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskGauge from '../RiskGauge';
import type { RiskResult } from '../../../types';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data, options }: any) => (
    <div data-testid="risk-gauge-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

// Mock Chart.js registration
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

describe('RiskGauge', () => {
  const mockLowRiskResult: RiskResult = {
    tenYearRisk: 5.2,
    riskCategory: 'low',
    riskFactors: {
      age: 1.5,
      gender: 0,
      cholesterol: 0.8,
      bloodPressure: 0.3,
      smoking: 0,
      diabetes: 0,
      familyHistory: 0,
    },
    comparisonData: {
      averageForAge: 8.0,
      averageForGender: 6.5,
      idealRisk: 2.0,
    },
    recommendations: [],
    calculatedAt: new Date('2024-01-01'),
    framinghamVersion: '2008',
  };

  const mockModerateRiskResult: RiskResult = {
    ...mockLowRiskResult,
    tenYearRisk: 15.7,
    riskCategory: 'moderate',
  };

  const mockHighRiskResult: RiskResult = {
    ...mockLowRiskResult,
    tenYearRisk: 25.3,
    riskCategory: 'high',
  };

  it('renders the component with correct title', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    expect(screen.getByText('10-Year Cardiovascular Risk')).toBeInTheDocument();
  });

  it('displays the correct risk percentage for low risk', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    expect(screen.getByText('5.2%')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('displays the correct risk percentage for moderate risk', () => {
    render(<RiskGauge riskResult={mockModerateRiskResult} />);
    
    expect(screen.getByText('15.7%')).toBeInTheDocument();
    expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
  });

  it('displays the correct risk percentage for high risk', () => {
    render(<RiskGauge riskResult={mockHighRiskResult} />);
    
    expect(screen.getByText('25.3%')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders the chart component', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    expect(screen.getByTestId('risk-gauge-chart')).toBeInTheDocument();
  });

  it('passes correct data to the chart for low risk', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');
    
    expect(data.labels).toEqual(['Risk', 'No Risk']);
    expect(data.datasets[0].data).toEqual([5.2, 94.8]);
    expect(data.datasets[0].backgroundColor[0]).toBe('#22c55e'); // Green for low risk
  });

  it('passes correct data to the chart for high risk', () => {
    render(<RiskGauge riskResult={mockHighRiskResult} />);
    
    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');
    
    expect(data.datasets[0].data).toEqual([25.3, 74.7]);
    expect(data.datasets[0].backgroundColor[0]).toBe('#ef4444'); // Red for high risk
  });

  it('includes risk category indicator with correct color', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    const indicator = screen.getByLabelText('low risk indicator');
    expect(indicator).toHaveStyle({ backgroundColor: '#22c55e' });
  });

  it('displays risk interpretation text', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    expect(screen.getByText(/This represents your estimated risk/)).toBeInTheDocument();
    expect(screen.getByText(/Framingham Risk Score/)).toBeInTheDocument();
  });

  it('includes accessibility information', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    const accessibilityText = screen.getByText(/Your 10-year cardiovascular risk is 5.2%/);
    expect(accessibilityText).toHaveClass('sr-only');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <RiskGauge riskResult={mockLowRiskResult} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('configures chart options correctly', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');
    
    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.legend.display).toBe(false);
  });

  it('handles edge case of 0% risk', () => {
    const zeroRiskResult = { ...mockLowRiskResult, tenYearRisk: 0 };
    render(<RiskGauge riskResult={zeroRiskResult} />);
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles edge case of 100% risk', () => {
    const maxRiskResult = { ...mockHighRiskResult, tenYearRisk: 100 };
    render(<RiskGauge riskResult={maxRiskResult} />);
    
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('displays risk category thresholds information', () => {
    render(<RiskGauge riskResult={mockLowRiskResult} />);
    
    expect(screen.getByText(/10% Low, 10-20% Moderate, ≥20% High/)).toBeInTheDocument();
  });
});