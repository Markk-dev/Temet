import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FabricErrorBoundary } from '../FabricErrorBoundary';

// Mock child component that throws different types of Fabric.js errors
const ThrowError = ({ errorType }: { errorType?: 'canvas' | 'object' | 'render' | 'other' | null }) => {
  if (errorType === 'canvas') {
    throw new Error('Canvas initialization failed');
  }
  if (errorType === 'object') {
    throw new Error('Object manipulation error');
  }
  if (errorType === 'render') {
    throw new Error('Render operation failed');
  }
  if (errorType === 'other') {
    throw new Error('Some other fabric error');
  }
  return <div>No error</div>;
};

describe('FabricErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as any).mockRestore?.();
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders canvas error UI for canvas errors', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Canvas Initialization Error')).toBeInTheDocument();
    expect(screen.getByText(/There was an issue initializing the drawing canvas/)).toBeInTheDocument();
  });

  it('renders object error UI for object errors', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="object" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Object Manipulation Error')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred while manipulating a canvas object/)).toBeInTheDocument();
  });

  it('renders render error UI for render errors', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="render" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Rendering Error')).toBeInTheDocument();
    expect(screen.getByText(/There was a problem rendering the canvas content/)).toBeInTheDocument();
  });

  it('renders generic error UI for unknown errors', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="other" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Drawing Engine Error')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred in the drawing engine/)).toBeInTheDocument();
  });

  it('calls onObjectError callback for object errors', () => {
    const onObjectError = vi.fn();
    
    render(
      <FabricErrorBoundary onObjectError={onObjectError}>
        <ThrowError errorType="object" />
      </FabricErrorBoundary>
    );

    expect(onObjectError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls onCanvasReset callback when reset button is clicked', () => {
    const onCanvasReset = vi.fn();
    
    render(
      <FabricErrorBoundary onCanvasReset={onCanvasReset}>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    const resetButton = screen.getByText('Reset Canvas');
    fireEvent.click(resetButton);

    expect(onCanvasReset).toHaveBeenCalled();
  });

  it('shows appropriate suggestions for different error types', () => {
    const { rerender } = render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
    expect(screen.getByText('Check if your browser supports HTML5 Canvas')).toBeInTheDocument();

    rerender(
      <FabricErrorBoundary>
        <ThrowError errorType="object" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Try undoing the last action')).toBeInTheDocument();
    expect(screen.getByText('Remove the problematic object')).toBeInTheDocument();

    rerender(
      <FabricErrorBoundary>
        <ThrowError errorType="render" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Simplify complex shapes')).toBeInTheDocument();
    expect(screen.getByText('Reduce the number of objects on canvas')).toBeInTheDocument();
  });

  it('allows retry when retry count is below maximum', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText(/Retry \(3 left\)/)).toBeInTheDocument();
  });

  it('shows all action buttons', () => {
    render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText(/Retry/)).toBeInTheDocument();
    expect(screen.getByText('Reset Canvas')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('handles retry button click', () => {
    const { rerender } = render(
      <FabricErrorBoundary>
        <ThrowError errorType="canvas" />
      </FabricErrorBoundary>
    );

    const retryButton = screen.getByText(/Retry/);
    fireEvent.click(retryButton);

    // After retry, should render children again
    rerender(
      <FabricErrorBoundary>
        <ThrowError />
      </FabricErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});