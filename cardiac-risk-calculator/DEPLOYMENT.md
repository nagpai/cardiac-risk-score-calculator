# Cardiac Risk Calculator - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Cardiac Risk Calculator application to production environments.

## Prerequisites

### System Requirements
- **Node.js**: Version 20.19.0 or higher
- **npm**: Version 10.8.2 or higher
- **Git**: For version control
- **Modern web server**: Nginx, Apache, or similar

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Pre-Deployment Checklist

### 1. Code Quality Validation
```bash
# Run all validation checks
npm run validate

# Individual checks
npm run typecheck    # TypeScript compilation
npm run lint        # ESLint code quality
npm run test:run    # Unit and integration tests
```

### 2. Performance Testing
```bash
# Run performance tests
npm run test:performance

# Run comprehensive test suite
npm run test:comprehensive

# Run end-to-end validation
npm run test:e2e
```

### 3. Security Review
- ✅ No sensitive data in environment variables
- ✅ All calculations performed client-side
- ✅ No external API calls
- ✅ Local storage encryption enabled
- ✅ CSP headers configured

## Build Process

### Development Build
```bash
# Development build with source maps
npm run build

# Development build with bundle analysis
npm run build:analyze
```

### Production Build
```bash
# Production build (optimized)
npm run build:prod

# Production build with validation
npm run deploy:build
```

### Build Optimization Features
- **Code Splitting**: Automatic vendor and feature-based chunks
- **Tree Shaking**: Removes unused code
- **Minification**: Terser for JavaScript, CSS minification
- **Asset Optimization**: Image and font optimization
- **Gzip/Brotli**: Compression-ready assets

## Environment Configuration

### Environment Variables

#### Production (`.env.production`)
```env
VITE_APP_NAME=Cardiac Risk Calculator
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_BUILD_SOURCEMAP=false
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_CSP=true
```

#### Development (`.env.development`)
```env
VITE_APP_NAME=Cardiac Risk Calculator (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_APP_ENVIRONMENT=development
VITE_BUILD_SOURCEMAP=true
VITE_ENABLE_DEV_TOOLS=true
```

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### Netlify Deployment
1. **Build Command**: `npm run deploy:build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Set production variables in Netlify dashboard

#### Vercel Deployment
1. **Build Command**: `npm run deploy:build`
2. **Output Directory**: `dist`
3. **Framework Preset**: Vite

#### GitHub Pages
```bash
# Build for GitHub Pages
npm run build:prod

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

### Option 2: Traditional Web Server

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/cardiac-risk-calculator/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Apache Configuration (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Handle client-side routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
</IfModule>
```

## Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  cardiac-risk-calculator:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Performance Optimization

### Build Optimizations
- **Bundle Size**: Target <500KB gzipped
- **Code Splitting**: Vendor, charts, and forms chunks
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Images and fonts optimized

### Runtime Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists (if applicable)
- **Service Worker**: For caching (optional)

### Performance Monitoring
```bash
# Analyze bundle size
npm run build:stats

# Performance testing
npm run test:performance

# Lighthouse audit (manual)
# Run Lighthouse on deployed URL
```

## Security Considerations

### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
```

### Security Headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Data Privacy
- ✅ No external API calls
- ✅ All data processed client-side
- ✅ Local storage encryption
- ✅ No tracking or analytics by default

## Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl -f https://your-domain.com/health

# Performance check
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/
```

### Log Monitoring
- Monitor web server access logs
- Set up error tracking (optional)
- Monitor performance metrics

### Updates and Maintenance
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Rebuild and redeploy
npm run deploy:build
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean:install
npm run build:prod
```

#### Performance Issues
```bash
# Analyze bundle
npm run build:analyze

# Check for memory leaks
npm run test:performance
```

#### Browser Compatibility
- Ensure target browsers are supported
- Check for polyfills if needed
- Test on actual devices

### Support and Documentation
- **Medical Disclaimer**: Always displayed prominently
- **Framingham Reference**: Based on 2008 Framingham Heart Study
- **Privacy Policy**: No data collection or transmission
- **Accessibility**: WCAG 2.1 AA compliant

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`npm run test:run`)
- [ ] Code quality checks passed (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Performance requirements met
- [ ] Security review completed
- [ ] Environment variables configured

### Deployment
- [ ] Production build successful (`npm run build:prod`)
- [ ] Bundle size within limits (<500KB gzipped)
- [ ] Static assets optimized
- [ ] Web server configured
- [ ] Security headers enabled
- [ ] SSL certificate installed (if applicable)

### Post-Deployment
- [ ] Application loads correctly
- [ ] All features functional
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] Health check endpoint responding
- [ ] Error monitoring configured

## Support

For deployment issues or questions:
1. Check this documentation
2. Review build logs
3. Test locally with `npm run preview:prod`
4. Verify environment configuration
5. Check browser console for errors

---

**Note**: This application is designed for educational purposes and should not replace professional medical advice. Ensure appropriate medical disclaimers are prominently displayed in your deployment.