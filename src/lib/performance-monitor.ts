interface PerformanceMetric {
    operation: string;
    duration: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private readonly maxMetrics = 1000; // Keep last 1000 metrics

    /**
     * Measure the performance of an async operation
     */
    async measure<T>(
        operation: string,
        fn: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            this.recordMetric(operation, duration, metadata);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(operation, duration, { ...metadata, error: true });
            throw error;
        }
    }

    /**
     * Measure the performance of a sync operation
     */
    measureSync<T>(
        operation: string,
        fn: () => T,
        metadata?: Record<string, any>
    ): T {
        const start = performance.now();
        try {
            const result = fn();
            const duration = performance.now() - start;
            this.recordMetric(operation, duration, metadata);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(operation, duration, { ...metadata, error: true });
            throw error;
        }
    }

    /**
     * Record a performance metric
     */
    private recordMetric(operation: string, duration: number, metadata?: Record<string, any>) {
        this.metrics.push({
            operation,
            duration,
            timestamp: Date.now(),
            metadata
        });

        // Keep only the last maxMetrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    /**
     * Get performance summary for an operation
     */
    getOperationSummary(operation: string) {
        const operationMetrics = this.metrics.filter(m => m.operation === operation);
        
        if (operationMetrics.length === 0) {
            return null;
        }

        const durations = operationMetrics.map(m => m.duration);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const count = operationMetrics.length;

        return {
            operation,
            count,
            average: avg,
            min,
            max,
            total: durations.reduce((a, b) => a + b, 0)
        };
    }

    /**
     * Get overall performance summary
     */
    getSummary() {
        const operations = [...new Set(this.metrics.map(m => m.operation))];
        const summaries = operations.map(op => this.getOperationSummary(op)).filter(Boolean);
        
        return {
            totalMetrics: this.metrics.length,
            operations: summaries,
            timestamp: Date.now()
        };
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = [];
    }

    /**
     * Get metrics for a specific time range
     */
    getMetricsInRange(startTime: number, endTime: number) {
        return this.metrics.filter(m => 
            m.timestamp >= startTime && m.timestamp <= endTime
        );
    }

    /**
     * Export metrics for analysis
     */
    export() {
        return {
            summary: this.getSummary(),
            metrics: this.metrics
        };
    }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to wrap async functions with performance monitoring
 */
export function withPerformanceMonitoring<T extends any[], R>(
    operation: string,
    fn: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R> => {
        return performanceMonitor.measure(operation, () => fn(...args));
    };
}

/**
 * Higher-order function to wrap sync functions with performance monitoring
 */
export function withPerformanceMonitoringSync<T extends any[], R>(
    operation: string,
    fn: (...args: T) => R
) {
    return (...args: T): R => {
        return performanceMonitor.measureSync(operation, () => fn(...args));
    };
}

/**
 * React hook for performance monitoring in components
 */
export function usePerformanceMonitor() {
    return {
        measure: performanceMonitor.measure.bind(performanceMonitor),
        measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
        getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
        clear: performanceMonitor.clear.bind(performanceMonitor)
    };
}
