import React, { useState } from 'react';
import { Button, Modal } from '../UI';
import { savePatientProfile } from '../../utils/storage';
import type { PatientData, RiskResult } from '../../types';

interface SaveProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientData;
  riskResult?: RiskResult;
  onSave: () => void;
}

const SaveProfileDialog: React.FC<SaveProfileDialogProps> = ({
  isOpen,
  onClose,
  patientData,
  riskResult,
  onSave,
}) => {
  const [profileName, setProfileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!profileName.trim()) {
      setError('Please enter a profile name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profile = {
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: profileName.trim(),
        patientData,
        riskResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await savePatientProfile(profile);
      onSave();
      onClose();
      setProfileName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
      setProfileName('');
      setError(null);
    }
  };

  // Generate suggested name based on patient data
  const suggestedName = React.useMemo(() => {
    const gender = patientData.gender === 'male' ? 'M' : 'F';
    const age = patientData.age;
    const date = new Date().toLocaleDateString();
    return `Patient ${gender}${age} - ${date}`;
  }, [patientData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Save Patient Profile"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Save this patient's data and risk assessment for future reference.
          </p>

          {/* Profile Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Profile Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Age:</span> {patientData.age}
              </div>
              <div>
                <span className="text-gray-500">Gender:</span> {patientData.gender}
              </div>
              <div>
                <span className="text-gray-500">Total Cholesterol:</span> {patientData.totalCholesterol} {patientData.cholesterolUnit}
              </div>
              <div>
                <span className="text-gray-500">HDL Cholesterol:</span> {patientData.hdlCholesterol} {patientData.cholesterolUnit}
              </div>
              {riskResult && (
                <>
                  <div>
                    <span className="text-gray-500">Risk Score:</span> {riskResult.tenYearRisk.toFixed(1)}%
                  </div>
                  <div>
                    <span className="text-gray-500">Risk Category:</span> 
                    <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      riskResult.riskCategory === 'low' ? 'text-green-600 bg-green-100' :
                      riskResult.riskCategory === 'moderate' ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {riskResult.riskCategory}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Name Input */}
          <div>
            <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              id="profileName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter a name for this profile"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
              maxLength={100}
            />
            <div className="mt-1 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setProfileName(suggestedName)}
                className="text-xs text-blue-600 hover:text-blue-700"
                disabled={saving}
              >
                Use suggested: {suggestedName}
              </button>
              <span className="text-xs text-gray-500">
                {profileName.length}/100
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!profileName.trim() || saving}
          >
            Save Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveProfileDialog;