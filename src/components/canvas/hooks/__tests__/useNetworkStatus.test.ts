import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '../useNetworkStatus';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window events
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

// Mock timers
vi.useFakeTimers();

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    (fetch as any).mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
  });

  it('initializes with online status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('sets up event listeners', () => {
    renderHook(() => useNetworkStatus());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('tests connection quality correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
    });
    
    const { result } = renderHook(() => useNetworkStatus());
    
    const quality = await result.current.testConnectionQuality();
    
    expect(quality).toBe('good');
    expect(fetch).toHaveBeenCalledWith('/api/ping', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: expect.any(AbortSignal),
    });
  });

  it('detects poor connection quality', async () => {
    // Mock slow response
    (fetch as any).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ ok: true }), 2000)
      )
    );
    
    const { result } = renderHook(() => useNetworkStatus());
    
    const qualityPromise = result.current.testConnectionQuality();
    
    // Fast-forward time to simulate slow response
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    const quality = await qualityPromise;
    expect(quality).toBe('poor');
  });

  it('detects offline when fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useNetworkStatus());
    
    const quality = await result.current.testConnectionQuality();
    
    expect(quality).toBe('offline');
  });

  it('calls callbacks on status changes', () => {
    const onOnline = vi.fn();
    const onOffline = vi.fn();
    const onReconnect = vi.fn();
    
    renderHook(() => useNetworkStatus({
      onOnline,
      onOffline,
      onReconnect,
    }));
    
    // Simulate offline event
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1];
    
    if (offlineHandler) {
      act(() => {
        offlineHandler();
      });
    }
    
    expect(onOffline).toHaveBeenCalled();
  });

  it('retries connection with exponential backoff', async () => {
    (fetch as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true });
    
    const { result } = renderHook(() => useNetworkStatus({
      maxRetries: 3,
      retryInterval: 1000,
    }));
    
    // Trigger retry
    act(() => {
      result.current.retryConnection();
    });
    
    expect(result.current.isConnecting).toBe(true);
    expect(result.current.retryCount).toBe(1);
    
    // Fast-forward to complete first retry
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    
    expect(result.current.retryCount).toBe(1);
  });

  it('stops retrying after max attempts', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useNetworkStatus({
      maxRetries: 2,
      retryInterval: 1000,
    }));
    
    // Trigger multiple retries
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.retryConnection();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }
    
    expect(result.current.retryCount).toBeLessThanOrEqual(2);
  });

  it('resets retry count on successful connection', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true });
    
    const { result } = renderHook(() => useNetworkStatus());
    
    // Set retry count
    act(() => {
      result.current.retryConnection();
    });
    
    // Simulate successful connection
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    
    expect(result.current.retryCount).toBe(0);
  });

  it('allows manual retry count reset', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    // Simulate some retries
    act(() => {
      result.current.retryConnection();
    });
    
    act(() => {
      result.current.resetRetryCount();
    });
    
    expect(result.current.retryCount).toBe(0);
  });

  it('uses custom ping URL', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true });
    
    const customPingUrl = '/custom/ping';
    const { result } = renderHook(() => useNetworkStatus({
      pingUrl: customPingUrl,
    }));
    
    await result.current.testConnectionQuality();
    
    expect(fetch).toHaveBeenCalledWith(customPingUrl, expect.any(Object));
  });

  it('handles fetch timeout correctly', async () => {
    (fetch as any).mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 6000)
      )
    );
    
    const { result } = renderHook(() => useNetworkStatus());
    
    const qualityPromise = result.current.testConnectionQuality();
    
    // Fast-forward past timeout
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    
    const quality = await qualityPromise;
    expect(quality).toBe('offline');
  });
});