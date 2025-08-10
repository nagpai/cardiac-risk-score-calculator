import { useState } from 'react';
import type { RiskResult, PatientData } from '../../types';
import { 
  getRiskCategoryColor, 
  getPriorityIcon, 
  getCategoryIcon 
} from '../../utils/riskCategorization';

interface RecommendationsProps {
  riskResult: RiskResult;
  patientData?: PatientData;
  className?: string;
}

/**
 * Recommendations component displays risk-appropriate advice and action items
 * based on the patient's cardiovascular risk level and specific risk factors
 */
export default function Recommendations({ riskResult, className = '' }: Omit<RecommendationsProps, 'patientData'>) {
  const { recommendations, riskCategory, tenYearRisk } = riskResult;
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set([0])); // First recommendation expanded by default
  
  // Get color based on risk category
  const riskColor = getRiskCategoryColor(riskCategory);
  
  // Toggle recommendation expansion
  const toggleRecommendation = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '#ef4444'; // Red
      case 'medium':
        return '#f59e0b'; // Orange
      case 'low':
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  // Get category color
  const getCategoryColor = (category: 'medical' | 'lifestyle' | 'monitoring') => {
    switch (category) {
      case 'medical':
        return '#3b82f6'; // Blue
      case 'lifestyle':
        return '#10b981'; // Emerald
      case 'monitoring':
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommendations
        </h3>
        <p className="text-gray-600">No specific recommendations available.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Personalized Recommendations
        </h3>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: riskColor }}
            aria-label={`${riskCategory} risk indicator`}
          />
          <span className="text-sm font-medium text-gray-700">
            {tenYearRisk.toFixed(1)}% Risk
          </span>
        </div>
      </div>

      {/* Risk Category Summary */}
      <div 
        className="rounded-lg p-4 mb-6"
        style={{ backgroundColor: `${riskColor}15`, borderLeft: `4px solid ${riskColor}` }}
      >
        <p className="text-sm text-gray-700">
          Based on your {riskCategory} cardiovascular risk level, here are personalized 
          recommendations to help reduce your risk and improve your heart health.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const isExpanded = expandedRecommendations.has(index);
          const priorityColor = getPriorityColor(recommendation.priority);
          const categoryColor = getCategoryColor(recommendation.category);
          
          return (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Recommendation Header */}
              <button
                onClick={() => toggleRecommendation(index)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={isExpanded}
                aria-controls={`recommendation-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Priority Indicator */}
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityColor }}
                      title={`${recommendation.priority} priority`}
                    />
                    
                    {/* Category Icon */}
                    <span className="text-lg" title={recommendation.category}>
                      {getCategoryIcon(recommendation.category)}
                    </span>
                    
                    {/* Title */}
                    <h4 className="font-medium text-gray-900">
                      {recommendation.title}
                    </h4>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Recommendation Content */}
              {isExpanded && (
                <div 
                  id={`recommendation-${index}`}
                  className="px-4 py-4 bg-white"
                >
                  {/* Description */}
                  <p className="text-gray-700 mb-4">
                    {recommendation.description}
                  </p>

                  {/* Action Items */}
                  {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Action Items:</h5>
                      <ul className="space-y-2">
                        {recommendation.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resources */}
                  {recommendation.resources && recommendation.resources.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Additional Resources:</h5>
                      <div className="space-y-2">
                        {recommendation.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="bg-blue-50 rounded-lg p-3">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              {resource.title} ↗
                            </a>
                            <p className="text-xs text-gray-600 mt-1">
                              {resource.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority and Category Tags */}
                  <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${priorityColor}20`, 
                        color: priorityColor 
                      }}
                    >
                      {getPriorityIcon(recommendation.priority)} {recommendation.priority} priority
                    </span>
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${categoryColor}20`, 
                        color: categoryColor 
                      }}
                    >
                      {getCategoryIcon(recommendation.category)} {recommendation.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Important Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg 
            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Medical Disclaimer</h4>
            <p className="text-sm text-yellow-700 mt-1">
              These recommendations are for educational purposes only and should not replace 
              professional medical advice. Always consult with your healthcare provider before 
              making significant changes to your health management plan.
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility information */}
      <div className="sr-only">
        {recommendations.length} personalized recommendations available based on your 
        {riskCategory} risk level. Recommendations include {
          recommendations.filter(r => r.priority === 'high').length
        } high priority, {
          recommendations.filter(r => r.priority === 'medium').length
        } medium priority, and {
          recommendations.filter(r => r.priority === 'low').length
        } low priority items.
      </div>
    </div>
  );
}