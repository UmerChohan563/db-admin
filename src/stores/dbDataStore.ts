import { create } from "zustand";
import type { DatabaseInfo } from "../types";
import { DUMMY_DATABASES } from "../utils/dummyData";

interface DbDataState {
  databases: DatabaseInfo[];
  setDatabases: (dbs: DatabaseInfo[]) => void;
}

export const useDbDataStore = create<DbDataState>((set) => ({
  databases: DUMMY_DATABASES,

  setDatabases: (dbs) => set({ databases: dbs }),
}));