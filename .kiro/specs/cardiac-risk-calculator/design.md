# Design Document

## Overview

The Cardiac Risk Calculator is a client-side React application that implements the Framingham Risk Score algorithm to assess 10-year cardiovascular risk. The application prioritizes accuracy, accessibility, and user experience while maintaining complete data privacy through local-only processing.

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Business Logic │    │   Data Layer    │
│     Layer       │    │      Layer       │    │     Layer       │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • React Components │ │ • Risk Calculator │    │ • Local Storage │
│ • Form Validation  │ │ • Unit Converter  │    │ • State Mgmt    │
│ • Charts/Visuals   │ │ • Risk Categorizer│    │ • Form State    │
│ • Responsive UI    │ │ • Recommendations │    │ • Results Cache │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18+ with functional components and hooks
- **State Management**: React Context API for global state
- **Styling**: Tailwind CSS for responsive design and utility classes
- **Form Handling**: React Hook Form for performance and validation
- **Charts**: Chart.js with react-chartjs-2 for risk visualizations
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Jest and React Testing Library

## Components and Interfaces

### Core Components Structure
```
src/
├── components/
│   ├── Calculator/
│   │   ├── RiskCalculator.jsx          # Main calculator container
│   │   ├── InputForm.jsx               # Patient data input form
│   │   ├── ResultsDisplay.jsx          # Risk results presentation
│   │   └── UnitConverter.jsx           # mg/dL ↔ mmol/L conversion
│   ├── Forms/
│   │   ├── PatientDataForm.jsx         # Structured input form
│   │   ├── FormField.jsx               # Reusable form input
│   │   └── ValidationMessage.jsx       # Error display component
│   ├── Results/
│   │   ├── RiskGauge.jsx              # Visual risk meter
│   │   ├── RiskChart.jsx              # Risk comparison charts
│   │   ├── Recommendations.jsx         # Risk-based advice
│   │   └── ExportOptions.jsx          # PDF/Print functionality
│   ├── UI/
│   │   ├── Button.jsx                 # Accessible button component
│   │   ├── Modal.jsx                  # Modal dialogs
│   │   ├── Tooltip.jsx                # Information tooltips
│   │   └── LoadingSpinner.jsx         # Loading states
│   └── Layout/
│       ├── Header.jsx                 # App header with navigation
│       ├── Footer.jsx                 # Footer with disclaimers
│       └── PageLayout.jsx             # Common page structure
```

### Key Interfaces

#### Patient Data Interface
```typescript
interface PatientData {
  // Demographics
  age: number;                    // 30-79 years
  gender: 'male' | 'female';
  
  // Cholesterol (with unit support)
  totalCholesterol: number;       // Value in current unit
  hdlCholesterol: number;         // Value in current unit
  ldlCholesterol?: number;        // Optional, calculated if not provided
  cholesterolUnit: 'mg/dL' | 'mmol/L';
  
  // Blood Pressure (mmHg only)
  systolicBP: number;            // 80-200 mmHg
  diastolicBP: number;           // 40-120 mmHg
  onBPMedication: boolean;
  
  // Blood Glucose (with unit support)
  bloodGlucose?: number;         // Optional parameter
  glucoseUnit: 'mg/dL' | 'mmol/L';
  
  // Risk Factors
  smokingStatus: 'never' | 'former' | 'current';
  hasDiabetes: boolean;
  familyHistory: boolean;
}
```

#### Risk Result Interface
```typescript
interface RiskResult {
  // Core Results
  tenYearRisk: number;           // Percentage (0-100)
  riskCategory: 'low' | 'moderate' | 'high';
  
  // Detailed Analysis
  riskFactors: {
    age: number;
    gender: number;
    cholesterol: number;
    bloodPressure: number;
    smoking: number;
    diabetes: number;
    familyHistory: number;
  };
  
  // Comparison Data
  comparisonData: {
    averageForAge: number;
    averageForGender: number;
    idealRisk: number;
  };
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  calculatedAt: Date;
  framinghamVersion: string;
}

interface Recommendation {
  category: 'lifestyle' | 'medical' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  resources?: ExternalResource[];
}
```

#### Unit Conversion Interface
```typescript
interface UnitConverter {
  // Cholesterol conversions
  cholesterolMgDlToMmolL(value: number): number;
  cholesterolMmolLToMgDl(value: number): number;
  
  // Glucose conversions
  glucoseMgDlToMmolL(value: number): number;
  glucoseMmolLToMgDl(value: number): number;
  
  // Validation
  isValidCholesterolRange(value: number, unit: string): boolean;
  isValidGlucoseRange(value: number, unit: string): boolean;
}
```

## Data Models

### Framingham Risk Score Implementation

The Framingham Risk Score uses gender-specific coefficients and risk factors:

