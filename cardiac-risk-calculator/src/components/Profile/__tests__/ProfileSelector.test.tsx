import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileSelector from '../ProfileSelector';
import * as storage from '../../../utils/storage';

// Mock the storage utilities
vi.mock('../../../utils/storage', () => ({
  getAllPatientProfiles: vi.fn(),
  loadPatientProfile: vi.fn(),
}));

const mockOnLoadProfile = vi.fn();
const mockOnManageProfiles = vi.fn();

describe('ProfileSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows message when no profiles exist', async () => {
    vi.mocked(storage.getAllPatientProfiles).mockResolvedValue([]);

    render(
      <ProfileSelector
        onLoadProfile={mockOnLoadProfile}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Saved Profiles')).toBeInTheDocument();
    });
  });

  it('displays available profiles in selector', async () => {
    const mockProfiles = [
      {
        id: 'profile1',
        name: 'Test Profile 1',
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'profile2',
        name: 'Test Profile 2',
        updatedAt: new Date('2024-01-02'),
      },
    ];

    vi.mocked(storage.getAllPatientProfiles).mockResolvedValue(mockProfiles);

    render(
      <ProfileSelector
        onLoadProfile={mockOnLoadProfile}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Load Saved Profile')).toBeInTheDocument();
      expect(screen.getByText('2 saved profiles')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('loads selected profile when Load Profile button is clicked', async () => {
    const mockProfiles = [
      {
        id: 'profile1',
        name: 'Test Profile 1',
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const mockProfile = {
      id: 'profile1',
      name: 'Test Profile 1',
      patientData: {
        age: 45,
        gender: 'male' as const,
        totalCholesterol: 200,
        hdlCholesterol: 50,
        cholesterolUnit: 'mg/dL' as const,
        systolicBP: 120,
        diastolicBP: 80,
        onBPMedication: false,
        glucoseUnit: 'mg/dL' as const,
        smokingStatus: 'never' as const,
        hasDiabetes: false,
        familyHistory: false,
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    vi.mocked(storage.getAllPatientProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(storage.loadPatientProfile).mockResolvedValue(mockProfile);

    render(
      <ProfileSelector
        onLoadProfile={mockOnLoadProfile}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select a profile
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'profile1' } });

    // Click load button
    const loadButton = screen.getByText('Load Profile');
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(mockOnLoadProfile).toHaveBeenCalledWith(mockProfile);
    });
  });

  it('calls onManageProfiles when Manage All button is clicked', async () => {
    const mockProfiles = [
      {
        id: 'profile1',
        name: 'Test Profile 1',
        updatedAt: new Date('2024-01-01'),
      },
    ];

    vi.mocked(storage.getAllPatientProfiles).mockResolvedValue(mockProfiles);

    render(
      <ProfileSelector
        onLoadProfile={mockOnLoadProfile}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Manage All')).toBeInTheDocument();
    });

    const manageButton = screen.getByText('Manage All');
    fireEvent.click(manageButton);

    expect(mockOnManageProfiles).toHaveBeenCalled();
  });
});