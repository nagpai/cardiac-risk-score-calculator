import React, { useState, useEffect } from 'react';
import { Button, Modal } from '../UI';
import { loadPatientProfile, savePatientProfile } from '../../utils/storage';

interface RenameProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  currentName: string;
  onRename: () => void;
}

const RenameProfileDialog: React.FC<RenameProfileDialogProps> = ({
  isOpen,
  onClose,
  profileId,
  currentName,
  onRename,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleRename = async () => {
    if (!newName.trim()) {
      setError('Please enter a profile name');
      return;
    }

    if (newName.trim() === currentName) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Load the existing profile
      const profile = await loadPatientProfile(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Update the profile with new name
      const updatedProfile = {
        ...profile,
        name: newName.trim(),
        updatedAt: new Date(),
      };

      await savePatientProfile(updatedProfile);
      onRename();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename profile');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
      setNewName(currentName);
      setError(null);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !saving) {
      handleRename();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename Profile"
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Enter a new name for this profile.
          </p>

          {/* Profile Name Input */}
          <div>
            <label htmlFor="newProfileName" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              id="newProfileName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter profile name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
              maxLength={100}
              autoFocus
            />
            <div className="mt-1 flex justify-end">
              <span className="text-xs text-gray-500">
                {newName.length}/100
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
            onClick={handleRename}
            loading={saving}
            disabled={!newName.trim() || saving}
          >
            Rename Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RenameProfileDialog;