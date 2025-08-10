import React, { useEffect, useRef } from 'react';
import { Modal } from '../UI';
import { useFocusManagement } from '../../hooks/useAccessibility';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: 'framingham' | 'risk-factors' | 'prevention' | 'general';
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, 
  onClose, 
  topic = 'general' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { focusFirst, trapFocus } = useFocusManagement(modalRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (isOpen) {
      // Focus the first element when modal opens
      setTimeout(() => focusFirst(), 100);
    }
  }, [isOpen, focusFirst]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Tab') {
      trapFocus(event.nativeEvent);
    }
  };

  const getContent = () => {
    switch (topic) {
      case 'framingham':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                About the Framingham Heart Study
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>
                  The Framingham Heart Study is one of the most important epidemiological studies 
                  in medical history. Started in 1948 in Framingham, Massachusetts, this landmark 
                  study has followed multiple generations of participants to understand the 
                  development of cardiovascular disease.
                </p>
                <p>
                  The study has provided crucial insights into the major risk factors for heart 
                  disease and stroke, including high blood pressure, high cholesterol, smoking, 
                  obesity, diabetes, and physical inactivity.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                The Framingham Risk Score
              </h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>
                  The Framingham Risk Score is a gender-specific algorithm used to estimate the 
                  10-year cardiovascular risk of an individual. It was developed using data from 
                  the Framingham Heart Study and has been validated in multiple populations.
                </p>
                <p>
                  The score takes into account several key factors:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Age</li>
                  <li>Gender</li>
                  <li>Total cholesterol level</li>
                  <li>HDL cholesterol level</li>
                  <li>Systolic blood pressure</li>
                  <li>Blood pressure medication use</li>
                  <li>Smoking status</li>
                  <li>Diabetes status</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                Scientific Validation
              </h4>
              <p className="text-blue-800 text-sm">
                The Framingham Risk Score has been extensively validated and is recommended by 
                major medical organizations including the American Heart Association and the 
                American College of Cardiology for cardiovascular risk assessment.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Limitations
              </h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>
                  While the Framingham Risk Score is a valuable tool, it has some limitations:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>It was developed primarily in a white, middle-class population</li>
                  <li>It may underestimate risk in certain ethnic groups</li>
                  <li>It doesn't account for family history or other emerging risk factors</li>
                  <li>It's most accurate for the 30-79 age range</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'risk-factors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Understanding Risk Factors
              </h3>
              <p className="text-gray-700 mb-4">
                Cardiovascular risk factors are conditions or behaviors that increase your 
                likelihood of developing heart disease or having a cardiac event.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Non-Modifiable Risk Factors
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  These factors cannot be changed but are important to understand:
                </p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li><strong>Age:</strong> Risk increases with age</li>
                  <li><strong>Gender:</strong> Men have higher risk at younger ages</li>
                  <li><strong>Family History:</strong> Genetic predisposition to heart disease</li>
                  <li><strong>Ethnicity:</strong> Some ethnic groups have higher risk</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Modifiable Risk Factors
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  These factors can be controlled through lifestyle changes and medical treatment:
                </p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li><strong>High Blood Pressure:</strong> Can be controlled with medication and lifestyle</li>
                  <li><strong>High Cholesterol:</strong> Manageable through diet, exercise, and medication</li>
                  <li><strong>Smoking:</strong> Quitting provides immediate and long-term benefits</li>
                  <li><strong>Diabetes:</strong> Good blood sugar control reduces risk</li>
                  <li><strong>Obesity:</strong> Weight loss can significantly reduce risk</li>
                  <li><strong>Physical Inactivity:</strong> Regular exercise is protective</li>
                  <li><strong>Poor Diet:</strong> Heart-healthy eating patterns reduce risk</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-green-900 mb-2">
                Good News!
              </h4>
              <p className="text-green-800 text-sm">
                Most cardiovascular risk factors are modifiable. Even small improvements in 
                lifestyle can lead to significant reductions in cardiovascular risk.
              </p>
            </div>
          </div>
        );

      case 'prevention':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Cardiovascular Disease Prevention
              </h3>
              <p className="text-gray-700 mb-4">
                Prevention is the most effective approach to reducing cardiovascular disease. 
                The earlier you start, the greater the benefits.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Primary Prevention
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Preventing cardiovascular disease before it occurs:
                </p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Maintain healthy lifestyle from early age</li>
                  <li>• Regular health screenings</li>
                  <li>• Control risk factors before disease develops</li>
                  <li>• Preventive medications when appropriate</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Secondary Prevention
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Preventing further events after cardiovascular disease is diagnosed:
                </p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Aggressive risk factor modification</li>
                  <li>• Cardiac rehabilitation programs</li>
                  <li>• Optimal medical therapy</li>
                  <li>• Regular monitoring and follow-up</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-blue-900 mb-3">
                The ABCDE Approach to Prevention
              </h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li><strong>A</strong> - Aspirin and ACE inhibitors (when appropriate)</li>
                <li><strong>B</strong> - Blood pressure control and Beta-blockers</li>
                <li><strong>C</strong> - Cholesterol management and Cigarette cessation</li>
                <li><strong>D</strong> - Diabetes control and Diet modification</li>
                <li><strong>E</strong> - Exercise and Education</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Lifestyle Modifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">Diet</h5>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Mediterranean or DASH diet</li>
                    <li>• Reduce saturated and trans fats</li>
                    <li>• Increase fruits and vegetables</li>
                    <li>• Choose whole grains</li>
                    <li>• Limit sodium intake</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">Exercise</h5>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• 150 minutes moderate activity/week</li>
                    <li>• Or 75 minutes vigorous activity/week</li>
                    <li>• Strength training 2+ days/week</li>
                    <li>• Start slowly and progress gradually</li>
                    <li>• Find activities you enjoy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How to Use This Calculator
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>
                  This cardiovascular risk calculator helps you estimate your 10-year risk of 
                  experiencing a heart attack or stroke using the scientifically validated 
                  Framingham Risk Score.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Step-by-Step Instructions
              </h4>
              <ol className="text-gray-700 text-sm space-y-3 list-decimal list-inside">
                <li>
                  <strong>Enter your basic information:</strong> Age and gender are required 
                  as they are major factors in cardiovascular risk.
                </li>
                <li>
                  <strong>Input cholesterol levels:</strong> You'll need recent blood test 
                  results for total cholesterol and HDL cholesterol. You can enter values 
                  in either mg/dL or mmol/L.
                </li>
                <li>
                  <strong>Provide blood pressure readings:</strong> Enter your systolic 
                  (top number) and diastolic (bottom number) blood pressure values.
                </li>
                <li>
                  <strong>Answer health questions:</strong> Indicate your smoking status, 
                  diabetes status, and family history of heart disease.
                </li>
                <li>
                  <strong>Review and calculate:</strong> Once all required fields are 
                  completed, click "Calculate Risk Score" to see your results.
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-yellow-900 mb-2">
                Important Notes
              </h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Use recent lab values (within the last year)</li>
                <li>• This calculator is for ages 30-79 years</li>
                <li>• Results are estimates based on population data</li>
                <li>• Always discuss results with your healthcare provider</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Understanding Your Results
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Low Risk (&lt;10%)</p>
                    <p className="text-gray-600 text-sm">Continue healthy lifestyle habits</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Moderate Risk (10-20%)</p>
                    <p className="text-gray-600 text-sm">Consider lifestyle changes and medical consultation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">High Risk (≥20%)</p>
                    <p className="text-gray-600 text-sm">Seek immediate medical attention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Information"
      size="xl"
    >
      <div 
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="max-h-96 overflow-y-auto"
        tabIndex={-1}
      >
        {getContent()}
      </div>
    </Modal>
  );
};