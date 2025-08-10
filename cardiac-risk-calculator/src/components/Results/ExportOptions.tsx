import { useState } from 'react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import type { RiskResult, PatientData } from '../../types';

interface ExportOptionsProps {
  riskResult: RiskResult;
  patientData?: PatientData;
  className?: string;
}

/**
 * ExportOptions component provides PDF export and print functionality
 * for cardiovascular risk assessment results
 */
export default function ExportOptions({ riskResult, patientData, className = '' }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'summary' | 'detailed'>('summary');

  // Handle print functionality
  const handlePrint = async () => {
    setIsExporting(true);
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker settings.');
      }

      // Generate the print content
      const printContent = generatePrintContent(riskResult, patientData, exportFormat);
      
      // Write content to the print window
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
      
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print failed. Please try again or use your browser\'s print function.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF export using browser print API
  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a new window for PDF export
      const exportWindow = window.open('', '_blank');
      if (!exportWindow) {
        throw new Error('Unable to open export window. Please check your popup blocker settings.');
      }

      // Generate the export content
      const exportContent = generatePrintContent(riskResult, patientData, exportFormat);
      
      // Write content to the export window
      exportWindow.document.write(exportContent);
      exportWindow.document.close();
      
      // Wait for content to load, then trigger print dialog for PDF
      exportWindow.onload = () => {
        exportWindow.focus();
        // The user can choose "Save as PDF" in the print dialog
        exportWindow.print();
      };
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again or use your browser\'s print function to save as PDF.');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  // Generate formatted date string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate patient summary for export
  const generatePatientSummary = (data?: PatientData) => {
    if (!data) return '';
    
    return `
      <div class="patient-summary">
        <h3>Patient Information</h3>
        <div class="patient-grid">
          <div><strong>Age:</strong> ${data.age} years</div>
          <div><strong>Gender:</strong> ${data.gender}</div>
          <div><strong>Total Cholesterol:</strong> ${data.totalCholesterol} ${data.cholesterolUnit}</div>
          <div><strong>HDL Cholesterol:</strong> ${data.hdlCholesterol} ${data.cholesterolUnit}</div>
          ${data.ldlCholesterol ? `<div><strong>LDL Cholesterol:</strong> ${data.ldlCholesterol} ${data.cholesterolUnit}</div>` : ''}
          <div><strong>Blood Pressure:</strong> ${data.systolicBP}/${data.diastolicBP} mmHg</div>
          <div><strong>On BP Medication:</strong> ${data.onBPMedication ? 'Yes' : 'No'}</div>
          ${data.bloodGlucose ? `<div><strong>Blood Glucose:</strong> ${data.bloodGlucose} ${data.glucoseUnit}</div>` : ''}
          <div><strong>Smoking Status:</strong> ${data.smokingStatus}</div>
          <div><strong>Diabetes:</strong> ${data.hasDiabetes ? 'Yes' : 'No'}</div>
          <div><strong>Family History:</strong> ${data.familyHistory ? 'Yes' : 'No'}</div>
        </div>
      </div>
    `;
  };

  // Generate recommendations for export
  const generateRecommendations = (recommendations: RiskResult['recommendations'], format: 'summary' | 'detailed') => {
    if (!recommendations || recommendations.length === 0) return '';
    
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    const recsToShow = format === 'summary' ? highPriorityRecs : recommendations;
    
    return `
      <div class="recommendations">
        <h3>Recommendations ${format === 'summary' ? '(High Priority)' : ''}</h3>
        ${recsToShow.map(rec => `
          <div class="recommendation">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            ${format === 'detailed' && rec.actionItems.length > 0 ? `
              <ul class="action-items">
                ${rec.actionItems.map(item => `<li>${item}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  };

  // Generate complete print content
  const generatePrintContent = (result: RiskResult, patient?: PatientData, format: 'summary' | 'detailed' = 'summary') => {
    const { tenYearRisk, riskCategory, comparisonData, calculatedAt, framinghamVersion } = result;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cardiovascular Risk Assessment Report</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          <header class="print-header">
            <h1>Cardiovascular Risk Assessment Report</h1>
            <div class="report-info">
              <div>Generated: ${formatDate(calculatedAt)}</div>
              <div>Algorithm: Framingham Risk Score ${framinghamVersion}</div>
            </div>
          </header>

          <main class="print-main">
            <div class="risk-summary">
              <h2>Risk Assessment Summary</h2>
              <div class="risk-result ${riskCategory}">
                <div class="risk-percentage">${tenYearRisk.toFixed(1)}%</div>
                <div class="risk-category">${riskCategory.toUpperCase()} RISK</div>
                <div class="risk-description">
                  10-year cardiovascular risk
                </div>
              </div>
              
              <div class="risk-comparison">
                <h3>Risk Comparison</h3>
                <div class="comparison-grid">
                  <div><strong>Your Risk:</strong> ${tenYearRisk.toFixed(1)}%</div>
                  <div><strong>Age Average:</strong> ${comparisonData.averageForAge.toFixed(1)}%</div>
                  <div><strong>Gender Average:</strong> ${comparisonData.averageForGender.toFixed(1)}%</div>
                  <div><strong>Ideal Risk:</strong> ${comparisonData.idealRisk.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            ${patient ? generatePatientSummary(patient) : ''}
            ${generateRecommendations(result.recommendations, format)}

            <div class="disclaimer">
              <h3>Important Medical Disclaimer</h3>
              <p>
                This cardiovascular risk assessment is for educational and informational purposes only. 
                It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
                Always consult with your healthcare provider before making any decisions about your health care. 
                The Framingham Risk Score is one of several risk assessment tools and may not be appropriate 
                for all individuals or populations.
              </p>
            </div>
          </main>

          <footer class="print-footer">
            <p>This report was generated using the Framingham Risk Score algorithm based on data from the Framingham Heart Study.</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <>
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <Button
          variant="outline"
          onClick={() => setShowExportModal(true)}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export as PDF</span>
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={isExporting}
          loading={isExporting}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Report</span>
        </Button>
      </div>

      {/* Export Options Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Options"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportFormat"
                  value="summary"
                  checked={exportFormat === 'summary'}
                  onChange={(e) => setExportFormat(e.target.value as 'summary' | 'detailed')}
                  className="mr-2"
                />
                <span className="text-sm">Summary Report (High priority recommendations only)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportFormat"
                  value="detailed"
                  checked={exportFormat === 'detailed'}
                  onChange={(e) => setExportFormat(e.target.value as 'summary' | 'detailed')}
                  className="mr-2"
                />
                <span className="text-sm">Detailed Report (All recommendations and action items)</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Export Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The export will open in a new window where you can save as PDF using your browser's print function. 
                  Choose "Save as PDF" as the destination in the print dialog.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPDF}
              disabled={isExporting}
              loading={isExporting}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Print-specific CSS styles
function getPrintStyles() {
  return `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background: white;
    }

    .print-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }

    .print-header {
      text-align: center;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .print-header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 10px 0;
    }

    .report-info {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #6b7280;
    }

    .print-main {
      margin-bottom: 30px;
    }

    .risk-summary {
      margin-bottom: 30px;
    }

    .risk-summary h2 {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 20px 0;
    }

    .risk-result {
      text-align: center;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .risk-result.low {
      background-color: #f0fdf4;
      border: 2px solid #22c55e;
    }

    .risk-result.moderate {
      background-color: #fffbeb;
      border: 2px solid #f59e0b;
    }

    .risk-result.high {
      background-color: #fef2f2;
      border: 2px solid #ef4444;
    }

    .risk-percentage {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .risk-result.low .risk-percentage {
      color: #22c55e;
    }

    .risk-result.moderate .risk-percentage {
      color: #f59e0b;
    }

    .risk-result.high .risk-percentage {
      color: #ef4444;
    }

    .risk-category {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .risk-description {
      font-size: 14px;
      color: #6b7280;
    }

    .risk-comparison {
      margin-top: 20px;
    }

    .risk-comparison h3 {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 10px 0;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 14px;
    }

    .patient-summary {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }

    .patient-summary h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 15px 0;
    }

    .patient-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 14px;
    }

    .recommendations {
      margin-bottom: 30px;
    }

    .recommendations h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 20px 0;
    }

    .recommendation {
      margin-bottom: 20px;
      padding: 15px;
      border-left: 4px solid #3b82f6;
      background-color: #f8fafc;
    }

    .recommendation h4 {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 10px 0;
    }

    .recommendation p {
      font-size: 14px;
      color: #4b5563;
      margin: 0 0 10px 0;
    }

    .action-items {
      margin: 10px 0 0 20px;
      padding: 0;
    }

    .action-items li {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .disclaimer {
      margin-top: 40px;
      padding: 20px;
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
    }

    .disclaimer h3 {
      font-size: 16px;
      font-weight: bold;
      color: #92400e;
      margin: 0 0 10px 0;
    }

    .disclaimer p {
      font-size: 13px;
      color: #78350f;
      margin: 0;
    }

    .print-footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }

    .print-footer p {
      margin: 0;
    }

    @page {
      margin: 1in;
      size: letter;
    }

    @media print {
      .print-container {
        max-width: none;
        padding: 0;
      }
      
      .risk-result {
        break-inside: avoid;
      }
      
      .recommendation {
        break-inside: avoid;
      }
      
      .patient-summary {
        break-inside: avoid;
      }
    }
  `;
}