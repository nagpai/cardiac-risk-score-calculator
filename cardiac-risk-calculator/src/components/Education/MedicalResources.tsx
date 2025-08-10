import React from 'react';

interface MedicalResource {
  title: string;
  description: string;
  url: string;
  organization: string;
  category: 'guidelines' | 'education' | 'tools' | 'research';
}

interface MedicalResourcesProps {
  className?: string;
  category?: 'guidelines' | 'education' | 'tools' | 'research' | 'all';
}

const medicalResources: MedicalResource[] = [
  // Guidelines
  {
    title: 'AHA/ACC Guideline on the Primary Prevention of Cardiovascular Disease',
    description: 'Comprehensive guidelines for preventing cardiovascular disease in adults.',
    url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000678',
    organization: 'American Heart Association / American College of Cardiology',
    category: 'guidelines'
  },
  {
    title: 'ESC Guidelines on Cardiovascular Disease Prevention',
    description: 'European Society of Cardiology guidelines for cardiovascular disease prevention.',
    url: 'https://academic.oup.com/eurheartj/article/42/34/3227/6358713',
    organization: 'European Society of Cardiology',
    category: 'guidelines'
  },

  // Education
  {
    title: 'Heart Disease and Stroke Statistics',
    description: 'Annual update on heart disease and stroke statistics from the American Heart Association.',
    url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001123',
    organization: 'American Heart Association',
    category: 'education'
  },
  {
    title: 'Know Your Risk Factors for Heart Disease',
    description: 'Educational resource about cardiovascular risk factors from the CDC.',
    url: 'https://www.cdc.gov/heartdisease/risk_factors.htm',
    organization: 'Centers for Disease Control and Prevention',
    category: 'education'
  },
  {
    title: 'Heart-Healthy Living',
    description: 'Comprehensive guide to heart-healthy lifestyle choices.',
    url: 'https://www.nhlbi.nih.gov/health/heart-healthy-living',
    organization: 'National Heart, Lung, and Blood Institute',
    category: 'education'
  },

  // Tools
  {
    title: 'ASCVD Risk Estimator Plus',
    description: 'Professional cardiovascular risk assessment tool from the American College of Cardiology.',
    url: 'https://tools.acc.org/ascvd-risk-estimator-plus/',
    organization: 'American College of Cardiology',
    category: 'tools'
  },
  {
    title: 'My Life Check - Life\'s Simple 7',
    description: 'Interactive tool to assess and improve your cardiovascular health.',
    url: 'https://www.heart.org/en/healthy-living/healthy-lifestyle/my-life-check--lifes-simple-7',
    organization: 'American Heart Association',
    category: 'tools'
  },

  // Research
  {
    title: 'Framingham Heart Study',
    description: 'Official website of the landmark Framingham Heart Study.',
    url: 'https://www.framinghamheartstudy.org/',
    organization: 'Boston University and NHLBI',
    category: 'research'
  },
  {
    title: 'Pooled Cohort Equations for ASCVD Risk',
    description: 'Research on the development and validation of cardiovascular risk prediction equations.',
    url: 'https://www.ahajournals.org/doi/10.1161/01.cir.0000437741.48606.98',
    organization: 'American Heart Association',
    category: 'research'
  }
];

export const MedicalResources: React.FC<MedicalResourcesProps> = ({ 
  className = '', 
  category = 'all' 
}) => {
  const filteredResources = category === 'all' 
    ? medicalResources 
    : medicalResources.filter(resource => resource.category === category);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'guidelines':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'tools':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'research':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'guidelines':
        return 'Clinical Guidelines';
      case 'education':
        return 'Patient Education';
      case 'tools':
        return 'Assessment Tools';
      case 'research':
        return 'Research & Studies';
      default:
        return cat;
    }
  };

  return (
    <div className={`medical-resources ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Medical Resources & Guidelines
          </h3>
          <p className="text-gray-600 text-sm">
            Authoritative resources from leading medical organizations for further information 
            about cardiovascular health and risk assessment.
          </p>
        </div>

        <div className="space-y-4">
          {filteredResources.map((resource, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(resource.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getCategoryLabel(resource.category)}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline"
                      aria-describedby={`resource-desc-${index}`}
                    >
                      {resource.title}
                      <svg
                        className="w-4 h-4 inline ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </h4>
                  <p
                    id={`resource-desc-${index}`}
                    className="text-gray-600 text-sm mb-2"
                  >
                    {resource.description}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Source: {resource.organization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                External Links Disclaimer
              </h4>
              <p className="text-yellow-800 text-xs">
                These links are provided for informational purposes only. We do not endorse 
                or guarantee the accuracy of external content. Always consult with your 
                healthcare provider for medical advice specific to your situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};