import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl: string;
}

export const PRESET_PROFILES: UserProfile[] = [
  {
    id: 'sophia',
    name: 'Sophia Vance',
    title: 'Partner & Financial Director',
    email: 'sophia.vance@agencybook.io',
    role: 'Agency Partner / Administrator',
    organization: 'Agency Book Financial Advisory',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'rajesh',
    name: 'Dr. Rajesh Sharma',
    title: 'Chief MSME Policy Advisor',
    email: 'rajesh.sharma@msme-sentinel.gov.in',
    role: 'RBI & Government Liaison Officer',
    organization: 'Ministry of MSME / National Sentinel Taskforce',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'priya',
    name: 'Priya Patel',
    title: 'Chief Risk Officer (CRO)',
    email: 'priya.patel@sentinelrisk.in',
    role: 'Senior Credit Underwriter & Risk Lead',
    organization: 'Apex Credit Bureau & NBFC Consortium',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    title: 'SME Turnaround Strategist',
    email: 'vikram.m@indiasmes.org',
    role: 'TReDS & Emergency Capital Coordinator',
    organization: 'National SME Revival & Restructuring Forum',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
];

export const PRESET_AVATARS: { id: string; name: string; url: string }[] = [
  {
    id: 'avatar-1',
    name: 'Executive Portrait 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Executive Portrait 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Executive Portrait 3',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Executive Portrait 4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Executive Portrait 5',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    name: 'Executive Portrait 6',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
];

interface UserProfileContextType {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  switchPreset: (presetId: string) => void;
  presetProfiles: UserProfile[];
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'sme_app_user_profile';

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load user profile from storage', e);
      }
    }
    return PRESET_PROFILES[0];
  });

  // Keep user profile in sync when authentication state changes or new user registers
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfileState(e.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProfileState(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('sme_user_profile_updated', handleProfileUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('sme_user_profile_updated', handleProfileUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Failed to save profile to storage', e);
    }
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save profile update to storage', e);
      }
      return updated;
    });
  };

  const switchPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      setProfile(found);
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        switchPreset,
        presetProfiles: PRESET_PROFILES,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
