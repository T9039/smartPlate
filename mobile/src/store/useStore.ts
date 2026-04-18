import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null, // In RN, you'd use AsyncStorage or SecureStore
  token: null,
  setAuth: (user, token) => {
    set({ user, token });
  },
  logout: () => {
    set({ user: null, token: null });
  },
}));

interface AppState {
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set: any) => ({
  isScanning: false,
  setIsScanning: (val) => set({ isScanning: val }),
}));
