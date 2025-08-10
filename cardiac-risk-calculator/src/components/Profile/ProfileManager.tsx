import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal } from '../UI';
import { 
  getAllPatientProfiles, 
  loadPatientProfile, 
  deletePatientProfile,
  validateProfileData
} from '../../utils/storage';
import SaveProfileDialog from './SaveProfileDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import RenameProfileDialog from './RenameProfileDialog';
import type { PatientProfile, PatientData, RiskResult } from '../../types';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProfile: (profile: PatientProfile) => void;
  currentPatientData?: PatientData;
  currentRiskResult?: RiskResult;
}

interface ProfileSummary {
  id: string;
  name: string;
  updatedAt: Date;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  isOpen,
  onClose,
  onLoadProfile,
  currentPatientData,
  currentRiskResult,
}) => {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const profileList = await getAllPatientProfiles();
      setProfiles(profileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profiles when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen, loadProfiles]);

  const handleLoadProfile = useCallback(async (profileId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const profile = await loadPatientProfile(profileId);
      if (profile) {
        // Validate profile data structure
        if (!validateProfileData(profile)) {
          throw new Error('Profile data is corrupted or incompatible');
        }
        
        onLoadProfile(profile);
        onClose();
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [onLoadProfile, onClose]);

  const handleDeleteProfile = useCallback(async (profileId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      deletePatientProfile(profileId);
      await loadProfiles(); // Refresh the list
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    } finally {
      setLoading(false);
    }
  }, [loadProfiles]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRiskCategoryColor = (category?: string) => {
    switch (category) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Patient Profiles"
        size="lg"
      >
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {profiles.length} saved profile{profiles.length !== 1 ? 's' : ''}
            </div>
            {currentPatientData && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Save Current Data
              </Button>
            )}
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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading profiles...</span>
            </div>
          )}

          {/* Profiles List */}
          {!loading && profiles.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No saved profiles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Save your first patient profile to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {profiles.map((profile) => (
                <ProfileItem
                  key={profile.id}
                  profile={profile}
                  isSelected={selectedProfile === profile.id}
                  onSelect={() => setSelectedProfile(profile.id)}
                  onLoad={() => handleLoadProfile(profile.id)}
                  onRename={() => setShowRenameDialog(profile.id)}
                  onDelete={() => setShowDeleteConfirm(profile.id)}
                  formatDate={formatDate}
                  getRiskCategoryColor={getRiskCategoryColor}
                />
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Save Profile Dialog */}
      {showSaveDialog && currentPatientData && (
        <SaveProfileDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          patientData={currentPatientData}
          riskResult={currentRiskResult}
          onSave={loadProfiles}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          profileId={showDeleteConfirm}
          profileName={profiles.find(p => p.id === showDeleteConfirm)?.name || ''}
          onConfirm={() => handleDeleteProfile(showDeleteConfirm)}
        />
      )}

      {/* Rename Profile Dialog */}
      {showRenameDialog && (
        <RenameProfileDialog
          isOpen={!!showRenameDialog}
          onClose={() => setShowRenameDialog(null)}
          profileId={showRenameDialog}
          currentName={profiles.find(p => p.id === showRenameDialog)?.name || ''}
          onRename={loadProfiles}
        />
      )}
    </>
  );
};

// Profile Item Component
interface ProfileItemProps {
  profile: ProfileSummary;
  isSelected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onRename: () => void;
  onDelete: () => void;
  formatDate: (date: Date) => string;
  getRiskCategoryColor: (category?: string) => string;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  onLoad,
  onRename,
  onDelete,
  formatDate,
}) => {
  const [fullProfile, setFullProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Load full profile data for preview
  useEffect(() => {
    const loadFullProfile = async () => {
      setLoading(true);
      try {
        const full = await loadPatientProfile(profile.id);
        setFullProfile(full);
      } catch (err) {
        console.warn('Failed to load profile preview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFullProfile();
  }, [profile.id]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">{profile.name}</h4>
            {fullProfile?.riskResult && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                fullProfile.riskResult.riskCategory === 'low' ? 'text-green-600 bg-green-100' :
                fullProfile.riskResult.riskCategory === 'moderate' ? 'text-yellow-600 bg-yellow-100' :
                'text-red-600 bg-red-100'
              }`}>
                {fullProfile.riskResult.tenYearRisk.toFixed(1)}% risk
              </span>
            )}
          </div>
          
          <div className="mt-1 text-xs text-gray-500">
            {loading ? (
              'Loading...'
            ) : fullProfile ? (
              <>
                {fullProfile.patientData.gender}, age {fullProfile.patientData.age} • 
                Updated {formatDate(profile.updatedAt)}
              </>
            ) : (
              `Updated ${formatDate(profile.updatedAt)}`
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoad}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRename}
            className="p-1"
            aria-label="Rename profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Delete profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;