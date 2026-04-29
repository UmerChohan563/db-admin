import { create } from "zustand";
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

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  credentials: {
    dbType: DUMMY_CONNECTION.dbType,
    host: DUMMY_CONNECTION.host,
    port: DUMMY_CONNECTION.port,
    username: DUMMY_CONNECTION.username,
    password: DUMMY_CONNECTION.password,
  },
  databases: [],

  setCredentials: (creds) =>
    set((state) => ({
      credentials: { ...state.credentials, ...creds },
      connectionError: null,
    })),

  connect: async () => {
    const { credentials } = get();
    set({ isConnecting: true, connectionError: null });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1400));

    // Validate dummy credentials
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
    } else {
      set({
        isConnecting: false,
        connectionError: `Connection refused: could not connect to server "${credentials.host}:${credentials.port}". Check credentials and try again.`,
      });
    }
  },

  disconnect: () =>
    set({
      isConnected: false,
      databases: [],
      connectionError: null,
    }),
}));
