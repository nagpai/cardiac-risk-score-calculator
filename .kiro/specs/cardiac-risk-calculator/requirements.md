# Requirements Document

## Introduction

The Cardiac Risk Score Calculator is a web-based application that calculates cardiovascular risk using the proven Framingham Risk Score formula. The calculator helps users assess their 10-year risk of experiencing a cardiac event based on clinical parameters such as age, gender, cholesterol levels, blood pressure, smoking status, diabetes status, and family history. This tool serves healthcare professionals, individuals, and researchers who need scientifically-backed cardiovascular risk assessment in an accessible, user-friendly interface.

## Requirements

### Requirement 1

**User Story:** As a healthcare professional, I want to quickly assess a patient's cardiovascular risk so that I can make informed treatment decisions

#### Acceptance Criteria

1. WHEN a healthcare professional enters valid patient data THEN the system SHALL calculate and display the 10-year cardiovascular risk within 100ms
2. WHEN the risk calculation is complete THEN the system SHALL display the risk percentage, risk category (Low <10%, Moderate 10-20%, High ≥20%), and clinical recommendations
3. WHEN viewing results THEN the system SHALL provide comparison data showing average risk for the patient's age and gender
4. WHEN the professional needs to save patient data THEN the system SHALL allow saving profiles locally without sending data to external servers

### Requirement 2

**User Story:** As an individual, I want to understand my heart disease risk so that I can take preventive measures

#### Acceptance Criteria

1. WHEN an individual accesses the calculator THEN the system SHALL provide a clear, user-friendly interface for entering personal health data
2. WHEN entering health parameters THEN the system SHALL validate all inputs against medical ranges and provide clear error messages for invalid entries
3. WHEN the risk assessment is complete THEN the system SHALL display results with visual representations (charts/gauges) and actionable recommendations
4. WHEN viewing results THEN the system SHALL provide educational content explaining risk factors and prevention strategies
5. WHEN the user wants to track their data THEN the system SHALL allow exporting results as PDF and printing

### Requirement 3

**User Story:** As a researcher, I want to use standardized risk calculations so that my data is comparable to other studies

#### Acceptance Criteria

1. WHEN performing risk calculations THEN the system SHALL implement the exact Framingham Risk Score algorithm with validated coefficients
2. WHEN entering research data THEN the system SHALL accept inputs in both mg/dL and mmol/L units for cholesterol and glucose measurements
3. WHEN switching measurement units THEN the system SHALL automatically convert values and maintain calculation accuracy
4. WHEN exporting data THEN the system SHALL provide standardized output formats that include all input parameters and calculated results

### Requirement 4

**User Story:** As any user of the system, I want the application to be accessible and work reliably across different devices and browsers

#### Acceptance Criteria

1. WHEN accessing the application THEN the system SHALL be fully responsive and functional on desktop, tablet, and mobile devices
2. WHEN using assistive technologies THEN the system SHALL comply with WCAG 2.1 AA accessibility standards
3. WHEN using different browsers THEN the system SHALL work consistently on Chrome, Firefox, Safari, and Edge (last 2 versions)
4. WHEN navigating the interface THEN the system SHALL support full keyboard navigation and screen reader compatibility
5. WHEN the page loads THEN the system SHALL complete initial loading within 2 seconds

### Requirement 5

**User Story:** As a user entering health data, I want the system to validate my inputs and guide me through the process safely

#### Acceptance Criteria

1. WHEN entering age THEN the system SHALL only accept values between 30-79 years (Framingham study range)
2. WHEN entering cholesterol levels THEN the system SHALL validate Total Cholesterol (100-400 mg/dL), HDL Cholesterol (20-100 mg/dL), and LDL Cholesterol within medically acceptable ranges
3. WHEN entering blood pressure THEN the system SHALL validate Systolic BP (80-200 mmHg) and Diastolic BP (40-120 mmHg)
4. WHEN entering glucose levels THEN the system SHALL validate blood glucose values and accept both mg/dL and mmol/L units
5. WHEN any required field is missing or invalid THEN the system SHALL prevent calculation and display clear, specific error messages
6. WHEN all fields are completed with valid data THEN the system SHALL enable the calculate button

### Requirement 6

**User Story:** As a user concerned about data privacy, I want assurance that my health information remains secure and private

#### Acceptance Criteria

1. WHEN using the application THEN the system SHALL process all calculations locally without sending data to external servers
2. WHEN saving patient profiles THEN the system SHALL store data only in local browser storage
3. WHEN displaying the application THEN the system SHALL include clear medical disclaimers stating this is not a substitute for professional medical advice
4. WHEN viewing any page THEN the system SHALL display privacy information confirming no data transmission to external servers

### Requirement 7

**User Story:** As a user viewing my risk results, I want clear interpretation and actionable guidance based on my risk level

#### Acceptance Criteria

1. WHEN risk is calculated as Low (<10%) THEN the system SHALL display green indicators and recommend continued healthy lifestyle practices
2. WHEN risk is calculated as Moderate (10-20%) THEN the system SHALL display yellow indicators and recommend lifestyle modifications with medical consultation
3. WHEN risk is calculated as High (≥20%) THEN the system SHALL display red indicators and strongly recommend immediate medical consultation
4. WHEN viewing any risk level THEN the system SHALL provide specific, actionable recommendations relevant to that risk category
5. WHEN results are displayed THEN the system SHALL include educational links to reputable medical resources for further information