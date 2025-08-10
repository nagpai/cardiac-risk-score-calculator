import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ValidationMessage from '../ValidationMessage';

describe('ValidationMessage', () => {
  it('renders single error message correctly', () => {
    const message = 'This field is required';
    render(<ValidationMessage message={message} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(message);
  });

  it('renders multiple error messages correctly', () => {
    const messages = [
      'This field is required',
      'Value must be between 30 and 79',
    ];
    render(<ValidationMessage messages={messages} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Please correct the following errors:')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('Value must be between 30 and 79')).toBeInTheDocument();
  });

  it('does not render when no message is provided', () => {
    render(<ValidationMessage />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render when empty messages array is provided', () => {
    render(<ValidationMessage messages={[]} />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders error type with correct styling', () => {
    render(<ValidationMessage message="Error message" type="error" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
  });

  it('renders warning type with correct styling', () => {
    render(<ValidationMessage message="Warning message" type="warning" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-yellow-600', 'bg-yellow-50', 'border-yellow-200');
  });

  it('renders info type with correct styling', () => {
    render(<ValidationMessage message="Info message" type="info" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-blue-600', 'bg-blue-50', 'border-blue-200');
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-validation-message';
    render(<ValidationMessage message="Test message" className={customClass} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(customClass);
  });

  it('sets custom ID when provided', () => {
    const customId = 'custom-validation-id';
    render(<ValidationMessage message="Test message" id={customId} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', customId);
  });

  it('has correct ARIA attributes', () => {
    render(<ValidationMessage message="Test message" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('displays error icon for error type', () => {
    render(<ValidationMessage message="Error message" type="error" />);
    
    const alert = screen.getByRole('alert');
    const icon = alert.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('displays warning icon for warning type', () => {
    render(<ValidationMessage message="Warning message" type="warning" />);
    
    const alert = screen.getByRole('alert');
    const icon = alert.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('displays info icon for info type', () => {
    render(<ValidationMessage message="Info message" type="info" />);
    
    const alert = screen.getByRole('alert');
    const icon = alert.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('prioritizes messages array over single message', () => {
    const singleMessage = 'Single message';
    const messagesArray = ['Message 1', 'Message 2'];
    
    render(<ValidationMessage message={singleMessage} messages={messagesArray} />);
    
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.queryByText(singleMessage)).not.toBeInTheDocument();
  });

  it('renders single message without list when only one message in array', () => {
    const messages = ['Single message in array'];
    render(<ValidationMessage messages={messages} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Single message in array');
    expect(screen.queryByText('Please correct the following errors:')).not.toBeInTheDocument();
    expect(alert.querySelector('ul')).not.toBeInTheDocument();
  });

  it('renders list format when multiple messages in array', () => {
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    render(<ValidationMessage messages={messages} />);
    
    expect(screen.getByText('Please correct the following errors:')).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(3);
  });
});