import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../UI';
import type { PatientData } from '../../types';

interface Props {
  children: ReactNode;
  patientData?: PatientData;
  onRetry?: () => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'validation' | 'calculation' | 'unknown';
}

/**
 * Specialized error boundary for calculation-related errors
 * Provides context-aware error messages and recovery options
 */
export class CalculationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message or type
    let errorType: 'validation' | 'calculation' | 'unknown' = 'unknown';
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorType = 'validation';
    } else if (error.message.includes('calculation') || error.message.includes('framingham')) {
      errorType = 'calculation';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CalculationErrorBoundary caught an error:', error, errorInfo);
    
    // Log calculation-specific context
    const calculationContext = {
      patientData: this.props.patientData,
      timestamp: new Date().toISOString(),
      errorType: this.state.errorType,
    };
    
    console.error('Calculation context:', calculationContext);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when patient data changes
    if (this.state.hasError && prevProps.patientData !== this.props.patientData) {
      this.setState({
        hasError: false,
        error: null,
        errorType: 'unknown',
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'unknown',
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'unknown',
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private getErrorMessage = () => {
    const { error, errorType } = this.state;
    
    switch (errorType) {
      case 'validation':
        return {
          title: 'Invalid Input Data',
          message: 'There was an issue with the provided health data. Please check your inputs and try again.',
          suggestion: 'Verify that all values are within the expected medical ranges.',
        };
      case 'calculation':
        return {
          title: 'Calculation Error',
          message: 'We encountered an error while calculating your cardiovascular risk.',
          suggestion: 'This may be due to an unusual combination of risk factors. Please try again or contact support.',
        };
      default:
        return {
          title: 'Unexpected Error',
          message: error?.message || 'An unexpected error occurred during risk calculation.',
          suggestion: 'Please try again. If the problem persists, contact support.',
        };
    }
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      const errorInfo = this.getErrorMessage();
      
      return (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {errorInfo.title}
              </h3>
              
              <p className="text-sm text-red-800 mb-3">
                {errorInfo.message}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-700">
                  <strong>Suggestion:</strong> {errorInfo.suggestion}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Development Error Details:
                  </h4>
                  <div className="text-xs text-gray-700 font-mono">
                    {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  size="sm"
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default CalculationErrorBoundary;