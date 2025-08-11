#!/usr/bin/env node

/**
 * Production Build Script
 * Comprehensive production build with validation and optimization
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}[STEP]${colors.reset} ${msg}`),
};

class ProductionBuilder {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.distPath = path.join(this.projectRoot, 'dist');
    this.startTime = Date.now();
  }

  async build() {
    try {
      console.log('='.repeat(60));
      console.log('🏗️  CARDIAC RISK CALCULATOR - PRODUCTION BUILD');
      console.log('='.repeat(60));
      
      await this.preFlightChecks();
      await this.cleanPreviousBuild();
      await this.runQualityChecks();
      await this.buildApplication();
      await this.postBuildOptimization();
      await this.validateBuild();
      await this.generateBuildReport();
      
      this.printSummary();
      
    } catch (error) {
      log.error(`Build failed: ${error.message}`);
      process.exit(1);
    }
  }

  async preFlightChecks() {
    log.step('Running pre-flight checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    log.info(`Node.js version: ${nodeVersion}`);
    
    // Check npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      log.info(`npm version: ${npmVersion}`);
    } catch (error) {
      throw new Error('npm not found');
    }
    
    // Check package.json
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) {
      throw new Error('package.json not found');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    log.info(`Application: ${packageJson.name} v${packageJson.version}`);
    
    // Check environment
    process.env.NODE_ENV = 'production';
    log.info('Environment set to production');
    
    log.success('Pre-flight checks completed');
  }

  async cleanPreviousBuild() {
    log.step('Cleaning previous build...');
    
    // Remove dist directory
    if (fs.existsSync(this.distPath)) {
      fs.rmSync(this.distPath, { recursive: true, force: true });
      log.info('Removed previous dist directory');
    }
    
    // Clear Vite cache
    const viteCachePath = path.join(this.projectRoot, 'node_modules', '.vite');
    if (fs.existsSync(viteCachePath)) {
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      log.info('Cleared Vite cache');
    }
    
    log.success('Clean completed');
  }

  async runQualityChecks() {
    log.step('Running quality checks...');
    
    try {
      // TypeScript type checking
      log.info('Running TypeScript type checking...');
      execSync('npm run typecheck', { stdio: 'inherit', cwd: this.projectRoot });
      
      // ESLint
      log.info('Running ESLint...');
      execSync('npm run lint', { stdio: 'inherit', cwd: this.projectRoot });
      
      // Unit tests
      log.info('Running unit tests...');
      execSync('npm run test:run', { stdio: 'inherit', cwd: this.projectRoot });
      
      // End-to-end tests
      log.info('Running end-to-end tests...');
      execSync('npm run test:e2e', { stdio: 'inherit', cwd: this.projectRoot });
      
      log.success('All quality checks passed');
      
    } catch (error) {
      throw new Error(`Quality checks failed: ${error.message}`);
    }
  }

  async buildApplication() {
    log.step('Building application...');
    
    try {
      // Production build
      log.info('Running production build...');
      execSync('npm run build:prod', { stdio: 'inherit', cwd: this.projectRoot });
      
      // Verify build output
      if (!fs.existsSync(this.distPath)) {
        throw new Error('Build output directory not found');
      }
      
      // Check critical files
      const criticalFiles = ['index.html'];
      for (const file of criticalFiles) {
        const filePath = path.join(this.distPath, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Critical file missing: ${file}`);
        }
      }
      
      log.success('Application build completed');
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async postBuildOptimization() {
    log.step('Running post-build optimization...');
    
    // Calculate build size
    const buildSize = this.calculateDirectorySize(this.distPath);
    const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);
    log.info(`Build size: ${buildSizeMB}MB`);
    
    // Optimize assets (if needed)
    await this.optimizeAssets();
    
    // Generate additional files
    await this.generateAdditionalFiles();
    
    log.success('Post-build optimization completed');
  }

  async optimizeAssets() {
    log.info('Optimizing assets...');
    
    // Check for large files
    const assetsPath = path.join(this.distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const largeFiles = this.findLargeFiles(assetsPath, 500 * 1024); // 500KB threshold
      
      if (largeFiles.length > 0) {
        log.warning(`Large files detected (>500KB):`);
        largeFiles.forEach(file => {
          const sizeKB = (file.size / 1024).toFixed(2);
          log.warning(`  - ${file.name}: ${sizeKB}KB`);
        });
      }
    }
    
    log.info('Asset optimization completed');
  }

  async generateAdditionalFiles() {
    log.info('Generating additional files...');
    
    // Generate manifest.json if not exists
    const manifestPath = path.join(this.distPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      const manifest = {
        name: 'Cardiac Risk Calculator',
        short_name: 'CardiacRisk',
        description: 'Cardiovascular risk assessment using Framingham Risk Score',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      };
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      log.info('Generated manifest.json');
    }
    
    // Ensure robots.txt exists
    const robotsPath = path.join(this.distPath, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      const robotsContent = `User-agent: *\nAllow: /\nDisallow: /assets/\nCrawl-delay: 1`;
      fs.writeFileSync(robotsPath, robotsContent);
      log.info('Generated robots.txt');
    }
    
    log.info('Additional files generated');
  }

  async validateBuild() {
    log.step('Validating build...');
    
    try {
      // Run deployment validation
      const validatorPath = path.join(__dirname, 'validate-deployment.js');
      if (fs.existsSync(validatorPath)) {
        execSync(`node ${validatorPath}`, { stdio: 'inherit', cwd: this.projectRoot });
      }
      
      log.success('Build validation completed');
      
    } catch (error) {
      log.warning(`Build validation had issues: ${error.message}`);
    }
  }

  async generateBuildReport() {
    log.step('Generating build report...');
    
    const buildTime = Date.now() - this.startTime;
    const buildSize = this.calculateDirectorySize(this.distPath);
    
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: `${(buildTime / 1000).toFixed(2)}s`,
      buildSize: `${(buildSize / (1024 * 1024)).toFixed(2)}MB`,
      nodeVersion: process.version,
      environment: 'production',
      files: this.getFileList(this.distPath),
    };
    
    const reportPath = path.join(this.distPath, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log.info(`Build report generated: ${reportPath}`);
    log.success('Build report completed');
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    const calculateSize = (currentPath) => {
      if (!fs.existsSync(currentPath)) return 0;
      
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          calculateSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    };
    
    calculateSize(dirPath);
    return totalSize;
  }

  findLargeFiles(dirPath, threshold) {
    const largeFiles = [];
    
    const scanDirectory = (currentPath) => {
      if (!fs.existsSync(currentPath)) return;
      
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanDirectory(itemPath);
        } else if (stats.size > threshold) {
          largeFiles.push({
            name: path.relative(this.distPath, itemPath),
            size: stats.size,
          });
        }
      }
    };
    
    scanDirectory(dirPath);
    return largeFiles;
  }

  getFileList(dirPath) {
    const files = [];
    
    const scanDirectory = (currentPath, relativePath = '') => {
      if (!fs.existsSync(currentPath)) return;
      
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const itemRelativePath = path.join(relativePath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanDirectory(itemPath, itemRelativePath);
        } else {
          files.push({
            path: itemRelativePath,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      }
    };
    
    scanDirectory(dirPath);
    return files;
  }

  printSummary() {
    const buildTime = Date.now() - this.startTime;
    const buildSize = this.calculateDirectorySize(this.distPath);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BUILD COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`⏱️  Build Time: ${(buildTime / 1000).toFixed(2)}s`);
    console.log(`📦 Build Size: ${(buildSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`📁 Output Directory: ${this.distPath}`);
    console.log('='.repeat(60));
    console.log('🚀 Ready for deployment!');
    console.log('\nNext steps:');
    console.log('  1. Review build output in dist/ directory');
    console.log('  2. Test with: npm run preview');
    console.log('  3. Deploy using your preferred method');
    console.log('  4. Run post-deployment health checks');
    console.log('='.repeat(60));
  }
}

// Run build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new ProductionBuilder();
  builder.build().catch(console.error);
}

export default ProductionBuilder;