import React, { useState } from 'react';
import { HelpModal } from './HelpModal';
import { Button } from '../UI';

interface HelpButtonProps {
  topic?: 'framingham' | 'risk-factors' | 'prevention' | 'general';
  variant?: 'button' | 'icon' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  topic = 'general',
  variant = 'button',
  size = 'md',
  className = '',
  children
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getButtonContent = () => {
    if (children) {
      return children;
    }

    const icon = (
      <svg 
        className={`${variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );

    switch (variant) {
      case 'icon':
        return icon;
      case 'link':
        return (
          <span className="flex items-center space-x-1">
            {icon}
            <span>Help</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-2">
            {icon}
            <span>Help & Information</span>
          </span>
        );
    }
  };

  const getTopicLabel = () => {
    switch (topic) {
      case 'framingham':
        return 'Framingham Study Information';
      case 'risk-factors':
        return 'Risk Factors Help';
      case 'prevention':
        return 'Prevention Information';
      default:
        return 'Help & Information';
    }
  };

  if (variant === 'link') {
    return (
      <>
        <button
          type="button"
          onClick={handleOpenModal}
          className={`
            text-blue-600 hover:text-blue-800 focus:text-blue-800 
            focus:outline-none focus:underline transition-colors
            ${className}
          `.trim()}
          aria-label={getTopicLabel()}
        >
          {getButtonContent()}
        </button>
        
        <HelpModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          topic={topic}
        />
      </>
    );
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleOpenModal}
          className={`
            p-2 text-gray-400 hover:text-gray-600 focus:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full
            transition-colors
            ${className}
          `.trim()}
          aria-label={getTopicLabel()}
        >
          {getButtonContent()}
        </button>
        
        <HelpModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          topic={topic}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={handleOpenModal}
        className={className}
        aria-label={getTopicLabel()}
      >
        {getButtonContent()}
      </Button>
      
      <HelpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        topic={topic}
      />
    </>
  );
};