import React, { useState, useRef, useEffect } from 'react';
import { useAccessibilityContext } from '../Accessibility/AccessibilityProvider';

interface EnhancedTooltipProps {
  content: string;
  detailedContent?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  disabled?: boolean;
  showOnFocus?: boolean;
  showOnHover?: boolean;
  maxWidth?: string;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  detailedContent,
  children,
  position = 'top',
  className = '',
  disabled = false,
  showOnFocus = true,
  showOnHover = true,
  maxWidth = '300px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { announceToScreenReader } = useAccessibilityContext();

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      if (!isFocused) {
        setIsVisible(false);
        setShowDetailed(false);
      }
    }, 100);
  };

  const handleFocus = () => {
    if (!showOnFocus) return;
    setIsFocused(true);
    showTooltip();
    // Announce tooltip content to screen readers
    announceToScreenReader(`Help: ${content}`, 'polite');
  };

  const handleBlur = () => {
    setIsFocused(false);
    hideTooltip();
  };

  const handleMouseEnter = () => {
    if (!showOnHover) return;
    showTooltip();
  };

  const handleMouseLeave = () => {
    if (!showOnHover) return;
    hideTooltip();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsVisible(false);
      setShowDetailed(false);
      setIsFocused(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (detailedContent && isVisible) {
        event.preventDefault();
        setShowDetailed(!showDetailed);
        announceToScreenReader(
          showDetailed ? 'Collapsed detailed help' : 'Expanded detailed help',
          'polite'
        );
      }
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900';
    }
  };

  // Auto-position tooltip if it would go off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust position if tooltip goes off-screen
      if (rect.right > viewportWidth) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0';
      }
      if (rect.left < 0) {
        tooltip.style.left = '0';
        tooltip.style.right = 'auto';
      }
      if (rect.bottom > viewportHeight) {
        tooltip.style.top = 'auto';
        tooltip.style.bottom = '100%';
      }
      if (rect.top < 0) {
        tooltip.style.top = '100%';
        tooltip.style.bottom = 'auto';
      }
    }
  }, [isVisible, showDetailed]);

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {children}
      
      {(isVisible || isFocused) && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg
            ${getPositionStyles()}
          `.trim()}
          style={{ maxWidth }}
          role="tooltip"
          aria-hidden={!isVisible && !isFocused}
          id={`tooltip-${Math.random().toString(36).substr(2, 9)}`}
        >
          <div className="space-y-2">
            <div>{content}</div>
            
            {detailedContent && (
              <div>
                <button
                  type="button"
                  className="text-xs text-blue-200 hover:text-blue-100 underline focus:outline-none focus:ring-1 focus:ring-blue-300 rounded"
                  onClick={() => {
                    setShowDetailed(!showDetailed);
                    announceToScreenReader(
                      showDetailed ? 'Collapsed detailed help' : 'Expanded detailed help',
                      'polite'
                    );
                  }}
                  aria-expanded={showDetailed}
                  aria-label={showDetailed ? 'Hide detailed information' : 'Show detailed information'}
                >
                  {showDetailed ? 'Less info' : 'More info'}
                </button>
                
                {showDetailed && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs leading-relaxed">
                    {detailedContent}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${getArrowStyles()}
            `.trim()}
          />
        </div>
      )}
    </div>
  );
};