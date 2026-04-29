import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConnectionCredentials, DatabaseInfo } from "../types";
import { DUMMY_DATABASES, DUMMY_CONNECTION } from "../utils/dummyData";

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  credentials: ConnectionCredentials;
  databases: DatabaseInfo[];

  setCredentials: (creds: Partial<ConnectionCredentials>) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const STORAGE_KEY = "db-admin-connection";

interface StoredData {
  credentials: ConnectionCredentials;
  isConnected: boolean;
  databases: DatabaseInfo[];
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

const saveToStorage = (credentials: ConnectionCredentials, isConnected: boolean, databases: DatabaseInfo[]) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ credentials, isConnected, databases })
  );
};

const savedData = loadFromStorage();

export const useConnectionStore = create<ConnectionState>()(
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
      databases: savedData?.databases ?? [],

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
            databases: DUMMY_DATABASES,
          });
          saveToStorage(credentials, true, DUMMY_DATABASES);
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
          databases: [],
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
