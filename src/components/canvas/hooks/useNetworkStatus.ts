"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastConnected: Date | null;
  connectionQuality: 'good' | 'poor' | 'offline';
  retryCount: number;
}

interface UseNetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onReconnect?: () => void;
  maxRetries?: number;
  retryInterval?: number;
  pingUrl?: string;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const {
    onOnline,
    onOffline,
    onReconnect,
    maxRetries = 5,
    retryInterval = 5000,
    pingUrl = '/api/ping', // Fallback ping endpoint
  } = options;

  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnecting: false,
    lastConnected: new Date(),
    connectionQuality: 'good',
    retryCount: 0,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Test connection quality by measuring response time
  const testConnectionQuality = useCallback(async (): Promise<'good' | 'poor' | 'offline'> => {
    try {
      const startTime = Date.now();
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        return 'offline';
      }

      const responseTime = Date.now() - startTime;
      
      if (responseTime < 1000) {
        return 'good';
      } else if (responseTime < 3000) {
        return 'poor';
      } else {
        return 'offline';
      }
    } catch (error) {
      return 'offline';
    }
  }, [pingUrl]);

  // Handle online/offline events
  const handleOnline = useCallback(async () => {
    setStatus(prev => ({ ...prev, isConnecting: true }));
    
    const quality = await testConnectionQuality();
    
    setStatus(prev => ({
      ...prev,
      isOnline: quality !== 'offline',
      isConnecting: false,
      lastConnected: quality !== 'offline' ? new Date() : prev.lastConnected,
      connectionQuality: quality,
      retryCount: quality !== 'offline' ? 0 : prev.retryCount,
    }));

    if (quality !== 'offline') {
      if (onOnline) onOnline();
      if (onReconnect) onReconnect();
    }
  }, [testConnectionQuality, onOnline, onReconnect]);

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      isConnecting: false,
      connectionQuality: 'offline',
    }));

    if (onOffline) onOffline();
  }, [onOffline]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    if (status.retryCount >= maxRetries) {
      return;
    }

    setStatus(prev => ({
      ...prev,
      isConnecting: true,
      retryCount: prev.retryCount + 1,
    }));

    const quality = await testConnectionQuality();
    
    if (quality !== 'offline') {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        isConnecting: false,
        lastConnected: new Date(),
        connectionQuality: quality,
        retryCount: 0,
      }));

      if (onReconnect) onReconnect();
    } else {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isConnecting: false,
        connectionQuality: 'offline',
      }));

      // Schedule next retry
      if (status.retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          retryConnection();
        }, retryInterval * Math.pow(2, status.retryCount)); // Exponential backoff
      }
    }
  }, [status.retryCount, maxRetries, testConnectionQuality, onReconnect, retryInterval]);

  // Periodic connection quality check
  const startPeriodicCheck = useCallback(() => {
    const checkConnection = async () => {
      if (status.isOnline) {
        const quality = await testConnectionQuality();
        
        setStatus(prev => ({
          ...prev,
          connectionQuality: quality,
          isOnline: quality !== 'offline',
        }));

        if (quality === 'offline' && status.isOnline) {
          handleOffline();
        }
      }
    };

    // Check every 30 seconds
    pingTimeoutRef.current = setTimeout(() => {
      checkConnection();
      startPeriodicCheck();
    }, 30000);
  }, [status.isOnline, testConnectionQuality, handleOffline]);

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start periodic connection quality checks
    startPeriodicCheck();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }
    };
  }, [handleOnline, handleOffline, startPeriodicCheck]);

  // Auto-retry when going offline
  useEffect(() => {
    if (!status.isOnline && !status.isConnecting && status.retryCount < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        retryConnection();
      }, retryInterval);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [status.isOnline, status.isConnecting, status.retryCount, maxRetries, retryConnection, retryInterval]);

  const forceRetry = useCallback(() => {
    setStatus(prev => ({ ...prev, retryCount: 0 }));
    retryConnection();
  }, [retryConnection]);

  const resetRetryCount = useCallback(() => {
    setStatus(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  return {
    ...status,
    retryConnection: forceRetry,
    resetRetryCount,
    testConnectionQuality,
  };
};

export default useNetworkStatus;