# Project Structure

## Root Directory Organization
```
/
├── public/                 # Static assets
├── src/                   # Source code
├── package.json           # Dependencies and scripts
├── README.md             # Project documentation
└── .gitignore            # Git ignore rules
```

## Source Code Structure (`src/`)
```
src/
├── components/           # Reusable UI components
│   ├── Calculator/      # Risk calculator components
│   ├── Forms/          # Input form components
│   ├── Results/        # Results display components
│   └── UI/             # Generic UI components
├── utils/              # Utility functions
│   ├── framingham.js   # Risk calculation algorithms
│   ├── validation.js   # Input validation
│   └── constants.js    # Medical constants and ranges
├── hooks/              # Custom React hooks
├── styles/             # CSS/styling files
├── types/              # TypeScript type definitions
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Component Organization
- **Calculator Components**: Main calculator interface, step-by-step forms
- **Form Components**: Individual input fields with validation
- **Results Components**: Risk score display, charts, recommendations
- **UI Components**: Buttons, inputs, modals, loading states

## File Naming Conventions
- Components: PascalCase (e.g., `RiskCalculator.jsx`)
- Utilities: camelCase (e.g., `framinghamScore.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `MEDICAL_RANGES.js`)
- Styles: kebab-case (e.g., `risk-calculator.css`)

## Key Architectural Principles
- Separate calculation logic from UI components
- Centralize medical constants and validation rules
- Implement proper error boundaries for medical calculations
- Use controlled components for all form inputs
- Maintain clear separation between data validation and business logic