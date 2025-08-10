#!/bin/bash

# Cardiac Risk Calculator Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Cardiac Risk Calculator"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
BACKUP_DIR="backup"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="20.19.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        log_warning "Node.js version $NODE_VERSION may not be compatible. Recommended: $REQUIRED_VERSION+"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Clean previous builds
clean_build() {
    log_info "Cleaning previous builds..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_success "Removed previous build directory"
    fi
    
    if [ -d "node_modules/.vite" ]; then
        rm -rf "node_modules/.vite"
        log_success "Cleared Vite cache"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --silent
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running test suite..."
    
    # Type checking
    log_info "Running TypeScript type checking..."
    npm run typecheck
    
    # Linting
    log_info "Running ESLint..."
    npm run lint
    
    # Unit tests
    log_info "Running unit tests..."
    npm run test:run
    
    # End-to-end validation
    log_info "Running end-to-end validation..."
    npm run test:e2e
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build with production optimizations
    npm run build:prod
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - no build directory found"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log_info "Build size: $BUILD_SIZE"
    
    # Verify critical files exist
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "Build failed - index.html not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Analyze bundle
analyze_bundle() {
    log_info "Analyzing bundle size..."
    
    # Generate bundle analysis
    VITE_BUILD_ANALYZE=true npm run build:prod > /dev/null 2>&1
    
    if [ -f "$BUILD_DIR/stats.html" ]; then
        log_success "Bundle analysis generated at $BUILD_DIR/stats.html"
    fi
}

# Security check
security_check() {
    log_info "Running security audit..."
    
    # npm audit
    if npm audit --audit-level=high; then
        log_success "No high-severity vulnerabilities found"
    else
        log_warning "Security vulnerabilities detected. Review npm audit output."
    fi
}

# Create backup
create_backup() {
    if [ -d "/var/www/cardiac-risk-calculator" ]; then
        log_info "Creating backup of current deployment..."
        
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_NAME="backup_$TIMESTAMP"
        
        cp -r "/var/www/cardiac-risk-calculator" "$BACKUP_DIR/$BACKUP_NAME"
        log_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Deploy to server
deploy_to_server() {
    local DEPLOY_PATH=${1:-"/var/www/cardiac-risk-calculator"}
    
    log_info "Deploying to $DEPLOY_PATH..."
    
    # Create deployment directory if it doesn't exist
    sudo mkdir -p "$DEPLOY_PATH"
    
    # Copy built files
    sudo cp -r "$BUILD_DIR"/* "$DEPLOY_PATH/"
    
    # Set proper permissions
    sudo chown -R www-data:www-data "$DEPLOY_PATH"
    sudo chmod -R 755 "$DEPLOY_PATH"
    
    log_success "Deployed to $DEPLOY_PATH"
}

# Docker deployment
deploy_docker() {
    log_info "Building Docker image..."
    
    # Build Docker image
    docker build -t cardiac-risk-calculator:$VERSION .
    docker tag cardiac-risk-calculator:$VERSION cardiac-risk-calculator:latest
    
    log_success "Docker image built: cardiac-risk-calculator:$VERSION"
    
    # Optional: Start with docker-compose
    if [ -f "docker-compose.yml" ]; then
        log_info "Starting with Docker Compose..."
        docker-compose up -d
        log_success "Application started with Docker Compose"
    fi
}

# Health check
health_check() {
    local URL=${1:-"http://localhost"}
    
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    # Check health endpoint
    if curl -f "$URL/health" > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        return 1
    fi
    
    # Check main page
    if curl -f "$URL" > /dev/null 2>&1; then
        log_success "Main page accessible"
    else
        log_error "Main page not accessible"
        return 1
    fi
}

# Performance test
performance_test() {
    local URL=${1:-"http://localhost"}
    
    log_info "Running performance test..."
    
    # Simple performance check with curl
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$URL")
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        log_success "Performance test passed (${RESPONSE_TIME}s)"
    else
        log_warning "Performance test warning: slow response time (${RESPONSE_TIME}s)"
    fi
}

# Main deployment function
main() {
    local DEPLOYMENT_TYPE=${1:-"local"}
    local DEPLOY_PATH=${2:-"/var/www/cardiac-risk-calculator"}
    
    echo "=================================================="
    echo "  $APP_NAME Deployment Script"
    echo "  Version: $VERSION"
    echo "  Type: $DEPLOYMENT_TYPE"
    echo "=================================================="
    
    # Pre-deployment checks
    check_prerequisites
    clean_build
    install_dependencies
    
    # Quality assurance
    run_tests
    security_check
    
    # Build
    build_application
    analyze_bundle
    
    # Deploy based on type
    case $DEPLOYMENT_TYPE in
        "local")
            log_info "Local deployment selected"
            create_backup
            deploy_to_server "$DEPLOY_PATH"
            health_check
            performance_test
            ;;
        "docker")
            log_info "Docker deployment selected"
            deploy_docker
            health_check
            performance_test
            ;;
        "build-only")
            log_info "Build-only mode selected"
            log_success "Build completed. Files available in $BUILD_DIR"
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            echo "Usage: $0 [local|docker|build-only] [deploy-path]"
            exit 1
            ;;
    esac
    
    echo "=================================================="
    log_success "$APP_NAME deployment completed successfully!"
    echo "=================================================="
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi