#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates the production build and deployment readiness
 */

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
};

class DeploymentValidator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.distPath = path.join(this.projectRoot, 'dist');
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    log.info('Starting deployment validation...');
    
    try {
      await this.validateBuildExists();
      await this.validateCriticalFiles();
      await this.validateAssetOptimization();
      await this.validateSecurityHeaders();
      await this.validatePerformance();
      await this.validateAccessibility();
      await this.validateMedicalCompliance();
      
      this.printSummary();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
      
      log.success('Deployment validation completed successfully!');
      
    } catch (error) {
      log.error(`Validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async validateBuildExists() {
    log.info('Checking build directory...');
    
    if (!fs.existsSync(this.distPath)) {
      this.errors.push('Build directory does not exist. Run npm run build:prod first.');
      return;
    }
    
    const stats = fs.statSync(this.distPath);
    if (!stats.isDirectory()) {
      this.errors.push('dist path exists but is not a directory.');
      return;
    }
    
    log.success('Build directory exists');
  }

  async validateCriticalFiles() {
    log.info('Validating critical files...');
    
    const criticalFiles = [
      'index.html',
      'assets/js',
      'assets/css',
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(this.distPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Critical file/directory missing: ${file}`);
      }
    }
    
    // Check index.html content
    const indexPath = path.join(this.distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Check for essential meta tags
      const requiredMeta = [
        '<meta charset="utf-8"',
        '<meta name="viewport"',
        'Cardiac Risk Calculator',
      ];
      
      for (const meta of requiredMeta) {
        if (!indexContent.includes(meta)) {
          this.warnings.push(`Missing or incorrect meta tag: ${meta}`);
        }
      }
      
      // Check for medical disclaimer
      if (!indexContent.includes('educational purposes') && !indexContent.includes('medical advice')) {
        this.warnings.push('Medical disclaimer not found in index.html');
      }
    }
    
    log.success('Critical files validation completed');
  }

  async validateAssetOptimization() {
    log.info('Validating asset optimization...');
    
    const assetsPath = path.join(this.distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
      this.errors.push('Assets directory not found');
      return;
    }
    
    // Check for hashed filenames
    const jsFiles = this.getFilesByExtension(assetsPath, '.js');
    const cssFiles = this.getFilesByExtension(assetsPath, '.css');
    
    // Validate JS files
    for (const jsFile of jsFiles) {
      if (!jsFile.includes('-') || jsFile.length < 20) {
        this.warnings.push(`JS file may not be properly hashed: ${jsFile}`);
      }
      
      // Check file size (should be reasonable for a medical calculator)
      const filePath = path.join(assetsPath, 'js', jsFile);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;
        
        if (sizeKB > 500) {
          this.warnings.push(`Large JS file detected: ${jsFile} (${sizeKB.toFixed(2)}KB)`);
        }
      }
    }
    
    // Validate CSS files
    for (const cssFile of cssFiles) {
      if (!cssFile.includes('-') || cssFile.length < 20) {
        this.warnings.push(`CSS file may not be properly hashed: ${cssFile}`);
      }
    }
    
    // Check for source maps in production
    const sourceMapFiles = this.getFilesByExtension(assetsPath, '.map');
    if (sourceMapFiles.length > 0) {
      this.warnings.push('Source map files found in production build');
    }
    
    log.success('Asset optimization validation completed');
  }

  async validateSecurityHeaders() {
    log.info('Validating security configuration...');
    
    // Check nginx.conf for security headers
    const nginxPath = path.join(this.projectRoot, 'nginx.conf');
    if (fs.existsSync(nginxPath)) {
      const nginxContent = fs.readFileSync(nginxPath, 'utf8');
      
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Content-Security-Policy',
        'Referrer-Policy',
      ];
      
      for (const header of requiredHeaders) {
        if (!nginxContent.includes(header)) {
          this.warnings.push(`Security header missing in nginx.conf: ${header}`);
        }
      }
      
      // Check for HTTPS redirect (commented out is acceptable)
      if (!nginxContent.includes('Strict-Transport-Security')) {
        this.warnings.push('HSTS header not configured (consider for HTTPS deployments)');
      }
    }
    
    log.success('Security configuration validation completed');
  }

  async validatePerformance() {
    log.info('Validating performance optimization...');
    
    // Calculate total bundle size
    let totalSize = 0;
    const calculateDirSize = (dirPath) => {
      if (!fs.existsSync(dirPath)) return 0;
      
      const files = fs.readdirSync(dirPath);
      let size = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += calculateDirSize(filePath);
        } else {
          size += stats.size;
        }
      }
      
      return size;
    };
    
    totalSize = calculateDirSize(this.distPath);
    const totalSizeMB = totalSize / (1024 * 1024);
    
    log.info(`Total bundle size: ${totalSizeMB.toFixed(2)}MB`);
    
    // Performance thresholds
    if (totalSizeMB > 5) {
      this.warnings.push(`Large bundle size: ${totalSizeMB.toFixed(2)}MB (consider optimization)`);
    } else if (totalSizeMB < 0.5) {
      this.warnings.push(`Very small bundle size: ${totalSizeMB.toFixed(2)}MB (verify all assets included)`);
    }
    
    // Check for code splitting
    const jsPath = path.join(this.distPath, 'assets', 'js');
    if (fs.existsSync(jsPath)) {
      const jsFiles = fs.readdirSync(jsPath).filter(f => f.endsWith('.js'));
      
      if (jsFiles.length < 2) {
        this.warnings.push('Code splitting may not be working (only one JS file found)');
      } else {
        log.success(`Code splitting detected: ${jsFiles.length} JS chunks`);
      }
    }
    
    log.success('Performance validation completed');
  }

  async validateAccessibility() {
    log.info('Validating accessibility features...');
    
    const indexPath = path.join(this.distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Check for accessibility features
      const accessibilityFeatures = [
        'lang=',
        'aria-',
        'role=',
        'alt=',
      ];
      
      let foundFeatures = 0;
      for (const feature of accessibilityFeatures) {
        if (indexContent.includes(feature)) {
          foundFeatures++;
        }
      }
      
      if (foundFeatures < 2) {
        this.warnings.push('Limited accessibility features detected in HTML');
      }
    }
    
    log.success('Accessibility validation completed');
  }

  async validateMedicalCompliance() {
    log.info('Validating medical application compliance...');
    
    const indexPath = path.join(this.distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Check for medical disclaimers
      const medicalTerms = [
        'educational purposes',
        'medical advice',
        'healthcare professional',
        'Framingham',
      ];
      
      let foundTerms = 0;
      for (const term of medicalTerms) {
        if (indexContent.toLowerCase().includes(term.toLowerCase())) {
          foundTerms++;
        }
      }
      
      if (foundTerms < 2) {
        this.warnings.push('Medical disclaimers and references may be insufficient');
      }
    }
    
    // Check environment variables
    const envProdPath = path.join(this.projectRoot, '.env.production');
    if (fs.existsSync(envProdPath)) {
      const envContent = fs.readFileSync(envProdPath, 'utf8');
      
      if (!envContent.includes('MEDICAL_DISCLAIMER')) {
        this.warnings.push('Medical disclaimer not configured in environment variables');
      }
      
      if (!envContent.includes('FRAMINGHAM')) {
        this.warnings.push('Framingham study reference not configured');
      }
    }
    
    log.success('Medical compliance validation completed');
  }

  getFilesByExtension(dirPath, extension) {
    const files = [];
    
    const scanDirectory = (currentPath) => {
      if (!fs.existsSync(currentPath)) return;
      
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith(extension)) {
          files.push(item);
        }
      }
    };
    
    scanDirectory(dirPath);
    return files;
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('DEPLOYMENT VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('✅ All validations passed!');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n${colors.red}ERRORS (${this.errors.length}):${colors.reset}`);
        this.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
      
      if (this.warnings.length > 0) {
        console.log(`\n${colors.yellow}WARNINGS (${this.warnings.length}):${colors.reset}`);
        this.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length === 0) {
      log.success('🚀 Deployment is ready!');
    } else {
      log.error('❌ Deployment validation failed. Please fix errors before deploying.');
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator();
  validator.validate().catch(console.error);
}

export default DeploymentValidator;