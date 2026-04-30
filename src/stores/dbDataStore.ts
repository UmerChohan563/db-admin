import { create } from "zustand";
import { apiService } from "../api/api";
import type { DatabaseInfo } from "../types";

interface DbDataState {
  databases: DatabaseInfo[];
  databasesLoading: boolean;
  databasesError: string | null;
  tablesLoading: string | null;
  tablesError: string | null;
  fetchDatabases: () => Promise<void>;
  fetchTables: (dbName: string) => Promise<void>;
  clearDatabases: () => void;
}

export const useDbDataStore = create<DbDataState>((set, get) => ({
  databases: [],
  databasesLoading: false,
  databasesError: null,
  tablesLoading: null,
  tablesError: null,

  fetchDatabases: async () => {
    set({ databasesLoading: true, databasesError: null });
    try {
      const dbList = await apiService.getDatabases();
      // Response format: [{ "name": "test", "totalSets": 4 }]
      const databases: DatabaseInfo[] = dbList.map((item: { name: string; totalSets: number }) => ({
        name: item.name,
        tables: [],
        totalSets: item.totalSets,
      }));
      set({ databases, databasesLoading: false, databasesError: null });
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      set({ databasesLoading: false, databasesError: (error as Error).message });
    }
  },

  fetchTables: async (dbName: string) => {
    set({ tablesLoading: dbName, tablesError: null });
    try {
      const tableList = await apiService.getTables(dbName);
      // Response format: [{ "name": "users", "totalRecords": 3 }]
      const databases = get().databases.map((db) =>
        db.name === dbName
          ? {
              ...db,
              tables: tableList.map((item: { name: string; totalRecords: number }) => ({
                name: item.name,
                rowCount: item.totalRecords,
                columns: [],
              })),
            }
          : db
      );
      set({ databases, tablesLoading: null });
    } catch (error) {
      set({ tablesLoading: null, tablesError: (error as Error).message });
    }
  },

  clearDatabases: () => set({ databases: [], tablesLoading: null, tablesError: null }),
}));