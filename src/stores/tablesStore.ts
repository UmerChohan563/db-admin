import { create } from "zustand";
import type { TableRow, QueryResult } from "../types";
import { apiService } from "../api/api";
import { simulateQuery } from "../utils/queryData";
import { generateId } from "../utils/format";

interface ExplorerState {
  activeView: "table" | "query";
  activeDatabase: string | null;
  activeTable: string | null;
  expandedDatabases: Set<string>;
  tableData: TableRow[];
  tableColumns: string[];
  tableColumnTypes: Record<string, string>;
  tablePage: number;
  tableTake: number;
  tableTotalOnPage: number;
  querySQL: string;
  queryResult: QueryResult | null;
  isQueryRunning: boolean;
  isTableLoading: boolean;

  setActiveView: (view: "table" | "query") => void;
  toggleDatabase: (dbName: string) => void;
  openTable: (dbName: string, tableName: string, page?: number, take?: number) => Promise<void>;
  setTablePage: (page: number) => void;
  setTableTake: (take: number) => void;
  updateCell: (rowIndex: number, column: string, value: string | number | null) => void;
  addRow: () => void;
  deleteRow: (rowIndex: number) => void;
  addColumn: (columnName: string) => void;
  setQuerySQL: (sql: string) => void;
  runQuery: () => Promise<void>;
  resetExplorer: () => void;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  activeView: "table",
  activeDatabase: null,
  activeTable: null,
  expandedDatabases: new Set(),
  tableData: [],
  tableColumns: [],
  tableColumnTypes: {},
  tablePage: 1,
  tableTake: 10,
  tableTotalOnPage: 0,
  querySQL: "",
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

  setTablePage: (page) => {
    const { activeDatabase, activeTable, tableTake } = get();
    if (activeDatabase && activeTable) {
      get().openTable(activeDatabase, activeTable, page, tableTake);
    }
  },

  setTableTake: (take) => {
    const { activeDatabase, activeTable } = get();
    if (activeDatabase && activeTable) {
      get().openTable(activeDatabase, activeTable, 1, take);
    }
  },

  openTable: async (dbName, tableName, page = 1, take = 10) => {
    set({ isTableLoading: true, activeDatabase: dbName, activeTable: tableName, activeView: "table" });

    try {
      const [recordsResponse, schemaResponse] = await Promise.all([
        apiService.getTableRecords(dbName, tableName, page, take),
        apiService.getTableSchema(dbName, tableName),
      ]);

      // Build column types from schema API response
      const columnTypes: Record<string, string> = {};
      if (schemaResponse.bins) {
        schemaResponse.bins.forEach((bin: { name: string; type: string }) => {
          columnTypes[bin.name] = bin.type;
        });
      }

      // Extract columns from records (fallback to schema bins if no records)
      const firstRecord = recordsResponse.records[0];
      const columns = firstRecord?.meta?.types 
        ? Object.keys(firstRecord.meta.types)
        : (schemaResponse.bins?.map((b: { name: string }) => b.name) ?? []);

      const rows = recordsResponse.records.map((record: { data: Record<string, unknown> }) => ({
        _id: generateId(),
        ...record.data,
      }));

      set({
        tableData: rows,
        tableColumns: columns,
        tableColumnTypes: columnTypes,
        tablePage: recordsResponse.page,
        tableTake: recordsResponse.take,
        tableTotalOnPage: recordsResponse.total_on_page,
        isTableLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch table data:", error);
      set({ tableData: [], tableColumns: [], tableColumnTypes: {}, isTableLoading: false });
    }
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

  resetExplorer: () => {
    set({
      activeView: "table",
      activeDatabase: null,
      activeTable: null,
      expandedDatabases: new Set(),
      tableData: [],
      tableColumns: [],
      tableColumnTypes: {},
      tablePage: 1,
      tableTake: 10,
      tableTotalOnPage: 0,
      querySQL: "",
      queryResult: null,
      isQueryRunning: false,
      isTableLoading: false,
    });
  },
}));