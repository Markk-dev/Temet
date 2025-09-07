import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CanvasErrorBoundary } from '../CanvasErrorBoundary';

// Mock child component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('CanvasErrorBoundary', () => {
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
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={false} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child throws an error', () => {
    render(
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('Canvas Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong with the canvas/)).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <CanvasErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <CanvasErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('allows retry when retry count is below maximum', () => {
    render(
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText(/Retry \(3 left\)/)).toBeInTheDocument();
    
    const retryButton = screen.getByText(/Retry/);
    fireEvent.click(retryButton);

    // After retry, the error boundary should reset and show retry count decreased
    expect(screen.getByText(/Retry \(2 left\)/)).toBeInTheDocument();
  });

  it('shows reset and reload buttons', () => {
    render(
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('Reset Canvas')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('handles reset button click', () => {
    render(
      <CanvasErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CanvasErrorBoundary>
    );

    const resetButton = screen.getByText('Reset Canvas');
    fireEvent.click(resetButton);

    // After reset, the error boundary should reset and show full retry count
    expect(screen.getByText(/Retry \(3 left\)/)).toBeInTheDocument();
  });
});