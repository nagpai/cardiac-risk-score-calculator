import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnitSelector from '../UnitSelector';

describe('UnitSelector', () => {
  const defaultProps = {
    label: 'Unit',
    name: 'unit',
    value: 'mg/dL',
    options: [
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'mmol/L', label: 'mmol/L' },
    ],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with label and options', () => {
    render(<UnitSelector {...defaultProps} />);
    
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('mg/dL')).toBeInTheDocument();
    expect(screen.getByText('mmol/L')).toBeInTheDocument();
  });

  it('displays the correct selected value', () => {
    render(<UnitSelector {...defaultProps} value="mmol/L" />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('mmol/L');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<UnitSelector {...defaultProps} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'mmol/L' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('mmol/L');
  });

  it('applies disabled state correctly', () => {
    render(<UnitSelector {...defaultProps} disabled />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-unit-selector';
    render(<UnitSelector {...defaultProps} className={customClass} />);
    
    const container = screen.getByRole('combobox').closest('div');
    expect(container).toHaveClass(customClass);
  });

  it('sets correct ARIA attributes', () => {
    const ariaDescribedBy = 'helper-text';
    render(<UnitSelector {...defaultProps} aria-describedby={ariaDescribedBy} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', ariaDescribedBy);
  });

  it('generates correct field ID', () => {
    render(<UnitSelector {...defaultProps} name="cholesterolUnit" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'unit-selector-cholesterolUnit');
  });

  it('renders all provided options', () => {
    const moreOptions = [
      { value: 'mg/dL', label: 'Milligrams per deciliter' },
      { value: 'mmol/L', label: 'Millimoles per liter' },
      { value: 'g/L', label: 'Grams per liter' },
    ];

    render(<UnitSelector {...defaultProps} options={moreOptions} />);
    
    expect(screen.getByText('Milligrams per deciliter')).toBeInTheDocument();
    expect(screen.getByText('Millimoles per liter')).toBeInTheDocument();
    expect(screen.getByText('Grams per liter')).toBeInTheDocument();
  });

  it('handles empty options array gracefully', () => {
    render(<UnitSelector {...defaultProps} options={[]} />);
    
    const select = screen.getByRole('combobox');
    expect(select.children).toHaveLength(0);
  });

  it('maintains focus styles', () => {
    render(<UnitSelector {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
  });
});