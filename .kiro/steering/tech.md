# Technology Stack

## Frontend Framework
- **React** - Component-based UI library
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling and responsive design
- **JavaScript/TypeScript** - Application logic

## Build System & Tools
- **Vite** or **Create React App** - Development server and build tooling
- **npm/yarn** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Common Commands

### Development
```bash
npm start          # Start development server
npm run dev        # Alternative dev command (if using Vite)
npm run build      # Create production build
npm run test       # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Dependencies
```bash
npm install        # Install all dependencies
npm install <package>  # Add new dependency
npm install -D <package>  # Add dev dependency
```

## Code Standards
- Use functional components with hooks
- Implement proper TypeScript types for medical data
- Follow React best practices for state management
- Ensure accessibility compliance for healthcare applications
- Implement proper error handling for medical calculations
- Use semantic HTML for form inputs and results display

## Medical Calculation Requirements
- Implement Framingham Risk Score algorithm accurately
- Validate all input parameters against medical ranges
- Handle edge cases and invalid inputs gracefully
- Provide clear error messages for out-of-range values