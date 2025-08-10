// ResultsDemo component
import { RiskGauge, RiskChart, Recommendations, ExportOptions } from './index';
import type { RiskResult, PatientData } from '../../types';

/**
 * Demo component to showcase the Results components
 * This can be used for testing and development purposes
 */
export default function ResultsDemo() {
  // Sample patient data for demonstration
  const samplePatientData: PatientData = {
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

  // Sample risk result data for demonstration
  const sampleRiskResult: RiskResult = {
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
        description: 'Your 10-year cardiovascular risk is 15.7%, which is in the moderate range. Consult with your healthcare provider to discuss prevention strategies.',
        actionItems: [
          'Schedule an appointment with your primary care physician',
          'Discuss your risk factors and potential interventions',
          'Consider medication if lifestyle changes are insufficient',
          'Develop a personalized prevention plan'
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
        priority: 'high',
        title: 'Smoking Cessation - Critical Priority',
        description: 'Smoking significantly increases your cardiovascular risk. Quitting smoking is the single most important step you can take.',
        actionItems: [
          'Contact a smoking cessation program or quitline (1-800-QUIT-NOW)',
          'Consider nicotine replacement therapy or prescription medications',
          'Identify and avoid smoking triggers',
          'Set a quit date within the next 2 weeks'
        ],
        resources: [
          {
            title: 'CDC Smoking Cessation Resources',
            url: 'https://www.cdc.gov/tobacco/quit_smoking/',
            description: 'Comprehensive smoking cessation tools and support'
          }
        ]
      },
      {
        category: 'lifestyle',
        priority: 'medium',
        title: 'Intensive Lifestyle Modifications',
        description: 'Implement comprehensive lifestyle changes to reduce your cardiovascular risk.',
        actionItems: [
          'Adopt a Mediterranean or DASH diet pattern',
          'Increase physical activity to 300 minutes moderate exercise per week',
          'Achieve and maintain a healthy weight (BMI 18.5-24.9)',
          'Limit alcohol to moderate consumption'
        ]
      },
      {
        category: 'monitoring',
        priority: 'medium',
        title: 'Enhanced Monitoring',
        description: 'Increase the frequency of health monitoring to track progress.',
        actionItems: [
          'Check blood pressure monthly at home or pharmacy',
          'Monitor cholesterol levels every 6 months',
          'Track weight and physical activity regularly',
          'Schedule follow-up appointments every 3-6 months'
        ]
      }
    ],
    calculatedAt: new Date(),
    framinghamVersion: '2008',
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cardiovascular Risk Assessment Results
        </h1>
        <p className="text-gray-600">
          Based on the Framingham Risk Score algorithm
        </p>
      </div>

      {/* Top row with gauge and chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskGauge riskResult={sampleRiskResult} />
        <RiskChart riskResult={sampleRiskResult} />
      </div>

      {/* Full width recommendations */}
      <div className="w-full">
        <Recommendations riskResult={sampleRiskResult} />
      </div>

      {/* Export Options */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export & Print Options
          </h3>
          <ExportOptions riskResult={sampleRiskResult} patientData={samplePatientData} />
        </div>
      </div>

      {/* Demo information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Demo Information
        </h3>
        <p className="text-blue-800 text-sm">
          This is a demonstration of the Results display components. The data shown is sample data 
          for a 55-year-old male with moderate cardiovascular risk. In the actual application, 
          this data would come from the risk calculation based on user input.
        </p>
      </div>
    </div>
  );
}