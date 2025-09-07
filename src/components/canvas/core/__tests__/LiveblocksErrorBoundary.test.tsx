  import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LiveblocksErrorBoundary } from '../LiveblocksErrorBoundary';

// Mock child component that throws different types of errors
const ThrowError = ({ errorType }: { errorType?: 'network' | 'other' | null }) => {
  if (errorType === 'network') {
    throw new Error('Network connection failed');
  }
  if (errorType === 'other') {
    throw new Error('Some other error');
  }
  return <div>No error</div>;
};

describe('LiveblocksErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as any).mockRestore?.();
    console.error = originalError;
  });

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children when there is no error', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders connection error UI for network errors', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText('Collaboration Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the collaboration server/)).toBeInTheDocument();
  });

  it('renders generic error UI for non-network errors', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="other" />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText('Collaboration Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/There was an issue with the real-time collaboration/)).toBeInTheDocument();
  });

  it('calls onConnectionError callback for network errors', () => {
    const onConnectionError = vi.fn();
    
    render(
      <LiveblocksErrorBoundary onConnectionError={onConnectionError}>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    expect(onConnectionError).toHaveBeenCalled();
  });

  it('shows retry indicator for connection errors', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText(/Retrying... \(Attempt 1\/5\)/)).toBeInTheDocument();
  });

  it('calls onRetry callback when retry button is clicked', () => {
    const onRetry = vi.fn();
    
    render(
      <LiveblocksErrorBoundary onRetry={onRetry}>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    const retryButton = screen.getByText('Retry Connection');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('shows reload page button', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('auto-retries connection errors with exponential backoff', async () => {
    const { rerender } = render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    // Fast-forward time to trigger auto-retry
    vi.advanceTimersByTime(1000);

    // Should attempt retry
    rerender(
      <LiveblocksErrorBoundary>
        <ThrowError />
      </LiveblocksErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  it('stops auto-retrying after maximum attempts', () => {
    render(
      <LiveblocksErrorBoundary>
        <ThrowError errorType="network" />
      </LiveblocksErrorBoundary>
    );

    // Simulate multiple failed retries by advancing time
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(Math.pow(2, i) * 1000);
    }

    // Should still show error after max retries
    expect(screen.getByText('Collaboration Unavailable')).toBeInTheDocument();
  });
});