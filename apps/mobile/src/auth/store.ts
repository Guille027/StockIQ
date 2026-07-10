import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

const secureStoreAdapter = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hydrated: false,
      setSession: (accessToken, user) => set({ accessToken, user }),
      clearSession: () => set({ accessToken: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "stockiq-auth",
      storage: createJSONStorage(() => secureStoreAdapter),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);
