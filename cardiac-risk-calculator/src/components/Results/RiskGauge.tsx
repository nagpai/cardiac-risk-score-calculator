// RiskGauge component
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import type { RiskResult } from '../../types';
import { getRiskCategoryColor, formatRiskPercentage } from '../../utils/riskCategorization';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskGaugeProps {
  riskResult: RiskResult;
  className?: string;
}

/**
 * RiskGauge component displays the cardiovascular risk as a visual gauge
 * using a doughnut chart with color-coded risk indicators
 */
export default function RiskGauge({ riskResult, className = '' }: RiskGaugeProps) {
  const { tenYearRisk, riskCategory } = riskResult;
  
  // Calculate the remaining percentage for the gauge
  const remainingRisk = 100 - tenYearRisk;
  
  // Get color based on risk category
  const riskColor = getRiskCategoryColor(riskCategory);
  
  // Chart data configuration
  const data = {
    labels: ['Risk', 'No Risk'],
    datasets: [
      {
        data: [tenYearRisk, remainingRisk],
        backgroundColor: [riskColor, '#e5e7eb'], // Risk color and light gray
        borderColor: [riskColor, '#d1d5db'],
        borderWidth: 2,
        cutout: '70%', // Creates the gauge effect
        circumference: 180, // Half circle
        rotation: 270, // Start from top
      },
    ],
  };

  // Chart options configuration
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create custom legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  // Get risk category display text
  const getRiskCategoryText = (category: string) => {
    switch (category) {
      case 'low':
        return 'Low Risk';
      case 'moderate':
        return 'Moderate Risk';
      case 'high':
        return 'High Risk';
      default:
        return 'Unknown Risk';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        10-Year Cardiovascular Risk
      </h3>
      
      {/* Gauge Chart Container */}
      <div className="relative h-48 mb-4">
        <Doughnut data={data} options={options} />
        
        {/* Center text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: riskColor }}>
            {formatRiskPercentage(tenYearRisk)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {getRiskCategoryText(riskCategory)}
          </div>
        </div>
      </div>

      {/* Risk Category Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: riskColor }}
          aria-label={`${riskCategory} risk indicator`}
        />
        <span className="text-sm font-medium text-gray-700">
          {getRiskCategoryText(riskCategory)} (&lt;10% Low, 10-20% Moderate, ≥20% High)
        </span>
      </div>

      {/* Risk Interpretation */}
      <div className="text-center text-sm text-gray-600">
        <p>
          This represents your estimated risk of experiencing a cardiovascular event 
          (heart attack or stroke) within the next 10 years based on the Framingham Risk Score.
        </p>
      </div>

      {/* Accessibility information */}
      <div className="sr-only">
        Your 10-year cardiovascular risk is {formatRiskPercentage(tenYearRisk)}, 
        which is categorized as {getRiskCategoryText(riskCategory)}.
      </div>
    </div>
  );
}