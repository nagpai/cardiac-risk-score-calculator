import type { PatientData, Recommendation, RiskCategory } from '../types';
import { RISK_THRESHOLDS } from './constants';

/**
 * Risk Categorization and Recommendation Engine
 * Provides risk categorization and generates personalized recommendations
 * based on cardiovascular risk level and patient factors
 */

/**
 * Categorizes risk level based on 10-year cardiovascular risk percentage
 * @param riskPercentage - 10-year risk percentage (0-100)
 * @returns Risk category: 'low', 'moderate', or 'high'
 */
export function categorizeRisk(riskPercentage: number): RiskCategory {
  if (riskPercentage < RISK_THRESHOLDS.LOW) {
    return 'low';
  }
  if (riskPercentage < RISK_THRESHOLDS.MODERATE) {
    return 'moderate';
  }
  return 'high';
}

/**
 * Generates personalized recommendations based on risk category and patient factors
 * @param riskCategory - Risk category from categorizeRisk()
 * @param riskPercentage - Actual risk percentage for context
 * @param patientData - Patient data for personalized recommendations
 * @returns Array of recommendations with priorities and action items
 */
export function generateRecommendations(
  riskCategory: RiskCategory,
  riskPercentage: number,
  patientData: PatientData
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Base recommendations by risk category
  recommendations.push(...getBaseRecommendationsByCategory(riskCategory, riskPercentage));

  // Add personalized recommendations based on risk factors
  recommendations.push(...getPersonalizedRecommendations(patientData, riskCategory));

  // Sort by priority (high -> medium -> low)
  return sortRecommendationsByPriority(recommendations);
}

/**
 * Gets base recommendations for each risk category
 */
