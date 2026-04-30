import type { QueryResult } from "../types";

export function simulateQuery(sql: string): QueryResult {
  const normalized = sql.trim().toLowerCase();

  if (normalized.startsWith("select")) {
    return {
      columns: [],
      rows: [],
      rowsAffected: 0,
      executionTime: Math.floor(Math.random() * 50) + 5,
    };
  }

  if (normalized.startsWith("insert")) {
    return {
      columns: [],
      rows: [],
      rowsAffected: 1,
      executionTime: Math.floor(Math.random() * 20) + 2,
    };
  }

  if (normalized.startsWith("update")) {
    return {
      columns: [],
      rows: [],
      rowsAffected: Math.floor(Math.random() * 5) + 1,
      executionTime: Math.floor(Math.random() * 30) + 5,
    };
  }

  if (normalized.startsWith("delete")) {
    return {
      columns: [],
      rows: [],
      rowsAffected: Math.floor(Math.random() * 3) + 1,
      executionTime: Math.floor(Math.random() * 25) + 3,
    };
  }

  return {
    columns: [],
    rows: [],
    error: "Unsupported query type in demo mode.",
  };
}