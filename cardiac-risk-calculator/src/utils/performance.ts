/**
 * Performance monitoring utilities for the cardiac risk calculator
 * Tracks calculation speed and other performance metrics
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep only last 100 metrics

  /**
   * Start timing a performance metric
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(name, duration);
      
      // Log warning if calculation takes too long (requirement: <100ms)
      if (name === 'risk-calculation' && duration > 100) {
        console.warn(`Risk calculation took ${duration.toFixed(2)}ms (exceeds 100ms requirement)`);
      }
      
      return duration;
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, duration: number): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get performance statistics for a specific metric
   */
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    recent: number[];
  } | null {
    const filteredMetrics = this.metrics.filter(m => m.name === name);
    
    if (filteredMetrics.length === 0) {
      return null;
    }

    const durations = filteredMetrics.map(m => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: filteredMetrics.length,
      average: sum / filteredMetrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: durations.slice(-10), // Last 10 measurements
    };
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Check if performance requirements are being met
   */
  checkRequirements(): {
    riskCalculationMeetsRequirement: boolean;
    averageCalculationTime: number;
    exceedsRequirementCount: number;
  } {
    const riskCalcStats = this.getStats('risk-calculation');
    
    if (!riskCalcStats) {
      return {
        riskCalculationMeetsRequirement: true,
        averageCalculationTime: 0,
        exceedsRequirementCount: 0,
      };
    }

    const exceedsRequirementCount = riskCalcStats.recent.filter(d => d > 100).length;

    return {
      riskCalculationMeetsRequirement: riskCalcStats.average <= 100,
      averageCalculationTime: riskCalcStats.average,
      exceedsRequirementCount,
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to wrap functions with performance monitoring
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string
): T {
  return ((...args: any[]) => {
    const endTiming = performanceMonitor.startTiming(metricName);
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          endTiming();
        });
      }
      
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }) as T;
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    checkRequirements: performanceMonitor.checkRequirements.bind(performanceMonitor),
    getAllMetrics: performanceMonitor.getAllMetrics.bind(performanceMonitor),
  };
}

/**
 * Measure and log bundle size information
 */
export function logBundleInfo(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Log performance navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      console.group('Bundle Performance Info');
      console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
      console.log(`Page Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      console.log(`Total Load Time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
      console.groupEnd();
    }

    // Log resource timing for main chunks
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    if (jsResources.length > 0) {
      console.group('JavaScript Bundle Info');
      jsResources.forEach(resource => {
        const size = resource.transferSize || 0;
        const loadTime = resource.responseEnd - resource.requestStart;
        console.log(`${resource.name.split('/').pop()}: ${(size / 1024).toFixed(2)}KB, ${loadTime.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }
}