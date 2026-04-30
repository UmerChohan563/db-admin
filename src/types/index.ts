export interface ConnectionCredentials {
  dbType: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database?: string;
}

export interface DatabaseInfo {
  name: string;
  tables: TableInfo[];
  totalSets?: number;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: string;
}

export interface TableRow {
  [key: string]: string | number | boolean | null;
}

export interface QueryResult {
  columns: string[];
  rows: TableRow[];
  rowsAffected?: number;
  executionTime?: number;
  error?: string;
}
