import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface AppState {
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  setIsScanning: (val) => set({ isScanning: val }),
}));
