import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from '../FormField';

describe('FormField', () => {
  const defaultProps = {
    label: 'Test Field',
    name: 'testField',
  };

  it('renders basic text input correctly', () => {
    render(<FormField {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays required indicator when required', () => {
    render(<FormField {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('required');
  });

  it('renders select dropdown with options', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    render(
      <FormField
        {...defaultProps}
        type="select"
        options={options}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders radio buttons with options', () => {
    const options = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ];

    render(
      <FormField
        {...defaultProps}
        type="radio"
        options={options}
      />
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
    expect(screen.getByLabelText('Female')).toBeInTheDocument();
  });

  it('renders checkbox input correctly', () => {
    render(<FormField {...defaultProps} type="checkbox" />);
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<FormField {...defaultProps} error={errorMessage} />);
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays unit when provided', () => {
    render(<FormField {...defaultProps} unit="mg/dL" />);
    
    expect(screen.getByText('mg/dL')).toBeInTheDocument();
  });

  it('displays tooltip button when tooltip is provided', () => {
    const tooltipText = 'This is helpful information';
    render(<FormField {...defaultProps} tooltip={tooltipText} />);
    
    const tooltipButton = screen.getByTitle(tooltipText);
    expect(tooltipButton).toBeInTheDocument();
  });

  it('handles onChange events correctly', () => {
    const handleChange = vi.fn();
    render(<FormField {...defaultProps} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles onBlur events correctly', () => {
    const handleBlur = vi.fn();
    render(<FormField {...defaultProps} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<FormField {...defaultProps} disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('sets correct input attributes for number type', () => {
    render(
      <FormField
        {...defaultProps}
        type="number"
        min={0}
        max={100}
        step={0.1}
      />
    );
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '0.1');
  });

  it('applies correct ARIA attributes', () => {
    const errorMessage = 'Invalid input';
    render(
      <FormField
        {...defaultProps}
        error={errorMessage}
        tooltip="Help text"
        unit="mg/dL"
      />
    );
    
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');
    
    expect(describedBy).toContain('field-testField-tooltip');
    expect(describedBy).toContain('field-testField-error');
    expect(describedBy).toContain('field-testField-unit');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles select value changes correctly', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    render(
      <FormField
        {...defaultProps}
        type="select"
        options={options}
        onChange={handleChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option1' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles radio button changes correctly', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ];

    render(
      <FormField
        {...defaultProps}
        type="radio"
        options={options}
        onChange={handleChange}
      />
    );

    const maleRadio = screen.getByLabelText('Male');
    fireEvent.click(maleRadio);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles checkbox changes correctly', () => {
    const handleChange = vi.fn();
    render(
      <FormField
        {...defaultProps}
        type="checkbox"
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-input-class';
    render(<FormField {...defaultProps} className={customClass} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(customClass);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FormField {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});