import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../UI';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Generic error boundary component that catches JavaScript errors anywhere in the child component tree
 * Provides fallback UI and error recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (if available)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error reporting service
    // For now, we'll just log it with structured data
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    };

    console.error('Error Report:', errorReport);
    
    // Store error in localStorage for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const existingErrors = JSON.parse(localStorage.getItem('errorBoundaryLogs') || '[]');
        existingErrors.push(errorReport);
        // Keep only last 10 errors
        const recentErrors = existingErrors.slice(-10);
        localStorage.setItem('errorBoundaryLogs', JSON.stringify(recentErrors));
      } catch (e) {
        console.warn('Failed to store error log:', e);
      }
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportIssue = () => {
    const { error, errorInfo, eventId } = this.state;
    
    // Create a pre-filled issue report
    const issueBody = encodeURIComponent(`
**Error ID:** ${eventId}

**Error Message:** ${error?.message || 'Unknown error'}

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || 'Not available'}
\`\`\`

**Browser:** ${navigator.userAgent}

**URL:** ${window.location.href}

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Additional Context:**

    `.trim());

    // In a real application, this would open your issue tracker
    console.log('Issue report data:', { eventId, error, errorInfo, issueBody });
    alert('Error details have been logged. Please contact support with Error ID: ' + eventId);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Something went wrong
                </h2>
                
                <p className="text-sm text-gray-600 mb-6">
                  We encountered an unexpected error. This has been logged and we'll look into it.
                </p>

                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-left">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Development Error Details:
                    </h3>
                    <div className="text-xs text-red-700 font-mono">
                      <div className="mb-2">
                        <strong>Error:</strong> {error?.message}
                      </div>
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-xs">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={this.handleRetry}
                    variant="primary"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="w-full"
                  >
                    Reload Page
                  </Button>
                  
                  <Button
                    onClick={this.handleReportIssue}
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-600"
                  >
                    Report Issue
                  </Button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  Error ID: {this.state.eventId}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;