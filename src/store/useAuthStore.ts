import { create } from 'zustand';
import { User } from 'firebase/auth';
import { signInAnon } from '@/firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signIn: async () => {
    const user = await signInAnon();
    set({ user, loading: false });
  },
}));
