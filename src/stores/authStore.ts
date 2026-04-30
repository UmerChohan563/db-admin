import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConnectionCredentials } from "../types";
import { useDbDataStore } from "./dbDataStore";
import { useExplorerStore } from "./tablesStore";

interface AuthState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  credentials: ConnectionCredentials;

  setCredentials: (creds: Partial<ConnectionCredentials>) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const STORAGE_KEY = "db-admin-auth";

interface StoredData {
  credentials: ConnectionCredentials;
  isConnected: boolean;
}

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
};

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const saveToStorage = (credentials: ConnectionCredentials, isConnected: boolean) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ credentials, isConnected })
  );
};

const savedData = loadFromStorage();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isConnected: savedData?.isConnected ?? false,
      isConnecting: false,
      connectionError: null,
      credentials: savedData?.credentials ?? {
        dbType: "",
        host: "",
        port: "",
        username: "",
        password: "",
      },

      setCredentials: (creds) =>
        set((state) => ({
          credentials: { ...state.credentials, ...creds },
          connectionError: null,
        })),

      connect: async () => {
        const { credentials } = get();
        set({ isConnecting: true, connectionError: null });

        await new Promise((r) => setTimeout(r, 1400));

        set({
          isConnecting: false,
          isConnected: true,
        });
        saveToStorage(credentials, true);
      },

       disconnect: () => {
         clearStorage();
         set({
           isConnected: false,
           connectionError: null,
         });
         // Reset other stores
         useDbDataStore.getState().clearDatabases();
         useExplorerStore.getState().resetExplorer?.();
       },
    }),
    {
      name: STORAGE_KEY,
      partialize: () => ({}),
    }
  )
);