import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from '../useLoadingState';
import { vi } from 'vitest';

// Mock timers
vi.useFakeTimers();

describe('useLoadingState', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.state).toBe('initializing');
    expect(result.current.message).toBe('');
    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('initializes with custom options', () => {
    const { result } = renderHook(() => 
      useLoadingState({
        initialState: 'connecting',
        initialMessage: 'Custom message',
      })
    );
    
    expect(result.current.state).toBe('connecting');
    expect(result.current.message).toBe('Custom message');
  });

  it('updates loading state correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setLoadingState('loading-canvas', 'Loading canvas data');
    });
    
    expect(result.current.state).toBe('loading-canvas');
    expect(result.current.message).toBe('Loading canvas data');
  });

  it('updates progress correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setProgress(50);
    });
    
    expect(result.current.progress).toBe(50);
  });

  it('starts loading correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.startLoading('loading-objects', 'Loading shapes');
    });
    
    expect(result.current.state).toBe('loading-objects');
    expect(result.current.message).toBe('Loading shapes');
    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('finishes loading correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.startLoading('loading-canvas');
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.finishLoading();
    });
    
    expect(result.current.state).toBe('initializing');
    expect(result.current.progress).toBe(100);
  });

  it('handles errors correctly', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useLoadingState({ onError }));
    
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError, 'Custom error message');
    });
    
    expect(result.current.state).toBe('error');
    expect(result.current.message).toBe('Custom error message');
    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('handles network errors correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.handleNetworkError();
    });
    
    expect(result.current.state).toBe('reconnecting');
    expect(result.current.message).toBe('Connection lost. Attempting to reconnect...');
    expect(result.current.isLoading).toBe(true);
  });

  it('handles offline mode correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.handleOffline();
    });
    
    expect(result.current.state).toBe('offline');
    expect(result.current.message).toBe('Working offline. Changes will sync when connection is restored.');
    expect(result.current.isLoading).toBe(false);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => 
      useLoadingState({
        initialState: 'connecting',
        initialMessage: 'Initial message',
      })
    );
    
    act(() => {
      result.current.setLoadingState('error', 'Error occurred');
      result.current.setProgress(75);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.state).toBe('connecting');
    expect(result.current.message).toBe('Initial message');
    expect(result.current.progress).toBe(0);
  });

  it('calls onStateChange callback', () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() => useLoadingState({ onStateChange }));
    
    act(() => {
      result.current.setLoadingState('loading-canvas');
    });
    
    expect(onStateChange).toHaveBeenCalledWith('loading-canvas');
  });

  it('handles auto-timeout correctly', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => 
      useLoadingState({ 
        autoTimeout: 5000,
        onError,
      })
    );
    
    act(() => {
      result.current.setLoadingState('loading-canvas');
    });
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(result.current.state).toBe('error');
    expect(result.current.message).toBe('Loading took too long. Please try again.');
    expect(onError).toHaveBeenCalled();
  });

  it('clears timeout when state changes', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => 
      useLoadingState({ 
        autoTimeout: 5000,
        onError,
      })
    );
    
    act(() => {
      result.current.setLoadingState('loading-canvas');
    });
    
    // Change state before timeout
    act(() => {
      result.current.finishLoading();
    });
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should not trigger timeout error
    expect(onError).not.toHaveBeenCalled();
  });

  it('identifies loading states correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    const loadingStates = ['initializing', 'connecting', 'loading-canvas', 'loading-objects', 'syncing', 'reconnecting'];
    const nonLoadingStates = ['error', 'offline'];
    
    loadingStates.forEach(state => {
      act(() => {
        result.current.setLoadingState(state as any);
      });
      expect(result.current.isLoading).toBe(true);
    });
    
    nonLoadingStates.forEach(state => {
      act(() => {
        result.current.setLoadingState(state as any);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });
});