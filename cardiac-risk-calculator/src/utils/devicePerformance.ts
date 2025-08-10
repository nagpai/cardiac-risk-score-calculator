/**
 * Device performance testing and optimization utilities
 * Helps ensure the app works well on older devices and slower connections
 */

interface DeviceCapabilities {
  isLowEndDevice: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  memoryStatus: 'low' | 'medium' | 'high';
  cpuCores: number;
  deviceMemory?: number;
}

/**
 * Detects device capabilities to optimize performance
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const capabilities: DeviceCapabilities = {
    isLowEndDevice: false,
    connectionSpeed: 'medium',
    memoryStatus: 'medium',
    cpuCores: navigator.hardwareConcurrency || 4,
  };

  // Detect device memory if available
  if ('deviceMemory' in navigator) {
    capabilities.deviceMemory = (navigator as any).deviceMemory;
    if (capabilities.deviceMemory) {
      capabilities.memoryStatus = capabilities.deviceMemory <= 2 ? 'low' : 
                                 capabilities.deviceMemory <= 4 ? 'medium' : 'high';
    }
  }

  // Detect connection speed
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        capabilities.connectionSpeed = 'slow';
      } else if (effectiveType === '3g') {
        capabilities.connectionSpeed = 'medium';
      } else {
        capabilities.connectionSpeed = 'fast';
      }
    }
  }

  // Determine if this is a low-end device
  capabilities.isLowEndDevice = 
    capabilities.cpuCores <= 2 || 
    capabilities.memoryStatus === 'low' ||
    capabilities.connectionSpeed === 'slow';

  return capabilities;
}

/**
 * Applies performance optimizations based on device capabilities
 */
export function applyPerformanceOptimizations(capabilities: DeviceCapabilities): void {
  if (capabilities.isLowEndDevice) {
    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Add class for CSS optimizations
    document.body.classList.add('low-end-device');
    
    // Disable non-essential animations
    const style = document.createElement('style');
    style.textContent = `
      .low-end-device * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .low-end-device .chart-animation {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (capabilities.connectionSpeed === 'slow') {
    // Preload critical resources only
    document.body.classList.add('slow-connection');
    
    // Disable auto-loading of non-critical resources
    console.log('Slow connection detected - optimizing resource loading');
  }
}

/**
 * Monitors performance metrics and adjusts behavior
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private isMonitoring = false;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrame();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Adjust performance if FPS is too low
      if (this.fps < 30) {
        this.handleLowPerformance();
      }
    }

    requestAnimationFrame(this.monitorFrame);
  };

  private handleLowPerformance(): void {
    console.warn(`Low FPS detected: ${this.fps}fps - applying performance optimizations`);
    
    // Reduce visual complexity
    document.body.classList.add('performance-mode');
    
    // Disable expensive visual effects
    const style = document.createElement('style');
    style.textContent = `
      .performance-mode .shadow-lg { box-shadow: none !important; }
      .performance-mode .blur { filter: none !important; }
      .performance-mode .gradient { background: solid !important; }
    `;
    document.head.appendChild(style);
  }

  getCurrentFPS(): number {
    return this.fps;
  }
}

/**
 * Tests calculation performance with various data sizes
 */
export async function testCalculationPerformance(): Promise<{
  averageTime: number;
  maxTime: number;
  minTime: number;
  passesRequirement: boolean;
}> {
  const { calculateFraminghamRisk } = await import('./framingham');
  const times: number[] = [];
  
  // Test with 100 calculations to get reliable metrics
  for (let i = 0; i < 100; i++) {
    const testData = {
      age: 30 + Math.random() * 49, // 30-79
      gender: Math.random() > 0.5 ? ('male' as const) : ('female' as const),
      totalCholesterol: 150 + Math.random() * 200, // 150-350
      hdlCholesterol: 30 + Math.random() * 70, // 30-100
      cholesterolUnit: 'mg/dL' as const,
      systolicBP: 100 + Math.random() * 80, // 100-180
      diastolicBP: 60 + Math.random() * 40, // 60-100
      onBPMedication: Math.random() > 0.7,
      glucoseUnit: 'mg/dL' as const,
      smokingStatus: (['never', 'former', 'current'] as const)[Math.floor(Math.random() * 3)],
      hasDiabetes: Math.random() > 0.8,
      familyHistory: Math.random() > 0.6,
    };

    const startTime = performance.now();
    try {
      calculateFraminghamRisk(testData);
    } catch (error) {
      // Skip invalid test data
      continue;
    }
    const endTime = performance.now();
    
    times.push(endTime - startTime);
  }

  const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  const passesRequirement = averageTime < 100; // Must be under 100ms

  return {
    averageTime,
    maxTime,
    minTime,
    passesRequirement,
  };
}

/**
 * Simulates slow network conditions for testing
 */
export function simulateSlowNetwork(): void {
  if (process.env.NODE_ENV === 'development') {
    // Add artificial delays to resource loading
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return originalFetch(...args);
    };
    
    console.log('Slow network simulation enabled');
  }
}

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    const logMemory = () => {
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`,
      });
    };

    // Log memory usage every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(logMemory, 30000);
    }
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  const capabilities = detectDeviceCapabilities();
  applyPerformanceOptimizations(capabilities);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Device capabilities:', capabilities);
    monitorMemoryUsage();
    
    // Test calculation performance
    testCalculationPerformance().then(results => {
      console.log('Calculation performance test results:', results);
      if (!results.passesRequirement) {
        console.warn('⚠️ Calculation performance does not meet 100ms requirement!');
      }
    });
  }
}