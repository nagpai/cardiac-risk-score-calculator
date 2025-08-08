# Cardiac Risk Score Calculator - Product Specification Template

## 1. Product Overview
**Status**: Approved  
**Version**: 1.0  
**Last Updated**: August 8, 2025

### Executive Summary
A web-based application that calculates cardiovascular risk using the proven Framingham Risk Score formula. The calculator helps users assess their 10-year risk of experiencing a cardiac event based on clinical parameters.

### Problem Statement
The app helps in preventive healthcare decisions by providing a quick assessment of a patient's cardiovascular risk. It is particularly useful for individuals, researchers, and healthcare professionals to make informed decisions about their patients' health.

This is an indicative tool and not a substitute for professional medical advice.

### Solution Overview
The app uses the Framingham Risk Score formula to calculate cardiovascular risk. It provides a user-friendly interface for inputting clinical parameters and displays the calculated risk score and associated information.

### Key Features
- **Risk Calculation Engine**: Implements the Framingham Risk Score algorithm for 10-year risk calculations.
- **Data Input Interface**: Allows users to input clinical parameters such as age, gender, cholesterol levels, blood pressure, smoking status, diabetes status, family history, and current medications.
- **Measurement units**: Allows users to input measurements in mg/DL or mmol/L. The calculator will provide a switch for selection of units and automatically convert to the required units.
- **Results Display**: Displays the calculated risk score, risk category, and provides visual representations of the risk.
- **Educational Content**: Provides explanations and recommendations based on risk factors and prevention strategies.
- **Data Management**: Allows users to save and load patient profiles locally and export results as a PDF.
- **Performance**: Results are calculated within 100ms.
- **Accessibility**: WCAG 2.1 AA compliance.
- **Browser Support**: Works on Chrome, Firefox, Safari, and Edge (last 2 versions).
- **Mobile Responsive**: Works on tablets and phones.
- **Data Privacy**: No data is sent to external servers.

---

## 2. User Stories & Requirements

### Primary User Stories
- [ ] **As a healthcare professional**, I want to quickly assess a patient's cardiovascular risk so that I can make informed treatment decisions
- [ ] **As an individual**, I want to understand my heart disease risk so that I can take preventive measures
- [ ] **As a researcher**, I want to use standardized risk calculations so that my data is comparable to other studies 

### Functional Requirements

#### Core Features
- [ ] **Risk Calculation Engine**
  - Implement Framingham Risk Score algorithm
  - Support both 10-year and lifetime risk calculations
  - Handle multiple risk factor combinations
  
- [ ] **Data Input Interface**
  - Age input with validation (30-79 years)
  - Gender selection
  - Cholesterol levels (Total, HDL, LDL) in mg/dL
  - Blood pressure (Systolic/Diastolic) in mmHg
  - Smoking status (current/former/never)
  - Diabetes status
  - Family history of heart disease
  - Current medications affecting risk

- [ ] **Results Display**
  - Risk percentage with confidence intervals
  - Risk category (Low/Moderate/High)
  - Visual risk representation (charts/gauges)
  - Comparison to average person of same age/gender
  - Actionable recommendations

#### Secondary Features
- [ ] **Educational Content**
  - Risk factor explanations
  - Prevention strategies
  - When to consult healthcare providers
  
- [ ] **Data Management**
  - Save/load patient profiles (local storage)
  - Export results as PDF
  - Print-friendly results page

### Non-Functional Requirements
- [ ] **Performance**: Results calculated within 100ms
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Browser Support**: Chrome, Firefox, Safari, Edge (last 2 versions)
- [ ] **Mobile Responsive**: Works on tablets and phones
- [ ] **Data Privacy**: No data sent to external servers

---

## 3. Technical Specifications

### Architecture Decisions
- [ ] **Frontend Framework**: React with functional components
- [ ] **State Management**: [React Context/Redux/Zustand]
- [ ] **Styling**: [CSS Modules/Styled Components/Tailwind]
- [ ] **Form Handling**: [Formik/React Hook Form/Custom]
- [ ] **Charts/Visualization**: [Chart.js/D3/Recharts]

### Data Models

#### Patient Input Model
```typescript
interface PatientData {
  age: number;                    // 30-79 years
  gender: 'male' | 'female';
  totalCholesterol: number;       // mg/dL or mmol/L
  hdlCholesterol: number;         // mg/dL or mmol/L
  systolicBP: number;            // mmHg or mmol/L
  diastolicBP: number;           // mmHg or mmol/L
  isSmoker: boolean;
  hasDiabetes: boolean;
  familyHistory: boolean;
  onBPMedication: boolean;
}
```

