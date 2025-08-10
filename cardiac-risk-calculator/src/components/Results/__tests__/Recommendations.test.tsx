import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Recommendations from '../Recommendations';
import type { RiskResult, Recommendation } from '../../../types';

describe('Recommendations', () => {
  const mockRecommendations: Recommendation[] = [
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
          title: 'ACC/AHA Guidelines',
          url: 'https://example.com/guidelines',
          description: 'Professional cardiovascular risk assessment tool',
        },
      ],
    },
    {
      category: 'lifestyle',
      priority: 'medium',
      title: 'Lifestyle Modifications',
      description: 'Implement comprehensive lifestyle changes.',
      actionItems: [
        'Adopt a Mediterranean diet pattern',
        'Increase physical activity',
      ],
    },
    {
      category: 'monitoring',
      priority: 'low',
      title: 'Regular Monitoring',
      description: 'Monitor your health parameters regularly.',
      actionItems: [
        'Check blood pressure monthly',
        'Monitor cholesterol levels',
      ],
    },
  ];

  const mockRiskResult: RiskResult = {
    tenYearRisk: 15.5,
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
      averageForAge: 12.0,
      averageForGender: 8.0,
      idealRisk: 3.0,
    },
    recommendations: mockRecommendations,
    calculatedAt: new Date('2024-01-01'),
    framinghamVersion: '2008',
  };

  const mockEmptyRecommendations: RiskResult = {
    ...mockRiskResult,
    recommendations: [],
  };

  it('renders the component with correct title', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Personalized Recommendations')).toBeInTheDocument();
  });

  it('displays risk percentage in header', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    expect(screen.getByText('15.5% Risk')).toBeInTheDocument();
  });

  it('shows risk category summary', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    expect(screen.getByText(/Based on your moderate cardiovascular risk level/)).toBeInTheDocument();
  });

  it('renders all recommendations', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Medical Consultation Recommended')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle Modifications')).toBeInTheDocument();
    expect(screen.getByText('Regular Monitoring')).toBeInTheDocument();
  });

  it('expands first recommendation by default', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // First recommendation should be expanded
    expect(screen.getByText('Your risk is moderate. Consult with your healthcare provider.')).toBeInTheDocument();
    expect(screen.getByText('Schedule an appointment with your primary care physician')).toBeInTheDocument();
  });

  it('toggles recommendation expansion on click', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // Find the second recommendation button (Lifestyle Modifications)
    const lifestyleButton = screen.getByRole('button', { name: /Lifestyle Modifications/ });
    
    // Initially collapsed, description should not be visible
    expect(screen.queryByText('Implement comprehensive lifestyle changes.')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(lifestyleButton);
    
    // Now description should be visible
    expect(screen.getByText('Implement comprehensive lifestyle changes.')).toBeInTheDocument();
    expect(screen.getByText('Adopt a Mediterranean diet pattern')).toBeInTheDocument();
  });

  it('displays action items when recommendation is expanded', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // First recommendation is expanded by default
    expect(screen.getByText('Action Items:')).toBeInTheDocument();
    expect(screen.getByText('Schedule an appointment with your primary care physician')).toBeInTheDocument();
    expect(screen.getByText('Discuss your risk factors and potential interventions')).toBeInTheDocument();
  });

  it('displays resources when available', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // First recommendation is expanded and has resources
    expect(screen.getByText('Additional Resources:')).toBeInTheDocument();
    expect(screen.getByText('ACC/AHA Guidelines ↗')).toBeInTheDocument();
    expect(screen.getByText('Professional cardiovascular risk assessment tool')).toBeInTheDocument();
  });

  it('renders resource links with correct attributes', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    const resourceLink = screen.getByText('ACC/AHA Guidelines ↗');
    expect(resourceLink.closest('a')).toHaveAttribute('href', 'https://example.com/guidelines');
    expect(resourceLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(resourceLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays priority and category tags', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // First recommendation is expanded
    expect(screen.getByText(/🔴 high priority/)).toBeInTheDocument();
    expect(screen.getByText(/🏥 medical/)).toBeInTheDocument();
  });

  it('shows correct priority colors', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // Check that priority indicators have correct colors (via style attribute)
    const buttons = screen.getAllByRole('button');
    
    // High priority should have red indicator
    const highPriorityIndicator = buttons[0].querySelector('[style*="rgb(239, 68, 68)"]');
    expect(highPriorityIndicator).toBeInTheDocument();
  });

  it('handles empty recommendations gracefully', () => {
    render(<Recommendations riskResult={mockEmptyRecommendations} />);
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No specific recommendations available.')).toBeInTheDocument();
  });

  it('displays medical disclaimer', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument();
    expect(screen.getByText(/These recommendations are for educational purposes only/)).toBeInTheDocument();
  });

  it('includes accessibility information', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    const accessibilityText = screen.getByText(/3 personalized recommendations available/);
    expect(accessibilityText).toHaveClass('sr-only');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <Recommendations riskResult={mockRiskResult} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows correct expand/collapse icons', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    const buttons = screen.getAllByRole('button');
    
    // First button should have rotated icon (expanded)
    const firstIcon = buttons[0].querySelector('svg');
    expect(firstIcon).toHaveClass('rotate-180');
    
    // Second button should have normal icon (collapsed)
    const secondIcon = buttons[1].querySelector('svg');
    expect(secondIcon).not.toHaveClass('rotate-180');
  });

  it('handles recommendations without resources', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // Expand second recommendation (no resources)
    const lifestyleButton = screen.getByRole('button', { name: /Lifestyle Modifications/ });
    fireEvent.click(lifestyleButton);
    
    // Should show action items but not resources section
    expect(screen.getByText('Adopt a Mediterranean diet pattern')).toBeInTheDocument();
    
    // Count "Additional Resources:" text - should only appear once (from first recommendation)
    const resourceHeaders = screen.getAllByText('Additional Resources:');
    expect(resourceHeaders).toHaveLength(1);
  });

  it('handles recommendations without action items', () => {
    const recommendationWithoutActions: Recommendation = {
      category: 'monitoring',
      priority: 'low',
      title: 'Simple Monitoring',
      description: 'Just monitor regularly.',
      actionItems: [],
    };

    const resultWithoutActions = {
      ...mockRiskResult,
      recommendations: [recommendationWithoutActions],
    };

    render(<Recommendations riskResult={resultWithoutActions} />);
    
    // The first recommendation should be expanded by default
    expect(screen.getByText('Just monitor regularly.')).toBeInTheDocument();
    expect(screen.queryByText('Action Items:')).not.toBeInTheDocument();
  });

  it('displays category icons correctly', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    // Check that category icons are present (emojis)
    expect(screen.getByText('🏥')).toBeInTheDocument(); // Medical
    expect(screen.getByText('🏃')).toBeInTheDocument(); // Lifestyle  
    expect(screen.getByText('📊')).toBeInTheDocument(); // Monitoring
  });

  it('maintains keyboard accessibility', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-controls');
    });
  });

  it('counts recommendations by priority correctly in accessibility text', () => {
    render(<Recommendations riskResult={mockRiskResult} />);
    
    const accessibilityText = screen.getByText(/1 high priority, 1 medium priority, and 1 low priority items/);
    expect(accessibilityText).toBeInTheDocument();
  });
});