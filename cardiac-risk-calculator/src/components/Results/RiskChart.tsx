// RiskChart component
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import type { RiskResult, PatientData } from '../../types';
import { getRiskCategoryColor } from '../../utils/riskCategorization';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RiskChartProps {
  riskResult: RiskResult;
  patientData?: PatientData;
  className?: string;
}

/**
 * RiskChart component displays comparison data showing the patient's risk
 * compared to age/gender averages and ideal risk levels
 */
export default function RiskChart({ riskResult, className = '' }: Omit<RiskChartProps, 'patientData'>) {
  const { tenYearRisk, riskCategory, comparisonData } = riskResult;
  
  // Get color based on risk category
  const riskColor = getRiskCategoryColor(riskCategory);
  
  // Chart data configuration
  const data = {
    labels: [
      'Your Risk',
      'Average for Your Age',
      'Average for Your Gender',
      'Ideal Risk'
    ],
    datasets: [
      {
        label: '10-Year Cardiovascular Risk (%)',
        data: [
          tenYearRisk,
          comparisonData.averageForAge,
          comparisonData.averageForGender,
          comparisonData.idealRisk
        ],
        backgroundColor: [
          riskColor, // Patient's risk in category color
          '#6b7280', // Gray for age average
          '#9ca3af', // Light gray for gender average
          '#22c55e', // Green for ideal risk
        ],
        borderColor: [
          riskColor,
          '#4b5563',
          '#6b7280',
          '#16a34a',
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart options configuration
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      title: {
        display: true,
        text: 'Risk Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Risk: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(
          tenYearRisk * 1.2, 
          comparisonData.averageForAge * 1.2, 
          20 // Minimum scale of 20%
        ),
        ticks: {
          callback: (value) => `${value}%`,
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
        title: {
          display: true,
          text: '10-Year Risk (%)',
          color: '#4b5563',
          font: {
            weight: 'bold',
          },
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
  };

  // Helper function to get comparison interpretation
  const getComparisonText = () => {
    const { averageForAge, idealRisk } = comparisonData;
    
    let interpretation = '';
    
    if (tenYearRisk <= idealRisk * 1.5) {
      interpretation = 'Your risk is close to ideal levels.';
    } else if (tenYearRisk <= averageForAge) {
      interpretation = 'Your risk is at or below average for your age group.';
    } else if (tenYearRisk <= averageForAge * 1.5) {
      interpretation = 'Your risk is moderately above average for your age group.';
    } else {
      interpretation = 'Your risk is significantly above average for your age group.';
    }
    
    return interpretation;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Risk Comparison
      </h3>
      
      {/* Chart Container */}
      <div className="h-64 mb-4">
        <Bar data={data} options={options} />
      </div>

      {/* Comparison Interpretation */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Interpretation</h4>
        <p className="text-sm text-gray-700">
          {getComparisonText()}
        </p>
      </div>

      {/* Detailed Comparison Data */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Your Risk:</span>
            <span className="font-medium" style={{ color: riskColor }}>
              {tenYearRisk.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Age Average:</span>
            <span className="font-medium text-gray-700">
              {comparisonData.averageForAge.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Gender Average:</span>
            <span className="font-medium text-gray-700">
              {comparisonData.averageForGender.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ideal Risk:</span>
            <span className="font-medium text-green-600">
              {comparisonData.idealRisk.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Data Source Note */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Comparison data based on population studies and Framingham Heart Study research.
          Individual risk factors may vary.
        </p>
      </div>

      {/* Accessibility information */}
      <div className="sr-only">
        Risk comparison chart showing your risk of {tenYearRisk.toFixed(1)}% compared to 
        age average of {comparisonData.averageForAge.toFixed(1)}%, 
        gender average of {comparisonData.averageForGender.toFixed(1)}%, 
        and ideal risk of {comparisonData.idealRisk.toFixed(1)}%.
      </div>
    </div>
  );
}