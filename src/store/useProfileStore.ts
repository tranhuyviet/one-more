import { create } from 'zustand';
import { Profile, Language, AppearanceMode } from '@/types';
import { getProfile, createProfile, updateProfile } from '@/firebase/profile';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  createProfile: (userId: string, name: string, language: Language) => Promise<void>;
  updateName: (userId: string, name: string) => Promise<void>;
  updateLanguage: (userId: string, language: Language) => Promise<void>;
  setAppearance: (userId: string, mode: AppearanceMode) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: true,

  loadProfile: async (userId) => {
    const profile = await getProfile(userId);
    set({ profile, loading: false });
  },

  createProfile: async (userId, name, language) => {
    await createProfile(userId, name, language);
    const profile = await getProfile(userId);
    set({ profile });
  },

  updateName: async (userId, name) => {
    await updateProfile(userId, { name });
    set(s => ({ profile: s.profile ? { ...s.profile, name } : null }));
  },

  updateLanguage: async (userId, language) => {
    await updateProfile(userId, { language });
    set(s => ({ profile: s.profile ? { ...s.profile, language } : null }));
  },

  setAppearance: async (userId, mode) => {
    await updateProfile(userId, { darkMode: mode });
    set(s => ({ profile: s.profile ? { ...s.profile, darkMode: mode } : null }));
  },
}));
