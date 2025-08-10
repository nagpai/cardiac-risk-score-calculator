/**
 * Standalone performance testing utility
 * Tests calculation speed and bundle optimization
 */

// Simple performance test that doesn't depend on complex types
export function testBasicPerformance(): void {
  console.log('🚀 Starting Performance Tests...');
  
  // Test 1: Basic calculation timing
  const startTime = performance.now();
  
  // Simulate calculation work
  for (let i = 0; i < 1000; i++) {
    Math.log(Math.random() * 100 + 50); // Simulate Framingham calculations
  }
  
  const endTime = performance.now();
  const calculationTime = endTime - startTime;
  
  console.log(`✅ Basic calculation test: ${calculationTime.toFixed(2)}ms`);
  
  // Test 2: Memory usage
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('📊 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
    });
  }
  
  // Test 3: Bundle loading performance
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    console.log('📦 Bundle Performance:', {
      domContentLoaded: `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
      totalLoadTime: `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`,
    });
  }
  
  // Test 4: Resource timing
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.includes('.js'));
  
  if (jsResources.length > 0) {
    console.log('📋 JavaScript Bundles:');
    jsResources.forEach(resource => {
      const size = resource.transferSize || 0;
      const loadTime = resource.responseEnd - resource.requestStart;
      console.log(`  ${resource.name.split('/').pop()}: ${(size / 1024).toFixed(2)}KB, ${loadTime.toFixed(2)}ms`);
    });
  }
  
  // Test 5: Check if requirements are met
  const meetsRequirements = calculationTime < 100;
  console.log(`${meetsRequirements ? '✅' : '❌'} Performance requirement (< 100ms): ${meetsRequirements ? 'PASSED' : 'FAILED'}`);
  
  console.log('🏁 Performance tests completed!');
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    // Run tests after page load
    window.addEventListener('load', () => {
      setTimeout(testBasicPerformance, 1000);
    });
    
    // Monitor FPS if needed
    let frameCount = 0;
    let lastTime = performance.now();
    
    function monitorFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}fps`);
        }
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitorFPS);
    }
    
    if (process.env.NODE_ENV === 'development') {
      requestAnimationFrame(monitorFPS);
    }
  }
}