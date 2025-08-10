

import { lazy, Suspense } from 'react';
import { AccessibilityProvider, AccessibilityToolbar } from './components/Accessibility';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/UI';
import { RiskCalculator as DirectRiskCalculator } from './components/Calculator';

// Lazy load the main calculator component for code splitting
const LazyRiskCalculator = lazy(() => 
  import('./components/Calculator').then(module => ({ default: module.RiskCalculator }))
);

// Use direct import in test mode, lazy loading in production
const isTest = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test';
const RiskCalculator = isTest ? DirectRiskCalculator : LazyRiskCalculator;

function App() {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
        
        {/* Skip Links */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        
        <header className="bg-white shadow-sm" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg"
                  aria-hidden="true"
                >
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Cardiac Risk Calculator
                  </h1>
                  <p className="text-sm text-gray-600">
                    Framingham Heart Study Risk Assessment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main 
          id="main-content"
          className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
          role="main"
          tabIndex={-1}
        >
          <div className="px-4 py-6 sm:px-0">
            <ErrorBoundary
              onError={(error, errorInfo) => {
                console.error('Application error:', error, errorInfo);
                // In a real app, you would send this to an error reporting service
              }}
              resetOnPropsChange={true}
              resetKeys={[window.location.pathname]}
            >
              {isTest ? (
                <RiskCalculator />
              ) : (
                <Suspense 
                  fallback={
                    <div className="flex justify-center items-center min-h-96">
                      <LoadingSpinner size="lg" />
                    </div>
                  }
                >
                  <RiskCalculator />
                </Suspense>
              )}
            </ErrorBoundary>
          </div>
        </main>
        
        <footer className="bg-white border-t" role="contentinfo">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                This calculator is for educational purposes only and should not replace professional medical advice.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>Based on Framingham Heart Study</span>
                <span aria-hidden="true">•</span>
                <span>Version 2008</span>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Live region for screen reader announcements */}
        <div
          id="sr-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        
        <div
          id="sr-alert-region"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </AccessibilityProvider>
  );
}

export default App;