function getBaseRecommendationsByCategory(
  category: RiskCategory,
  riskPercentage: number
): Recommendation[] {
  switch (category) {
    case 'low':
      return [
        {
          category: 'lifestyle',
          priority: 'medium',
          title: 'Maintain Healthy Lifestyle',
          description: `Your 10-year cardiovascular risk is ${riskPercentage.toFixed(1)}%, which is considered low. Continue your current healthy practices to maintain this low risk.`,
          actionItems: [
            'Continue regular physical activity (at least 150 minutes moderate exercise per week)',
            'Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains',
            'Keep your weight within a healthy range',
            'Avoid tobacco use and limit alcohol consumption',
            'Manage stress through relaxation techniques or hobbies'
          ],
          resources: [
            {
              title: 'American Heart Association - Healthy Living',
              url: 'https://www.heart.org/en/healthy-living',
              description: 'Comprehensive guide to heart-healthy lifestyle choices'
            }
          ]
        },
        {
          category: 'monitoring',
          priority: 'low',
          title: 'Regular Health Check-ups',
          description: 'Schedule regular check-ups to monitor your cardiovascular health and catch any changes early.',
          actionItems: [
            'Annual physical examination with your healthcare provider',
            'Monitor blood pressure, cholesterol, and blood sugar levels',
            'Discuss family history changes with your doctor',
            'Stay up-to-date with preventive screenings'
          ]
        }
      ];

    case 'moderate':
      return [
        {
          category: 'medical',
          priority: 'high',
          title: 'Medical Consultation Recommended',
          description: `Your 10-year cardiovascular risk is ${riskPercentage.toFixed(1)}%, which is in the moderate range. Consult with your healthcare provider to discuss prevention strategies.`,
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
          title: 'Intensive Lifestyle Modifications',
          description: 'Implement comprehensive lifestyle changes to reduce your cardiovascular risk.',
          actionItems: [
            'Adopt a Mediterranean or DASH diet pattern',
            'Increase physical activity to 300 minutes moderate exercise per week',
            'Achieve and maintain a healthy weight (BMI 18.5-24.9)',
            'Quit smoking if applicable and avoid secondhand smoke',
            'Limit alcohol to moderate consumption (1 drink/day for women, 2 for men)'
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
      ];

    case 'high':
      return [
        {
          category: 'medical',
          priority: 'high',
          title: 'Immediate Medical Consultation Required',
          description: `Your 10-year cardiovascular risk is ${riskPercentage.toFixed(1)}%, which is considered high. Immediate medical attention is strongly recommended.`,
          actionItems: [
            'Schedule an urgent appointment with a cardiologist or primary care physician',
            'Discuss immediate medication options (statins, blood pressure medications)',
            'Consider aspirin therapy if appropriate and not contraindicated',
            'Develop an aggressive risk reduction plan',
            'Discuss emergency warning signs and when to seek immediate care'
          ],
          resources: [
            {
              title: 'American College of Cardiology Guidelines',
              url: 'https://www.acc.org/guidelines',
              description: 'Professional guidelines for cardiovascular disease prevention'
            }
          ]
        },
        {
          category: 'lifestyle',
          priority: 'high',
          title: 'Aggressive Risk Factor Modification',
          description: 'Implement immediate and comprehensive lifestyle changes under medical supervision.',
          actionItems: [
            'Work with a registered dietitian for meal planning',
            'Start a medically supervised exercise program',
            'Achieve rapid weight loss if overweight (under medical guidance)',
            'Immediately quit smoking with professional support if applicable',
            'Eliminate alcohol consumption or reduce to minimal levels'
          ]
        },
        {
          category: 'monitoring',
          priority: 'high',
          title: 'Intensive Medical Supervision',
          description: 'Require close medical monitoring and frequent follow-ups.',
          actionItems: [
            'Monthly medical appointments initially',
            'Weekly blood pressure monitoring',
            'Quarterly cholesterol and diabetes screening',
            'Consider cardiac stress testing or imaging',
            'Monitor for medication side effects and effectiveness'
          ]
        }
      ];

    default:
      return [];
  }
}

/**
 * Generates personalized recommendations based on specific patient risk factors
 */
function getPersonalizedRecommendations(
  patientData: PatientData,
  riskCategory: RiskCategory
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Smoking-specific recommendations
  if (patientData.smokingStatus === 'current') {
    recommendations.push({
      category: 'lifestyle',
      priority: 'high',
      title: 'Smoking Cessation - Critical Priority',
      description: 'Smoking significantly increases your cardiovascular risk. Quitting smoking is the single most important step you can take.',
      actionItems: [
        'Contact a smoking cessation program or quitline (1-800-QUIT-NOW)',
        'Consider nicotine replacement therapy or prescription medications',
        'Identify and avoid smoking triggers',
        'Seek support from family, friends, or support groups',
        'Set a quit date within the next 2 weeks'
      ],
      resources: [
        {
          title: 'CDC Smoking Cessation Resources',
          url: 'https://www.cdc.gov/tobacco/quit_smoking/',
          description: 'Comprehensive smoking cessation tools and support'
        }
      ]
    });
  } else if (patientData.smokingStatus === 'former') {
    recommendations.push({
      category: 'lifestyle',
      priority: 'medium',
      title: 'Maintain Smoke-Free Status',
      description: 'Congratulations on quitting smoking! Continue to avoid tobacco and secondhand smoke.',
      actionItems: [
        'Avoid environments with secondhand smoke',
        'Continue using healthy coping strategies',
        'Be aware that cardiovascular benefits continue to improve over time',
        'Consider yourself a role model for others trying to quit'
      ]
    });
  }

  // Diabetes-specific recommendations
  if (patientData.hasDiabetes) {
    recommendations.push({
      category: 'medical',
      priority: 'high',
      title: 'Diabetes Management - Essential for Heart Health',
      description: 'Diabetes significantly increases cardiovascular risk. Optimal diabetes control is crucial.',
      actionItems: [
        'Maintain HbA1c levels below 7% (or as recommended by your doctor)',
        'Monitor blood glucose levels as directed',
        'Take diabetes medications as prescribed',
        'Work with an endocrinologist or diabetes educator',
        'Follow a diabetes-appropriate diet plan'
      ],
      resources: [
        {
          title: 'American Diabetes Association',
          url: 'https://www.diabetes.org/',
          description: 'Comprehensive diabetes management resources'
        }
      ]
    });
  }

  // High blood pressure recommendations
  if (patientData.systolicBP >= 140 || patientData.diastolicBP >= 90) {
    const priority = riskCategory === 'high' ? 'high' : 'medium';
    recommendations.push({
      category: 'medical',
      priority,
      title: 'Blood Pressure Management',
      description: `Your blood pressure (${patientData.systolicBP}/${patientData.diastolicBP} mmHg) is elevated and requires attention.`,
      actionItems: [
        'Monitor blood pressure regularly at home',
        'Reduce sodium intake to less than 2,300mg per day (ideally 1,500mg)',
        'Increase potassium-rich foods (bananas, oranges, spinach)',
        'Maintain a healthy weight',
        'Discuss blood pressure medications with your doctor if needed'
      ]
    });
  }

  // Cholesterol-specific recommendations
  const totalCholMgDl = patientData.cholesterolUnit === 'mmol/L' 
    ? patientData.totalCholesterol * 38.67 
    : patientData.totalCholesterol;
  
  const hdlCholMgDl = patientData.cholesterolUnit === 'mmol/L' 
    ? patientData.hdlCholesterol * 38.67 
    : patientData.hdlCholesterol;

  if (totalCholMgDl >= 240 || hdlCholMgDl < 40) {
    recommendations.push({
      category: 'lifestyle',
      priority: riskCategory === 'high' ? 'high' : 'medium',
      title: 'Cholesterol Management',
      description: 'Your cholesterol levels need attention to reduce cardiovascular risk.',
      actionItems: [
        'Adopt a heart-healthy diet low in saturated and trans fats',
        'Increase soluble fiber intake (oats, beans, apples)',
        'Include omega-3 fatty acids (fish, walnuts, flaxseed)',
        'Increase physical activity to raise HDL cholesterol',
        'Discuss statin therapy with your healthcare provider if appropriate'
      ]
    });
  }

  // Age-specific recommendations
  if (patientData.age >= 65) {
    recommendations.push({
      category: 'monitoring',
      priority: 'medium',
      title: 'Age-Related Cardiovascular Monitoring',
      description: 'As we age, cardiovascular risk naturally increases. Enhanced monitoring is important.',
      actionItems: [
        'Consider more frequent cardiovascular screenings',
        'Discuss aspirin therapy for primary prevention',
        'Monitor for signs of heart disease (chest pain, shortness of breath)',
        'Maintain social connections and mental health',
        'Consider cardiac rehabilitation programs if appropriate'
      ]
    });
  }

  // Family history recommendations
  if (patientData.familyHistory) {
    recommendations.push({
      category: 'monitoring',
      priority: 'medium',
      title: 'Family History Considerations',
      description: 'Your family history of heart disease increases your risk. Enhanced prevention is important.',
      actionItems: [
        'Inform all healthcare providers about your family history',
        'Consider earlier and more frequent cardiovascular screenings',
        'Be extra vigilant about lifestyle modifications',
        'Discuss genetic counseling if multiple family members are affected',
        'Share risk reduction strategies with family members'
      ]
    });
  }

  return recommendations;
}

/**
 * Sorts recommendations by priority (high -> medium -> low)
 */
function sortRecommendationsByPriority(recommendations: Recommendation[]): Recommendation[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return recommendations.sort((a, b) => {
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, sort by category (medical -> lifestyle -> monitoring)
    const categoryOrder = { medical: 3, lifestyle: 2, monitoring: 1 };
    const aCategoryPriority = categoryOrder[a.category];
    const bCategoryPriority = categoryOrder[b.category];
    
    return bCategoryPriority - aCategoryPriority;
  });
}

/**
 * Gets risk category color for UI display
 * @param category - Risk category
 * @returns Color code for UI styling
 */
export function getRiskCategoryColor(category: RiskCategory): string {
  switch (category) {
    case 'low':
      return '#22c55e'; // Green
    case 'moderate':
      return '#f59e0b'; // Yellow/Orange
    case 'high':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Gets risk category description for display
 * @param category - Risk category
 * @returns Human-readable description
 */
export function getRiskCategoryDescription(category: RiskCategory): string {
  switch (category) {
    case 'low':
      return 'Low Risk (<10%)';
    case 'moderate':
      return 'Moderate Risk (10-20%)';
    case 'high':
      return 'High Risk (≥20%)';
    default:
      return 'Unknown Risk';
  }
}

/**
 * Validates risk percentage is within expected range
 * @param riskPercentage - Risk percentage to validate
 * @returns True if valid, false otherwise
 */
export function isValidRiskPercentage(riskPercentage: number): boolean {
  return typeof riskPercentage === 'number' && 
         !isNaN(riskPercentage) && 
         riskPercentage >= 0 && 
         riskPercentage <= 100;
}

/**
 * Formats risk percentage for display
 * @param riskPercentage - Risk percentage
 * @returns Formatted string with percentage sign
 */
export function formatRiskPercentage(riskPercentage: number): string {
  if (!isValidRiskPercentage(riskPercentage)) {
    return 'Invalid';
  }
  
  return `${riskPercentage.toFixed(1)}%`;
}

/**
 * Gets priority icon for UI display
 * @param priority - Recommendation priority
 * @returns Icon identifier or emoji
 */
export function getPriorityIcon(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return '🔴'; // Red circle for high priority
    case 'medium':
      return '🟡'; // Yellow circle for medium priority
    case 'low':
      return '🟢'; // Green circle for low priority
    default:
      return '⚪'; // White circle for unknown
  }
}

/**
 * Gets category icon for UI display
 * @param category - Recommendation category
 * @returns Icon identifier or emoji
 */
export function getCategoryIcon(category: 'medical' | 'lifestyle' | 'monitoring'): string {
  switch (category) {
    case 'medical':
      return '🏥'; // Hospital for medical
    case 'lifestyle':
      return '🏃'; // Running person for lifestyle
    case 'monitoring':
      return '📊'; // Chart for monitoring
    default:
      return '📋'; // Clipboard for unknown
  }
}