import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConnectionCredentials } from "../types";
import { DUMMY_CONNECTION } from "../utils/dummyData";

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
        dbType: DUMMY_CONNECTION.dbType,
        host: DUMMY_CONNECTION.host,
        port: DUMMY_CONNECTION.port,
        username: DUMMY_CONNECTION.username,
        password: DUMMY_CONNECTION.password,
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

        if (
          credentials.username === DUMMY_CONNECTION.username &&
          credentials.password === DUMMY_CONNECTION.password &&
          credentials.host === DUMMY_CONNECTION.host
        ) {
          set({
            isConnecting: false,
            isConnected: true,
          });
          saveToStorage(credentials, true);
        } else {
          set({
            isConnecting: false,
            connectionError: `Connection refused: could not connect to server "${credentials.host}:${credentials.port}". Check credentials and try again.`,
          });
        }
      },

      disconnect: () => {
        clearStorage();
        set({
          isConnected: false,
          connectionError: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: () => ({}),
    }
  )
);