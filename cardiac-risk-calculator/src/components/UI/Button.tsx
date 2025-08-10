import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'small' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-blue-600 text-white border-transparent
          hover:bg-blue-700 focus:ring-blue-500
          disabled:bg-blue-300 disabled:cursor-not-allowed
        `;
      case 'secondary':
        return `
          bg-gray-600 text-white border-transparent
          hover:bg-gray-700 focus:ring-gray-500
          disabled:bg-gray-300 disabled:cursor-not-allowed
        `;
      case 'outline':
        return `
          bg-white text-gray-700 border-gray-300
          hover:bg-gray-50 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        `;
      case 'ghost':
        return `
          bg-transparent text-gray-700 border-transparent
          hover:bg-gray-100 focus:ring-gray-500
          disabled:text-gray-400 disabled:cursor-not-allowed
        `;
      case 'danger':
        return `
          bg-red-600 text-white border-transparent
          hover:bg-red-700 focus:ring-red-500
          disabled:bg-red-300 disabled:cursor-not-allowed
        `;
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs';
      case 'small':
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseStyles = `
    inline-flex items-center justify-center
    border rounded-md font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50
    relative
  `;

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseStyles}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </>
      )}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </button>
  );
};

export default Button;