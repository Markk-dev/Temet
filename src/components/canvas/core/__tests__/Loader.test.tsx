import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Loader from '../Loader';

// Mock the Skeleton component
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-testid="skeleton" className={className} {...props} />
  ),
}));

describe('Loader Component', () => {
  it('renders loading text', () => {
    render(<Loader />);
    
    expect(screen.getByText('Loading canvas...')).toBeInTheDocument();
  });

  it('renders skeleton components', () => {
    render(<Loader />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    
    // Should have main canvas skeleton + toolbar skeletons (1 + 5 = 6 total)
    expect(skeletons).toHaveLength(6);
  });

  it('renders spinner animation', () => {
    render(<Loader />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-primary');
  });

  it('has correct layout structure', () => {
    render(<Loader />);
    
    const container = screen.getByText('Loading canvas...').closest('.flex');
    expect(container).toHaveClass('flex', 'h-screen', 'w-screen', 'flex-col', 'items-center', 'justify-center');
  });

  it('renders main canvas skeleton with correct classes', () => {
    render(<Loader />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    const mainCanvasSkeleton = skeletons[0];
    
    expect(mainCanvasSkeleton).toHaveClass('h-96', 'w-96', 'rounded-lg');
  });

  it('renders toolbar skeletons with correct classes', () => {
    render(<Loader />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    const toolbarSkeletons = skeletons.slice(1); // Skip the first one (main canvas)
    
    toolbarSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('h-10', 'w-10', 'rounded-md');
    });
  });

  it('uses Temet design system classes', () => {
    render(<Loader />);
    
    const loadingText = screen.getByText('Loading canvas...');
    expect(loadingText).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');
  });
});