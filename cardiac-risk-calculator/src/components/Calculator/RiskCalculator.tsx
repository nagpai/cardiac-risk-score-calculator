import { useState, useCallback, useContext, createContext } from 'react';
import { PatientDataForm } from '../Forms';
import { RiskGauge, RiskChart, Recommendations, ExportOptions } from '../Results';
import { LoadingSpinner, Button } from '../UI';
import { ProfileManager, ProfileSelector } from '../Profile';
import { calculateFraminghamRisk } from '../../utils/framingham';
import type { PatientData, RiskResult, PatientProfile } from '../../types';

// Context for sharing calculator state
interface CalculatorContextType {
  patientData: PatientData | null;
  riskResult: RiskResult | null;
  isCalculating: boolean;
  error: string | null;
  currentStep: 'input' | 'results';
  setPatientData: (data: PatientData | null) => void;
  setRiskResult: (result: RiskResult | null) => void;
  setCurrentStep: (step: 'input' | 'results') => void;
}

const CalculatorContext = createContext<CalculatorContextType | null>(null);

export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
};

interface RiskCalculatorProps {
  className?: string;
}

/**
 * Main calculator container component that manages the entire risk calculation flow
 * Handles state management, navigation between input and results, and error handling
 */
export default function RiskCalculator({ className = '' }: RiskCalculatorProps) {
  // State management
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'results'>('input');
  const [showProfileManager, setShowProfileManager] = useState(false);

  // Handle form submission and risk calculation
  const handleCalculateRisk = useCallback(async (data: PatientData) => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate risk using Framingham algorithm
      const result = calculateFraminghamRisk(data);
      
      // Update state
      setPatientData(data);
      setRiskResult(result);
      setCurrentStep('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Risk calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Handle returning to input form
  const handleBackToInput = useCallback(() => {
    setCurrentStep('input');
    setError(null);
  }, []);

  // Handle starting a new calculation
  const handleNewCalculation = useCallback(() => {
    setPatientData(null);
    setRiskResult(null);
    setCurrentStep('input');
    setError(null);
  }, []);

  // Handle data changes during form input (for real-time validation feedback)
  const handleDataChange = useCallback((_data: Partial<PatientData>) => {
    // This could be used for real-time validation or auto-save functionality
    // For now, we'll just clear any existing errors
    if (error) {
      setError(null);
    }
  }, [error]);

  // Handle loading a profile
  const handleLoadProfile = useCallback((profile: PatientProfile) => {
    setPatientData(profile.patientData);
    if (profile.riskResult) {
      setRiskResult(profile.riskResult);
      setCurrentStep('results');
    } else {
      setRiskResult(null);
      setCurrentStep('input');
    }
    setError(null);
  }, []);

  // Context value for child components
  const contextValue: CalculatorContextType = {
    patientData,
    riskResult,
    isCalculating,
    error,
    currentStep,
    setPatientData,
    setRiskResult,
    setCurrentStep,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      <div className={`max-w-4xl mx-auto ${className}`}>
        {/* Loading Overlay */}
        {isCalculating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <LoadingSpinner size="lg" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Calculating Risk</h3>
                <p className="text-sm text-gray-600">
                  Analyzing your cardiovascular risk factors...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Calculation Error
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setError(null)}
                    className="text-red-800 border-red-300 hover:bg-red-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              <li className="relative">
                <div className={`flex items-center ${currentStep === 'input' ? 'text-blue-600' : 'text-green-600'}`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === 'input' 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-green-600 bg-green-600 text-white'
                  }`}>
                    {currentStep === 'results' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">1</span>
                    )}
                  </div>
                  <span className="ml-3 text-sm font-medium">Enter Health Data</span>
                </div>
              </li>
              
              <div className="flex-1 mx-4">
                <div className={`h-0.5 ${currentStep === 'results' ? 'bg-green-600' : 'bg-gray-200'}`} />
              </div>
              
              <li className="relative">
                <div className={`flex items-center ${
                  currentStep === 'results' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === 'results' 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <span className="ml-3 text-sm font-medium">View Results</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        {currentStep === 'input' ? (
          <InputStep 
            onSubmit={handleCalculateRisk}
            onDataChange={handleDataChange}
            initialData={patientData}
            disabled={isCalculating}
            onLoadProfile={handleLoadProfile}
            onShowProfileManager={() => setShowProfileManager(true)}
          />
        ) : (
          <ResultsStep 
            riskResult={riskResult!}
            patientData={patientData!}
            onBackToInput={handleBackToInput}
            onNewCalculation={handleNewCalculation}
            onShowProfileManager={() => setShowProfileManager(true)}
          />
        )}

        {/* Profile Manager Modal */}
        <ProfileManager
          isOpen={showProfileManager}
          onClose={() => setShowProfileManager(false)}
          onLoadProfile={handleLoadProfile}
          currentPatientData={patientData || undefined}
          currentRiskResult={riskResult || undefined}
        />
      </div>
    </CalculatorContext.Provider>
  );
}

// Input Step Component
interface InputStepProps {
  onSubmit: (data: PatientData) => void;
  onDataChange: (data: Partial<PatientData>) => void;
  initialData: PatientData | null;
  disabled: boolean;
  onLoadProfile: (profile: PatientProfile) => void;
  onShowProfileManager: () => void;
}

function InputStep({ onSubmit, onDataChange, initialData, disabled, onLoadProfile, onShowProfileManager }: InputStepProps) {
  return (
    <div className="space-y-6">
      {/* Profile Selector */}
      <ProfileSelector
        onLoadProfile={onLoadProfile}
        onManageProfiles={onShowProfileManager}
        disabled={disabled}
      />

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cardiovascular Risk Assessment
          </h2>
          <p className="text-gray-600">
            Please provide your health information to calculate your 10-year cardiovascular risk 
            using the scientifically validated Framingham Risk Score.
          </p>
        </div>

        <PatientDataForm
          onSubmit={onSubmit}
          onDataChange={onDataChange}
          initialData={initialData || undefined}
          disabled={disabled}
          showProgress={true}
        />
      </div>
    </div>
  );
}

// Results Step Component
interface ResultsStepProps {
  patientData: PatientData;
  riskResult: RiskResult;
  onBackToInput: () => void;
  onNewCalculation: () => void;
  onShowProfileManager: () => void;
}

function ResultsStep({ riskResult, patientData, onBackToInput, onNewCalculation, onShowProfileManager }: ResultsStepProps) {
  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Cardiovascular Risk Assessment
            </h2>
            <p className="text-gray-600">
              Based on the Framingham Heart Study algorithm
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Export Options */}
            <ExportOptions 
              riskResult={riskResult} 
              patientData={patientData}
              className="order-1 sm:order-2"
            />
            
            {/* Action Buttons */}
            <div className="flex space-x-3 order-2 sm:order-1">
              <Button
                variant="outline"
                onClick={onBackToInput}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Edit Data
              </Button>
              <Button
                variant="primary"
                onClick={onShowProfileManager}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Profile
              </Button>
              <Button
                variant="outline"
                onClick={onNewCalculation}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Calculation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskGauge riskResult={riskResult} />
        <RiskChart riskResult={riskResult} />
      </div>

      {/* Recommendations */}
      <Recommendations riskResult={riskResult} />

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Medical Disclaimer
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This calculator is for educational purposes only and should not replace professional 
                medical advice. The Framingham Risk Score is one of several risk assessment tools 
                and may not account for all individual risk factors. Please consult with your 
                healthcare provider for personalized medical advice and treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}