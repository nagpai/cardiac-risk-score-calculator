import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('applies medium size styles by default', () => {
    render(<LoadingSpinner />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('applies small size styles correctly', () => {
    render(<LoadingSpinner size="sm" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies large size styles correctly', () => {
    render(<LoadingSpinner size="lg" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('applies extra large size styles correctly', () => {
    render(<LoadingSpinner size="xl" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies blue color by default', () => {
    render(<LoadingSpinner />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-blue-600');
  });

  it('applies gray color correctly', () => {
    render(<LoadingSpinner color="gray" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-gray-600');
  });

  it('applies white color correctly', () => {
    render(<LoadingSpinner color="white" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-white');
  });

  it('applies red color correctly', () => {
    render(<LoadingSpinner color="red" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-red-600');
  });

  it('applies green color correctly', () => {
    render(<LoadingSpinner color="green" />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-green-600');
  });

  it('displays custom label correctly', () => {
    const customLabel = 'Processing data...';
    render(<LoadingSpinner label={customLabel} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', customLabel);
    
    const hiddenText = screen.getByText(customLabel);
    expect(hiddenText).toHaveClass('sr-only');
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(customClass);
  });

  it('has spinning animation', () => {
    render(<LoadingSpinner />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('has correct SVG structure', () => {
    render(<LoadingSpinner />);
    
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    
    const circle = svg?.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    expect(circle).toHaveClass('opacity-25');
    
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass('opacity-75');
  });

  it('maintains accessibility with screen reader text', () => {
    render(<LoadingSpinner label="Custom loading message" />);
    
    const hiddenText = screen.getByText('Custom loading message');
    expect(hiddenText).toHaveClass('sr-only');
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
  });

  it('applies inline-flex layout correctly', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('inline-flex', 'items-center');
  });
});