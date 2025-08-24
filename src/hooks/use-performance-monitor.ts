"use client";

import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';

export const usePerformanceMonitor = () => {
  const [summary, setSummary] = useState(performanceMonitor.getSummary());
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setSummary(performanceMonitor.getSummary());
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);
  const clearLogs = () => {
    performanceMonitor.clearLogs();
    setSummary(performanceMonitor.getSummary());
  };

  const getPerformanceInsights = () => {
    const currentSummary = performanceMonitor.getSummary();
    
    if (currentSummary.totalOperations === 0) {
      return { status: 'info', message: 'No operations monitored yet' };
    }

    if (currentSummary.potentialNPlusOne > 0) {
      return { 
        status: 'warning', 
        message: `${currentSummary.potentialNPlusOne} potential N+1 queries detected` 
      };
    }

    if (currentSummary.averageDuration > 200) {
      return { 
        status: 'warning', 
        message: `Average operation time is ${currentSummary.averageDuration.toFixed(0)}ms (consider optimizing)` 
      };
    }

    return { 
      status: 'success', 
      message: 'Performance looks good!' 
    };
  };

  return {
    summary,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearLogs,
    getPerformanceInsights,
    // Export the monitor instance for direct access
    monitor: performanceMonitor
  };
}; 