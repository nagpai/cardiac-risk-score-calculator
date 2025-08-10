import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../UI';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fieldName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Specialized error boundary for form-related errors
 * Provides graceful degradation for form validation and input handling errors
 */
export class FormErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FormErrorBoundary caught an error:', error, errorInfo);
    
    // Log form-specific context
    const formContext = {
      fieldName: this.props.fieldName,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    };
    
    console.error('Form error context:', formContext);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when fieldName changes (different field)
    if (this.state.hasError && prevProps.fieldName !== this.props.fieldName) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: 0,
      });
    }
  }

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: newRetryCount,
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private isRetryAvailable = () => {
    return this.state.retryCount < this.maxRetries;
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fieldName } = this.props;

    if (hasError) {
      const isFormField = !!fieldName;
      
      return (
        <div className={`${isFormField ? 'border border-red-300 rounded-md p-3 bg-red-50' : 'bg-white rounded-lg shadow-lg p-6 border border-red-200'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className={`${isFormField ? 'h-4 w-4' : 'h-5 w-5'} text-red-600`}
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
            
            <div className="ml-2 flex-1">
              <h3 className={`${isFormField ? 'text-sm' : 'text-lg'} font-medium text-red-900 mb-1`}>
                {isFormField ? `Error in ${fieldName}` : 'Form Error'}
              </h3>
              
              <p className={`${isFormField ? 'text-xs' : 'text-sm'} text-red-800 mb-2`}>
                {isFormField 
                  ? 'This form field encountered an error and cannot be displayed properly.'
                  : 'The form encountered an error and cannot be displayed properly.'
                }
              </p>

              {retryCount > 0 && (
                <p className={`${isFormField ? 'text-xs' : 'text-sm'} text-red-700 mb-2`}>
                  Retry attempt {retryCount} of {this.maxRetries}
                </p>
              )}

              {process.env.NODE_ENV === 'development' && error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-xs">
                  <strong>Error:</strong> {error.message}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                {this.isRetryAvailable() && (
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    size={isFormField ? 'xs' : 'sm'}
                    className="text-red-800 border-red-300 hover:bg-red-100"
                  >
                    Retry ({this.maxRetries - retryCount} left)
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size={isFormField ? 'xs' : 'sm'}
                  className="text-red-800 border-red-300 hover:bg-red-100"
                >
                  {isFormField ? 'Reset Field' : 'Reset Form'}
                </Button>
              </div>

              {!this.isRetryAvailable() && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className={`${isFormField ? 'text-xs' : 'text-sm'} text-yellow-800`}>
                    Maximum retry attempts reached. Please refresh the page or contact support if the problem persists.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default FormErrorBoundary;