import { create } from 'zustand';
import client from '../lib/hiveClient';

interface AuthState {
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
}

declare global {
  interface Window {
    hive_keychain: any;
  }
}

const useAuthStore = create<AuthState>((set) => ({
  username: null,
  isAuthenticated: false,
  login: async (username: string) => {
    try {
      if (!window.hive_keychain) {
        throw new Error('Hive Keychain extension is not installed');
      }

      // Get account data first to verify the account exists
      const [account] = await client.database.getAccounts([username]);
      if (!account) {
        throw new Error('Account not found');
      }

      // Generate a random memo for signing
      const memo = `Login verification for Hive Analytics: ${Math.random().toString(36).substring(2)}`;

      return new Promise((resolve) => {
        window.hive_keychain.requestSignBuffer(
          username,
          memo,
          'Posting',
          async (response: any) => {
            if (response.success) {
              set({ username, isAuthenticated: true });
              resolve(true);
            } else {
              set({ username: null, isAuthenticated: false });
              resolve(false);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Login error:', error.message || 'Authentication failed');
      set({ username: null, isAuthenticated: false });
      return false;
    }
  },
  logout: () => set({ username: null, isAuthenticated: false }),
}));

export default useAuthStore;