#### Risk Result Model
```typescript
interface RiskResult {
  tenYearRisk: number;           // Percentage
  riskCategory: 'low' | 'moderate' | 'high';
  recommendations: string[];
  comparisonData: {
    averageForAge: number;
    averageForGender: number;
  };
}
```

### Validation Rules
- [ ] **Age**: 30-79 years (Framingham study range)
- [ ] **Total Cholesterol**: 100-400 mg/dL
- [ ] **HDL Cholesterol**: 20-100 mg/dL
- [ ] **Blood Pressure**: Systolic 80-200, Diastolic 40-120 mmHg
- [ ] **Required Fields**: All fields must be completed for calculation

---

## 4. User Interface Design

### Wireframe Requirements
- [ ] **Landing Page**: Brief explanation + "Start Assessment" button
- [ ] **Input Form**: Step-by-step or single-page form
- [ ] **Results Page**: Risk score + visualization + recommendations
- [ ] **About Page**: Information about Framingham study and methodology

### Design System
- [ ] **Color Palette**: 
  - Primary: [Healthcare blue/green]
  - Risk Colors: Green (low), Yellow (moderate), Red (high)
  - Neutral: Grays for text and backgrounds
  
- [ ] **Typography**: 
  - Headers: [Font family and sizes]
  - Body: [Font family and sizes]
  - Ensure readability for older users

- [ ] **Components**:
  - Form inputs with clear labels
  - Progress indicators
  - Risk gauge/meter
  - Information tooltips
  - Responsive buttons

### Accessibility Requirements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Large text options
- [ ] Clear error messages

---

## 5. Implementation Plan

### Phase 1: Core Calculator (Week 1-2)
- [ ] Set up React project structure
- [ ] Implement Framingham algorithm
- [ ] Create basic input form
- [ ] Display risk calculation results

### Phase 2: Enhanced UI (Week 3)
- [ ] Add form validation
- [ ] Implement responsive design
- [ ] Add risk visualization
- [ ] Create results interpretation

### Phase 3: Polish & Features (Week 4)
- [ ] Add educational content
- [ ] Implement data persistence
- [ ] Add print/export functionality
- [ ] Accessibility testing and fixes

### Phase 4: Testing & Deployment (Week 5)
- [ ] Unit tests for calculation logic
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Deployment setup

---

## 6. Testing Strategy

### Unit Tests
- [ ] Framingham calculation accuracy
- [ ] Input validation functions
- [ ] Risk categorization logic
- [ ] Edge case handling

### Integration Tests
- [ ] Form submission flow
- [ ] Results display accuracy
- [ ] Data persistence
- [ ] Error handling

### User Testing
- [ ] Healthcare professional feedback
- [ ] General user usability testing
- [ ] Accessibility testing with assistive technologies

---

## 7. Risk Assessment & Mitigation

### Technical Risks
- [ ] **Algorithm Accuracy**: Verify against published Framingham data
- [ ] **Browser Compatibility**: Test across target browsers
- [ ] **Performance**: Optimize for older devices

### Medical/Legal Risks
- [ ] **Disclaimer**: Clear medical disclaimer about consulting healthcare providers
- [ ] **Accuracy**: Validate calculations against peer-reviewed sources
- [ ] **Scope**: Clearly define limitations of the tool

---

## 8. Success Metrics

### Technical Metrics
- [ ] Page load time < 2 seconds
- [ ] Calculation accuracy 99.9%
- [ ] Zero critical accessibility violations
- [ ] Mobile usability score > 90

### User Metrics
- [ ] User completion rate > 80%
- [ ] User satisfaction score > 4/5
- [ ] Healthcare professional adoption rate

---

## 9. Future Enhancements

### Version 2.0 Considerations
- [ ] Additional risk calculators (ASCVD, QRISK)
- [ ] Integration with health records
- [ ] Multi-language support
- [ ] Advanced visualizations
- [ ] Risk tracking over time

---

## 10. Appendices

### A. Framingham Risk Score Formula
[Include the actual mathematical formula and coefficients]

### B. Medical References
- [ ] Original Framingham Heart Study publications
- [ ] Updated risk factor coefficients
- [ ] Validation studies

### C. Regulatory Considerations
- [ ] FDA guidance for medical calculators
- [ ] HIPAA compliance (if applicable)
- [ ] International medical device regulations

---

**Template Instructions:**
1. Fill in all bracketed placeholders [LIKE_THIS]
2. Check off completed items with [x]
3. Add specific details relevant to your implementation
4. Update the version and date as the spec evolves
5. Get stakeholder approval before development begins