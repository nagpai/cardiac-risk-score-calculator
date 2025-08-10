# Cardiac Risk Calculator

A web-based application that calculates cardiovascular risk using the proven Framingham Risk Score formula.

## Project Setup

This project has been set up with the following technologies:

- **React 18+** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling
- **React Hook Form** for form handling and validation
- **Chart.js** with react-chartjs-2 for data visualization

## Project Structure

```
src/
├── components/           # React components
│   ├── Calculator/      # Risk calculator components
│   ├── Forms/          # Input form components
│   ├── Results/        # Results display components
│   ├── UI/             # Generic UI components
│   └── Layout/         # Layout components
├── utils/              # Utility functions
│   └── constants.ts    # Medical constants and validation rules
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
│   └── index.ts        # Core interfaces (PatientData, RiskResult, etc.)
└── styles/             # CSS/styling files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features (To Be Implemented)

- Risk assessment using validated Framingham Study algorithms
- Input collection for key risk factors (age, cholesterol, blood pressure, etc.)
- Clear risk visualization and interpretation
- Educational content about cardiovascular health
- Accessibility compliance (WCAG 2.1 AA)
- Responsive design for all devices

## Medical Disclaimer

This calculator is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical decisions.

## Development Status

✅ Project structure and core interfaces - **COMPLETED**
⏳ Core calculation engine - *Next task*
⏳ Input validation system - *Pending*
⏳ UI components - *Pending*
⏳ Main application flow - *Pending*
⏳ Data persistence and export - *Pending*
⏳ Accessibility and UX enhancements - *Pending*
⏳ Error handling - *Pending*
⏳ Performance optimization - *Pending*
⏳ Final integration - *Pending*