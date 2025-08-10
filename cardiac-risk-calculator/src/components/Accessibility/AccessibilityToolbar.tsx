import React, { useState } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';
import { Button } from '../UI';

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ className = '' }) => {
  const {
    isHighContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    announceToScreenReader
  } = useAccessibilityContext();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleToolbar = () => {
    setIsExpanded(!isExpanded);
    announceToScreenReader(
      `Accessibility toolbar ${!isExpanded ? 'expanded' : 'collapsed'}`,
      'polite'
    );
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announceToScreenReader(
      `High contrast mode ${!isHighContrast ? 'enabled' : 'disabled'}`,
      'assertive'
    );
  };

  const handleFontSizeChange = (newSize: 'normal' | 'large' | 'extra-large') => {
    setFontSize(newSize);
    const sizeLabels = {
      normal: 'normal',
      large: 'large',
      'extra-large': 'extra large'
    };
    announceToScreenReader(`Font size changed to ${sizeLabels[newSize]}`, 'polite');
  };

  const skipToMainContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Skipped to main content', 'polite');
    }
  };

  return (
    <div className={`accessibility-toolbar ${className}`}>
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => {
          e.preventDefault();
          skipToMainContent();
        }}
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar Toggle */}
      <div className="fixed top-0 right-0 z-40">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleToggleToolbar}
          className="rounded-none rounded-bl-md"
          aria-expanded={isExpanded}
          aria-controls="accessibility-panel"
          aria-label="Toggle accessibility options"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="ml-1">Accessibility</span>
        </Button>

        {/* Accessibility Panel */}
        {isExpanded && (
          <div
            id="accessibility-panel"
            className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg p-4 space-y-4"
            role="region"
            aria-label="Accessibility options"
          >
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Accessibility Options
            </h3>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast-toggle" className="text-sm font-medium text-gray-700">
                High Contrast Mode
              </label>
              <button
                id="high-contrast-toggle"
                type="button"
                role="switch"
                aria-checked={isHighContrast}
                onClick={handleHighContrastToggle}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isHighContrast ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span className="sr-only">Toggle high contrast mode</span>
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isHighContrast ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Font Size Controls */}
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-2">Font Size</legend>
                <div className="space-y-2">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'large', label: 'Large' },
                    { value: 'extra-large', label: 'Extra Large' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="font-size"
                        value={option.value}
                        checked={fontSize === option.value}
                        onChange={() => handleFontSizeChange(option.value as any)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> Navigate forward</div>
                <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Tab</kbd> Navigate backward</div>
                <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter/Space</kbd> Activate buttons</div>
                <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Arrow keys</kbd> Navigate radio groups</div>
                <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> Close dialogs</div>
              </div>
            </div>

            {/* Close Button */}
            <div className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleToolbar}
                className="w-full"
              >
                Close Accessibility Options
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};