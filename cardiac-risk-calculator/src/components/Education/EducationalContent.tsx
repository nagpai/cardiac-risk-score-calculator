import React from 'react';

interface EducationalContentProps {
  className?: string;
}

export const EducationalContent: React.FC<EducationalContentProps> = ({ className = '' }) => {
  return (
    <div className={`educational-content ${className}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Cardiovascular Risk
          </h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Cardiovascular disease is the leading cause of death worldwide. Understanding your risk 
              factors and taking preventive measures can significantly reduce your chances of developing 
              heart disease or experiencing a cardiac event such as a heart attack or stroke.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This calculator uses the Framingham Risk Score, a scientifically validated tool developed 
              from the landmark Framingham Heart Study, to estimate your 10-year risk of experiencing 
              a cardiovascular event.
            </p>
          </div>
        </section>

        {/* Risk Factors */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Key Risk Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Age
              </h4>
              <p className="text-gray-600 text-sm">
                Age is one of the strongest predictors of cardiovascular risk. Risk increases 
                significantly with age, particularly after 45 for men and 55 for women.
              </p>
            </div>

            {/* Gender */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Gender
              </h4>
              <p className="text-gray-600 text-sm">
                Men generally have higher cardiovascular risk at younger ages. Women's risk 
                increases significantly after menopause due to hormonal changes.
              </p>
            </div>

            {/* Cholesterol */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Cholesterol Levels
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                Cholesterol levels significantly impact cardiovascular risk:
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li><strong>Total Cholesterol:</strong> Higher levels increase risk</li>
                <li><strong>HDL (Good) Cholesterol:</strong> Higher levels are protective</li>
                <li><strong>LDL (Bad) Cholesterol:</strong> Higher levels increase risk</li>
              </ul>
            </div>

            {/* Blood Pressure */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Blood Pressure
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                High blood pressure (hypertension) is a major risk factor:
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li><strong>Normal:</strong> Less than 120/80 mmHg</li>
                <li><strong>Elevated:</strong> 120-129/less than 80 mmHg</li>
                <li><strong>High:</strong> 130/80 mmHg or higher</li>
              </ul>
            </div>

            {/* Smoking */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Smoking
              </h4>
              <p className="text-gray-600 text-sm">
                Smoking dramatically increases cardiovascular risk by damaging blood vessels, 
                reducing oxygen in blood, and increasing blood clot formation. Quitting smoking 
                provides immediate and long-term benefits.
              </p>
            </div>

            {/* Diabetes */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Diabetes
              </h4>
              <p className="text-gray-600 text-sm">
                Diabetes significantly increases cardiovascular risk by damaging blood vessels 
                and nerves. Good blood sugar control can help reduce this risk.
              </p>
            </div>
          </div>
        </section>

        {/* Risk Categories */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Understanding Your Risk Level
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-green-800 mb-2 flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                Low Risk (Less than 10%)
              </h4>
              <p className="text-green-700 text-sm">
                You have a low risk of experiencing a cardiovascular event in the next 10 years. 
                Continue maintaining healthy lifestyle habits including regular exercise, healthy diet, 
                and avoiding smoking.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-yellow-800 mb-2 flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                Moderate Risk (10-20%)
              </h4>
              <p className="text-yellow-700 text-sm">
                You have a moderate risk that warrants attention. Consider lifestyle modifications 
                and discuss with your healthcare provider about preventive measures, which may 
                include medication.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-red-800 mb-2 flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                High Risk (20% or Higher)
              </h4>
              <p className="text-red-700 text-sm">
                You have a high risk that requires immediate attention. It's important to work 
                closely with your healthcare provider to develop a comprehensive prevention plan, 
                which likely includes medication and aggressive lifestyle changes.
              </p>
            </div>
          </div>
        </section>

        {/* Prevention Strategies */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Prevention Strategies
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-blue-900 mb-3">Lifestyle Changes</h4>
                <ul className="text-blue-800 text-sm space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Regular physical activity (150 minutes/week)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Heart-healthy diet (Mediterranean or DASH)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Maintain healthy weight
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Quit smoking and avoid secondhand smoke
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Limit alcohol consumption
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Manage stress effectively
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium text-blue-900 mb-3">Medical Management</h4>
                <ul className="text-blue-800 text-sm space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Regular health screenings
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Blood pressure management
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cholesterol management
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Diabetes control
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Aspirin therapy (when appropriate)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Statin therapy (when indicated)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Important Disclaimer */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Important Medical Disclaimer
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            This calculator is for educational purposes only and should not replace professional 
            medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
            providers regarding your cardiovascular health and any medical concerns. The 
            Framingham Risk Score is one of many tools used in cardiovascular risk assessment 
            and may not account for all individual risk factors.
          </p>
        </section>
      </div>
    </div>
  );
};