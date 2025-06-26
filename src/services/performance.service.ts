import React from 'react';

// 🚀 PERFORMANCE: Advanced Performance Monitoring Service
class PerformanceService {
  private metrics: Map<string, number> = new Map();
  private renderTimes: Map<string, number[]> = new Map();
  private isDevelopment = process.env.NODE_ENV === 'development';

  // Track component render times
  startRender(componentName: string): () => void {
    if (!this.isDevelopment) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (!this.renderTimes.has(componentName)) {
        this.renderTimes.set(componentName, []);
      }
      
      const times = this.renderTimes.get(componentName)!;
      times.push(renderTime);
      
      // Keep only last 10 render times
      if (times.length > 10) {
        times.shift();
      }
      
      // Log slow renders (> 16ms for 60fps)
    //   if (renderTime > 30) {
    //     console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    //   }
    };
  }

  // Track API call performance
  async trackApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.metrics.set(`api_${name}`, duration);
      
      if (this.isDevelopment) {
        console.log(`⚡ API Call "${name}" completed in ${duration.toFixed(2)}ms`);
      }
      
      // Log slow API calls (> 1000ms)
    //   if (duration > 1000) {
    //     console.warn(`🐌 Slow API call: ${name} took ${duration.toFixed(2)}ms`);
    //   }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ API Call "${name}" failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Get performance report
  getReport(): {
    renderTimes: { [componentName: string]: { avg: number; max: number; min: number } };
    apiMetrics: { [apiName: string]: number };
  } {
    const renderReport: { [componentName: string]: { avg: number; max: number; min: number } } = {};
    
    this.renderTimes.forEach((times, componentName) => {
      if (times.length > 0) {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);
        
        renderReport[componentName] = { avg, max, min };
      }
    });
    
    const apiMetrics: { [apiName: string]: number } = {};
    this.metrics.forEach((duration, name) => {
      apiMetrics[name] = duration;
    });
    
    return { renderTimes: renderReport, apiMetrics };
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.renderTimes.clear();
  }

  // Log performance report to console
  logReport(): void {
    if (!this.isDevelopment) return;
    
    const report = this.getReport();
    
    // console.group('📊 Performance Report');
    
    // if (Object.keys(report.renderTimes).length > 0) {
    //   console.group('🎨 Component Render Times');
    //   Object.entries(report.renderTimes).forEach(([component, stats]) => {
    //     console.log(`${component}: avg ${stats.avg.toFixed(2)}ms, max ${stats.max.toFixed(2)}ms, min ${stats.min.toFixed(2)}ms`);
    //   });
    //   console.groupEnd();
    // }
    
    if (Object.keys(report.apiMetrics).length > 0) {
      console.group('🌐 API Call Times');
      Object.entries(report.apiMetrics).forEach(([api, duration]) => {
        console.log(`${api}: ${duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Performance hook for React components
export const usePerformanceTracking = (componentName: string) => {
  const trackRender = performanceService.startRender(componentName);
  
  React.useEffect(() => {
    trackRender();
  });
  
  return {
    trackApiCall: performanceService.trackApiCall.bind(performanceService),
    getReport: performanceService.getReport.bind(performanceService),
    logReport: performanceService.logReport.bind(performanceService)
  };
}; 