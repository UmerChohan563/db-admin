import { create } from "zustand";
import type { TableRow, QueryResult } from "../types";
import { DUMMY_TABLE_DATA, simulateQuery } from "../utils/dummyData";
import { generateId } from "../utils/format";
import { useDbDataStore } from "./dbDataStore";

interface ExplorerState {
  activeView: "table" | "query";
  activeDatabase: string | null;
  activeTable: string | null;
  expandedDatabases: Set<string>;
  tableData: TableRow[];
  tableColumns: string[];
  querySQL: string;
  queryResult: QueryResult | null;
  isQueryRunning: boolean;
  isTableLoading: boolean;

  setActiveView: (view: "table" | "query") => void;
  toggleDatabase: (dbName: string) => void;
  openTable: (dbName: string, tableName: string) => Promise<void>;
  updateCell: (rowIndex: number, column: string, value: string | number | null) => void;
  addRow: () => void;
  deleteRow: (rowIndex: number) => void;
  addColumn: (columnName: string) => void;
  setQuerySQL: (sql: string) => void;
  runQuery: () => Promise<void>;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  activeView: "table",
  activeDatabase: null,
  activeTable: null,
  expandedDatabases: new Set(),
  tableData: [],
  tableColumns: [],
  querySQL: "SELECT * FROM users LIMIT 100;",
  queryResult: null,
  isQueryRunning: false,
  isTableLoading: false,

  setActiveView: (view) => set({ activeView: view }),

  toggleDatabase: (dbName) => {
    const { expandedDatabases } = get();
    const next = new Set(expandedDatabases);
    if (next.has(dbName)) {
      next.delete(dbName);
    } else {
      next.add(dbName);
    }
    set({ expandedDatabases: next });
  },

  openTable: async (dbName, tableName) => {
    set({ isTableLoading: true, activeDatabase: dbName, activeTable: tableName, activeView: "table" });
    await new Promise((r) => setTimeout(r, 400));

    const dbData = DUMMY_TABLE_DATA[dbName];
    if (!dbData || !dbData[tableName]) {
      set({ tableData: [], tableColumns: [], isTableLoading: false });
      return;
    }

    const rawRows = dbData[tableName];

    const databases = useDbDataStore.getState().databases;
    const tableInfo = databases.find((d) => d.name === dbName)?.tables.find((t) => t.name === tableName);
    const columns = tableInfo?.columns.map((c) => c.name) ?? [];

    const rows: TableRow[] = rawRows.map((row) => {
      const obj: TableRow = { _id: generateId() };
      columns.forEach((col, i) => {
        obj[col] = row[i] as string | number | boolean | null;
      });
      return obj;
    });

    set({ tableData: rows, tableColumns: columns, isTableLoading: false });
  },

  updateCell: (rowIndex, column, value) => {
    const { tableData } = get();
    const updated = [...tableData];
    updated[rowIndex] = { ...updated[rowIndex], [column]: value };
    set({ tableData: updated });
  },

  addRow: () => {
    const { tableData, tableColumns } = get();
    const newRow: TableRow = { _id: generateId() };
    tableColumns.forEach((col) => (newRow[col] = ""));
    set({ tableData: [...tableData, newRow] });
  },

  deleteRow: (rowIndex) => {
    const { tableData } = get();
    set({ tableData: tableData.filter((_, i) => i !== rowIndex) });
  },

  addColumn: (columnName) => {
    const { tableColumns, tableData } = get();
    if (tableColumns.includes(columnName)) return;
    const updated = tableData.map((row) => ({ ...row, [columnName]: null }));
    set({ tableColumns: [...tableColumns, columnName], tableData: updated });
  },

  setQuerySQL: (sql) => set({ querySQL: sql }),

  runQuery: async () => {
    const { querySQL } = get();
    if (!querySQL.trim()) return;
    set({ isQueryRunning: true, queryResult: null });
    await new Promise((r) => setTimeout(r, 800));
    const result = simulateQuery(querySQL);
    set({ queryResult: result, isQueryRunning: false });
  },
}));
