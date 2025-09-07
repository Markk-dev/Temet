"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { LoadingState } from '../core/LoadingStates';

interface LoadingStateManager {
  state: LoadingState;
  message: string;
  progress: number;
  isLoading: boolean;
  setLoadingState: (state: LoadingState, message?: string) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  startLoading: (state: LoadingState, message?: string) => void;
  finishLoading: () => void;
  handleError: (error: Error, customMessage?: string) => void;
  handleNetworkError: () => void;
  handleOffline: () => void;
  reset: () => void;
}

interface UseLoadingStateOptions {
  initialState?: LoadingState;
  initialMessage?: string;
  autoTimeout?: number; // Auto-finish loading after timeout (ms)
  onStateChange?: (state: LoadingState) => void;
  onError?: (error: Error) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}): LoadingStateManager => {
  const {
    initialState = 'initializing',
    initialMessage = '',
    autoTimeout,
    onStateChange,
    onError,
  } = options;

  const [state, setState] = useState<LoadingState>(initialState);
  const [message, setMessage] = useState<string>(initialMessage);
  const [progress, setProgress] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLoading = ['initializing', 'connecting', 'loading-canvas', 'loading-objects', 'syncing', 'reconnecting'].includes(state);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Call onStateChange when state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  const setLoadingState = useCallback((newState: LoadingState, newMessage?: string) => {
    setState(newState);
    if (newMessage !== undefined) {
      setMessage(newMessage);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set auto-timeout for loading states
    if (autoTimeout && ['initializing', 'connecting', 'loading-canvas', 'loading-objects'].includes(newState)) {
      timeoutRef.current = setTimeout(() => {
        handleError(new Error('Loading timeout'), 'Loading took too long. Please try again.');
      }, autoTimeout);
    }
  }, [autoTimeout]);

  const startLoading = useCallback((loadingState: LoadingState, loadingMessage?: string) => {
    setLoadingState(loadingState, loadingMessage);
    setProgress(0);
  }, [setLoadingState]);

  const finishLoading = useCallback(() => {
    setState('initializing'); // Reset to a neutral state
    setMessage('');
    setProgress(100);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleError = useCallback((error: Error, customMessage?: string) => {
    setState('error');
    setMessage(customMessage || error.message || 'An error occurred');
    setProgress(0);
    
    if (onError) {
      onError(error);
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [onError]);

  const handleNetworkError = useCallback(() => {
    setState('reconnecting');
    setMessage('Connection lost. Attempting to reconnect...');
    setProgress(0);
  }, []);

  const handleOffline = useCallback(() => {
    setState('offline');
    setMessage('Working offline. Changes will sync when connection is restored.');
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setMessage(initialMessage);
    setProgress(0);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [initialState, initialMessage]);

  return {
    state,
    message,
    progress,
    isLoading,
    setLoadingState,
    setProgress,
    setMessage,
    startLoading,
    finishLoading,
    handleError,
    handleNetworkError,
    handleOffline,
    reset,
  };
};

export default useLoadingState;