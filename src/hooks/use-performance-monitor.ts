"use client";

import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (endpoint: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    
    // Log slow requests for monitoring
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
    }
    
    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${endpoint}: ${duration}ms`);
    }
  }, [endpoint]);

  return {
    startTimer: () => {
      startTime.current = Date.now();
    },
    endTimer: () => {
      const endTime = Date.now();
      return endTime - startTime.current;
    }
  };
}; 