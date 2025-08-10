import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import { getAllPatientProfiles, loadPatientProfile } from '../../utils/storage';
import type { PatientProfile } from '../../types';

interface ProfileSelectorProps {
  onLoadProfile: (profile: PatientProfile) => void;
  onManageProfiles: () => void;
  disabled?: boolean;
}

interface ProfileSummary {
  id: string;
  name: string;
  updatedAt: Date;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onLoadProfile,
  onManageProfiles,
  disabled = false,
}) => {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const profileList = await getAllPatientProfiles();
      setProfiles(profileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    }
  };

  const handleLoadProfile = async () => {
    if (!selectedProfileId) return;

    setLoading(true);
    setError(null);

    try {
      const profile = await loadPatientProfile(selectedProfileId);
      if (profile) {
        onLoadProfile(profile);
        setSelectedProfileId(''); // Reset selection
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (profiles.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">No Saved Profiles</h4>
            <p className="text-sm text-blue-700">
              Complete a risk assessment to save your first patient profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Load Saved Profile</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onManageProfiles}
          disabled={disabled}
          className="text-blue-600 hover:text-blue-700"
        >
          Manage All
        </Button>
      </div>

      <div className="space-y-3">
        {/* Profile Selector */}
        <div>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            disabled={disabled || loading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a profile to load...</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} - {formatDate(profile.updatedAt)}
              </option>
            ))}
          </select>
        </div>

        {/* Load Button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {profiles.length} saved profile{profiles.length !== 1 ? 's' : ''}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadProfile}
            disabled={disabled || loading || !selectedProfileId}
            loading={loading}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load Profile
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex">
              <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;