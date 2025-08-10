#!/usr/bin/env node

/**
 * Comprehensive test runner for the cardiac risk calculator
 * Runs all test suites and generates coverage reports
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting Comprehensive Test Suite...\n');

// Test suites to run
const testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm run test:run -- --reporter=verbose',
    description: 'All unit tests for utilities and components'
  },
  {
    name: 'Integration Tests',
    command: 'npm run test:run -- src/__tests__/integration.test.tsx --reporter=verbose',
    description: 'Complete user workflow tests'
  },
  {
    name: 'Accessibility Tests',
    command: 'npm run test:run -- src/__tests__/accessibility.test.tsx --reporter=verbose',
    description: 'WCAG 2.1 AA compliance tests'
  },
  {
    name: 'Cross-Browser Tests',
    command: 'npm run test:run -- src/__tests__/crossBrowser.test.tsx --reporter=verbose',
    description: 'Chrome, Firefox, Safari, Edge compatibility'
  },
  {
    name: 'Performance Tests',
    command: 'npm run test:run -- src/__tests__/performance.test.tsx --reporter=verbose',
    description: 'Performance and optimization verification'
  }
];

const results = [];

// Run each test suite
for (const suite of testSuites) {
  console.log(`\n📋 Running ${suite.name}...`);
  console.log(`   ${suite.description}`);
  console.log(`   Command: ${suite.command}\n`);
  
  try {
    const startTime = Date.now();
    const output = execSync(suite.command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ ${suite.name} passed (${duration}ms)`);
    results.push({
      name: suite.name,
      status: 'PASSED',
      duration,
      output: output.substring(0, 500) // Truncate long output
    });
  } catch (error) {
    console.log(`❌ ${suite.name} failed`);
    console.log(`   Error: ${error.message.substring(0, 200)}...`);
    results.push({
      name: suite.name,
      status: 'FAILED',
      duration: 0,
      error: error.message.substring(0, 500)
    });
  }
}

// Generate coverage report
console.log('\n📊 Generating Coverage Report...');
try {
  execSync('npm run test:run -- --coverage', { stdio: 'inherit' });
  console.log('✅ Coverage report generated');
} catch (error) {
  console.log('❌ Coverage report failed');
}

// Generate summary report
console.log('\n📈 Test Summary Report');
console.log('='.repeat(50));

const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;
const total = results.length;

console.log(`Total Test Suites: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

console.log('\nDetailed Results:');
results.forEach(result => {
  const status = result.status === 'PASSED' ? '✅' : '❌';
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  console.log(`${status} ${result.name}${duration}`);
  
  if (result.error) {
    console.log(`   Error: ${result.error.substring(0, 100)}...`);
  }
});

// Save results to file
const reportPath = path.join(__dirname, '..', 'test-results.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: { total, passed, failed, successRate: Math.round((passed / total) * 100) },
  results
}, null, 2));

console.log(`\n📄 Detailed results saved to: ${reportPath}`);

// Performance requirements check
console.log('\n⚡ Performance Requirements Check');
console.log('='.repeat(50));

const performanceResult = results.find(r => r.name === 'Performance Tests');
if (performanceResult && performanceResult.status === 'PASSED') {
  console.log('✅ Calculation speed requirement (<100ms): PASSED');
  console.log('✅ Bundle size optimization: PASSED');
  console.log('✅ Memory usage optimization: PASSED');
} else {
  console.log('❌ Performance requirements: FAILED');
  console.log('   Check performance test output for details');
}

// Accessibility requirements check
console.log('\n♿ Accessibility Requirements Check');
console.log('='.repeat(50));

const accessibilityResult = results.find(r => r.name === 'Accessibility Tests');
if (accessibilityResult && accessibilityResult.status === 'PASSED') {
  console.log('✅ WCAG 2.1 AA compliance: PASSED');
  console.log('✅ Keyboard navigation: PASSED');
  console.log('✅ Screen reader compatibility: PASSED');
} else {
  console.log('❌ Accessibility requirements: FAILED');
  console.log('   Check accessibility test output for details');
}

// Cross-browser requirements check
console.log('\n🌐 Cross-Browser Requirements Check');
console.log('='.repeat(50));

const browserResult = results.find(r => r.name === 'Cross-Browser Tests');
if (browserResult && browserResult.status === 'PASSED') {
  console.log('✅ Chrome compatibility: PASSED');
  console.log('✅ Firefox compatibility: PASSED');
  console.log('✅ Safari compatibility: PASSED');
  console.log('✅ Edge compatibility: PASSED');
} else {
  console.log('❌ Cross-browser requirements: FAILED');
  console.log('   Check cross-browser test output for details');
}

console.log('\n🏁 Comprehensive testing completed!');

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);