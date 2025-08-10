import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskChart from '../RiskChart';
import type { RiskResult } from '../../../types';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="risk-chart">
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
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('RiskChart', () => {
  const mockRiskResult: RiskResult = {
    tenYearRisk: 12.5,
    riskCategory: 'moderate',
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
      averageForAge: 15.0,
      averageForGender: 8.5,
      idealRisk: 3.0,
    },
    recommendations: [],
    calculatedAt: new Date('2024-01-01'),
    framinghamVersion: '2008',
  };

  const mockLowRiskResult: RiskResult = {
    ...mockRiskResult,
    tenYearRisk: 4.2,
    riskCategory: 'low',
    comparisonData: {
      averageForAge: 6.0,
      averageForGender: 5.5,
      idealRisk: 2.0,
    },
  };

  const mockHighRiskResult: RiskResult = {
    ...mockRiskResult,
    tenYearRisk: 28.7,
    riskCategory: 'high',
    comparisonData: {
      averageForAge: 20.0,
      averageForGender: 12.0,
      idealRisk: 3.0,
    },
  };

  it('renders the component with correct title', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Risk Comparison')).toBeInTheDocument();
  });

  it('renders the chart component', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByTestId('risk-chart')).toBeInTheDocument();
  });

  it('passes correct data to the chart', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');
    
    expect(data.labels).toEqual([
      'Your Risk',
      'Average for Your Age',
      'Average for Your Gender',
      'Ideal Risk'
    ]);
    
    expect(data.datasets[0].data).toEqual([12.5, 15.0, 8.5, 3.0]);
    expect(data.datasets[0].backgroundColor[0]).toBe('#f59e0b'); // Orange for moderate risk
    expect(data.datasets[0].backgroundColor[3]).toBe('#22c55e'); // Green for ideal risk
  });

  it('uses correct colors for different risk categories', () => {
    // Test low risk
    const { rerender } = render(<RiskChart riskResult={mockLowRiskResult} />);
    let chartData = screen.getByTestId('chart-data');
    let data = JSON.parse(chartData.textContent || '{}');
    expect(data.datasets[0].backgroundColor[0]).toBe('#22c55e'); // Green for low risk
    
    // Re-render with high risk
    rerender(<RiskChart riskResult={mockHighRiskResult} />);
    chartData = screen.getByTestId('chart-data');
    data = JSON.parse(chartData.textContent || '{}');
    expect(data.datasets[0].backgroundColor[0]).toBe('#ef4444'); // Red for high risk
  });

  it('displays interpretation section', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Interpretation')).toBeInTheDocument();
  });

  it('shows correct interpretation for low risk', () => {
    render(<RiskChart riskResult={mockLowRiskResult} />);
    
    // With tenYearRisk: 4.2 and idealRisk: 2.0, this should be "at or below average" since 4.2 <= 6.0 (averageForAge)
    expect(screen.getByText(/Your risk is at or below average for your age group/)).toBeInTheDocument();
  });

  it('shows correct interpretation for ideal risk levels', () => {
    const idealRiskResult = {
      ...mockLowRiskResult,
      tenYearRisk: 2.5, // Close to ideal risk of 2.0
    };
    
    render(<RiskChart riskResult={idealRiskResult} />);
    
    // With tenYearRisk: 2.5 and idealRisk: 2.0, this should be "close to ideal" since 2.5 <= 3.0 (2.0 * 1.5)
    expect(screen.getByText(/Your risk is close to ideal levels/)).toBeInTheDocument();
  });

  it('shows correct interpretation for moderate risk at average', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByText(/Your risk is at or below average for your age group/)).toBeInTheDocument();
  });

  it('shows correct interpretation for high risk', () => {
    render(<RiskChart riskResult={mockHighRiskResult} />);
    
    // With tenYearRisk: 28.7 and averageForAge: 20.0, this should be "moderately above average" since 28.7 <= 30.0 (20.0 * 1.5)
    expect(screen.getByText(/Your risk is moderately above average for your age group/)).toBeInTheDocument();
  });

  it('displays detailed comparison data', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Your Risk:')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    
    expect(screen.getByText('Age Average:')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
    
    expect(screen.getByText('Gender Average:')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    
    expect(screen.getByText('Ideal Risk:')).toBeInTheDocument();
    expect(screen.getByText('3.0%')).toBeInTheDocument();
  });

  it('includes data source note', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    expect(screen.getByText(/Comparison data based on population studies/)).toBeInTheDocument();
    expect(screen.getByText(/Framingham Heart Study research/)).toBeInTheDocument();
  });

  it('includes accessibility information', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    const accessibilityText = screen.getByText(/Risk comparison chart showing your risk of 12.5%/);
    expect(accessibilityText).toHaveClass('sr-only');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <RiskChart riskResult={mockRiskResult} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('configures chart options correctly', () => {
    render(<RiskChart riskResult={mockRiskResult} />);
    
    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');
    
    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.legend.display).toBe(false);
    expect(options.plugins.title.display).toBe(true);
    expect(options.plugins.title.text).toBe('Risk Comparison');
  });

  it('sets appropriate y-axis scale based on data', () => {
    render(<RiskChart riskResult={mockHighRiskResult} />);
    
    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');
    
    expect(options.scales.y.beginAtZero).toBe(true);
    expect(options.scales.y.max).toBeGreaterThan(28.7); // Should be higher than the highest value
  });

  it('handles edge case of very low comparison values', () => {
    const lowComparisonResult = {
      ...mockRiskResult,
      tenYearRisk: 1.0,
      comparisonData: {
        averageForAge: 1.5,
        averageForGender: 1.2,
        idealRisk: 0.5,
      },
    };
    
    render(<RiskChart riskResult={lowComparisonResult} />);
    
    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');
    
    // Should have minimum scale of 20%
    expect(options.scales.y.max).toBeGreaterThanOrEqual(20);
  });

  it('formats percentage values correctly in detailed data', () => {
    const preciseRiskResult = {
      ...mockRiskResult,
      tenYearRisk: 12.567,
      comparisonData: {
        averageForAge: 15.123,
        averageForGender: 8.456,
        idealRisk: 3.789,
      },
    };
    
    render(<RiskChart riskResult={preciseRiskResult} />);
    
    expect(screen.getByText('12.6%')).toBeInTheDocument(); // Rounded to 1 decimal
    expect(screen.getByText('15.1%')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    expect(screen.getByText('3.8%')).toBeInTheDocument();
  });
});