import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LoadingStates from '../LoadingStates';

describe('LoadingStates', () => {
  it('renders initializing state correctly', () => {
    render(<LoadingStates state="initializing" />);
    
    expect(screen.getByText('Initializing Canvas')).toBeInTheDocument();
    expect(screen.getByText('Setting up the drawing environment...')).toBeInTheDocument();
  });

  it('renders connecting state correctly', () => {
    render(<LoadingStates state="connecting" />);
    
    expect(screen.getByText('Connecting')).toBeInTheDocument();
    expect(screen.getByText('Connecting to collaboration server...')).toBeInTheDocument();
  });

  it('renders loading canvas state with progress', () => {
    render(<LoadingStates state="loading-canvas" progress={50} />);
    
    expect(screen.getByText('Loading Canvas')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingStates state="initializing" message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('shows progress bar for loading states', () => {
    render(<LoadingStates state="loading-objects" progress={75} />);
    
    const progressBar = screen.getByText('75%');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const onRetry = vi.fn();
    render(<LoadingStates state="error" onRetry={onRetry} />);
    
    expect(screen.getByText('Loading Error')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders offline state correctly', () => {
    render(<LoadingStates state="offline" />);
    
    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    expect(screen.getByText('Working offline. Changes will sync when connection is restored.')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders reconnecting state with retry and offline options', () => {
    const onRetry = vi.fn();
    const onOfflineMode = vi.fn();
    
    render(
      <LoadingStates 
        state="reconnecting" 
        onRetry={onRetry} 
        onOfflineMode={onOfflineMode} 
      />
    );
    
    expect(screen.getByText('Reconnecting')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    const offlineButton = screen.getByText('Work Offline');
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
    
    fireEvent.click(offlineButton);
    expect(onOfflineMode).toHaveBeenCalled();
  });

  it('renders syncing state correctly', () => {
    render(<LoadingStates state="syncing" />);
    
    expect(screen.getByText('Syncing Changes')).toBeInTheDocument();
    expect(screen.getByText('Synchronizing with other users...')).toBeInTheDocument();
  });

  it('shows connection status indicator for network states', () => {
    const { rerender } = render(<LoadingStates state="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    
    rerender(<LoadingStates state="reconnecting" />);
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    
    rerender(<LoadingStates state="offline" />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('handles progress values correctly', () => {
    const { rerender } = render(<LoadingStates state="loading-canvas" progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    rerender(<LoadingStates state="loading-canvas" progress={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Test clamping
    rerender(<LoadingStates state="loading-canvas" progress={150} />);
    expect(screen.getByText('150%')).toBeInTheDocument(); // Shows actual value in text
    
    rerender(<LoadingStates state="loading-canvas" progress={-10} />);
    expect(screen.getByText('-10%')).toBeInTheDocument(); // Shows actual value in text
  });
});