```typescript
interface FraminghamCoefficients {
  male: {
    age: number;
    totalCholesterol: number;
    hdlCholesterol: number;
    systolicBP: number;
    systolicBPTreated: number;
    smoking: number;
    diabetes: number;
  };
  female: {
    age: number;
    totalCholesterol: number;
    hdlCholesterol: number;
    systolicBP: number;
    systolicBPTreated: number;
    smoking: number;
    diabetes: number;
  };
}
```

### Risk Categorization Logic
```typescript
const categorizeRisk = (riskPercentage: number): RiskCategory => {
  if (riskPercentage < 10) return 'low';
  if (riskPercentage < 20) return 'moderate';
  return 'high';
};

const getRiskRecommendations = (category: RiskCategory): Recommendation[] => {
  switch (category) {
    case 'low':
      return [
        { priority: 'medium', category: 'lifestyle', title: 'Maintain Healthy Lifestyle' },
        { priority: 'low', category: 'monitoring', title: 'Regular Check-ups' }
      ];
    case 'moderate':
      return [
        { priority: 'high', category: 'lifestyle', title: 'Lifestyle Modifications' },
        { priority: 'high', category: 'medical', title: 'Medical Consultation' },
        { priority: 'medium', category: 'monitoring', title: 'Increased Monitoring' }
      ];
    case 'high':
      return [
        { priority: 'high', category: 'medical', title: 'Immediate Medical Consultation' },
        { priority: 'high', category: 'lifestyle', title: 'Aggressive Risk Reduction' },
        { priority: 'high', category: 'monitoring', title: 'Close Medical Supervision' }
      ];
  }
};
```

## Error Handling

### Input Validation Strategy
```typescript
interface ValidationRules {
  age: { min: 30, max: 79, required: true };
  totalCholesterol: { 
    min: { 'mg/dL': 100, 'mmol/L': 2.6 }, 
    max: { 'mg/dL': 400, 'mmol/L': 10.3 }, 
    required: true 
  };
  hdlCholesterol: { 
    min: { 'mg/dL': 20, 'mmol/L': 0.5 }, 
    max: { 'mg/dL': 100, 'mmol/L': 2.6 }, 
    required: true 
  };
  systolicBP: { min: 80, max: 200, required: true };
  diastolicBP: { min: 40, max: 120, required: true };
}
```

### Error Boundary Implementation
- Wrap calculator components in error boundaries
- Graceful degradation for calculation failures
- Clear error messages for users
- Fallback UI for component crashes

### Calculation Error Handling
```typescript
const calculateRisk = (patientData: PatientData): RiskResult | Error => {
  try {
    // Validate all inputs
    const validationErrors = validatePatientData(patientData);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors);
    }
    
    // Convert units to standard format
    const standardizedData = convertToStandardUnits(patientData);
    
    // Apply Framingham algorithm
    const riskScore = applyFraminghamAlgorithm(standardizedData);
    
    // Generate recommendations
    const recommendations = generateRecommendations(riskScore, standardizedData);
    
    return {
      tenYearRisk: riskScore,
      riskCategory: categorizeRisk(riskScore),
      recommendations,
      // ... other result properties
    };
  } catch (error) {
    console.error('Risk calculation failed:', error);
    return new CalculationError('Unable to calculate risk. Please check your inputs.');
  }
};
```

## Testing Strategy

### Unit Testing Approach
- **Calculation Logic**: Test Framingham algorithm accuracy against known test cases
- **Unit Conversion**: Verify mg/dL ↔ mmol/L conversions with medical precision
- **Validation**: Test all input validation rules and edge cases
- **Risk Categorization**: Verify correct risk category assignment

### Integration Testing
- **Form Flow**: Test complete user journey from input to results
- **State Management**: Verify data persistence and state updates
- **Error Handling**: Test error scenarios and recovery

### Accessibility Testing
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Screen Reader**: Test with NVDA/JAWS screen readers
- **Color Contrast**: Verify WCAG 2.1 AA compliance
- **Focus Management**: Test focus indicators and tab order

### Performance Testing
- **Calculation Speed**: Ensure <100ms calculation time
- **Bundle Size**: Optimize for fast loading
- **Memory Usage**: Test for memory leaks in long sessions

## Security and Privacy Considerations

### Data Privacy
- All calculations performed client-side
- No data transmission to external servers
- Local storage encryption for saved profiles
- Clear privacy policy and medical disclaimers

### Input Sanitization
- Validate and sanitize all numeric inputs
- Prevent XSS through proper React practices
- Implement CSP headers for additional security

### Medical Disclaimers
- Prominent disclaimer on all pages
- Clear statement about tool limitations
- Recommendation to consult healthcare providers
- Version information and algorithm references