import type { DatabaseInfo, QueryResult } from "../types";

export const DUMMY_TABLE_DATA: Record<string, Record<string, (string | number | boolean | null)[][]>> = {
  ecommerce_db: {
    users: [
      [1, "john_doe", "john@example.com", "2024-01-15 10:23:00", true],
      [2, "jane_smith", "jane@example.com", "2024-01-16 14:05:00", true],
      [3, "bob_wilson", "bob@example.com", "2024-02-01 09:12:00", false],
      [4, "alice_jones", "alice@example.com", "2024-02-10 16:45:00", true],
      [5, "charlie_brown", "charlie@example.com", "2024-03-05 11:30:00", true],
      [6, "diana_prince", "diana@example.com", "2024-03-12 08:20:00", true],
      [7, "evan_rogers", "evan@example.com", "2024-04-01 13:00:00", false],
      [8, "fiona_apple", "fiona@example.com", "2024-04-15 17:10:00", true],
    ],
    products: [
      [1, "Wireless Headphones", 79.99, 245, 3],
      [2, "USB-C Hub", 34.99, 512, 1],
      [3, "Mechanical Keyboard", 129.99, 89, 1],
      [4, "4K Monitor", 349.99, 34, 2],
      [5, "Webcam HD", 59.99, 178, 1],
      [6, "Gaming Mouse", 49.99, 302, 3],
      [7, "Laptop Stand", 29.99, 421, 2],
      [8, "Cable Management Kit", 14.99, 673, 1],
    ],
    orders: [
      [1, 2, 129.98, "completed", "2024-04-01 10:00:00"],
      [2, 1, 34.99, "shipped", "2024-04-02 11:30:00"],
      [3, 4, 399.98, "pending", "2024-04-03 09:15:00"],
      [4, 3, 79.99, "cancelled", "2024-04-04 14:20:00"],
      [5, 5, 209.97, "completed", "2024-04-05 16:45:00"],
      [6, 2, 49.99, "shipped", "2024-04-06 12:00:00"],
    ],
    categories: [
      [1, "Electronics", null],
      [2, "Computer Accessories", 1],
      [3, "Gaming", 1],
      [4, "Audio", 1],
    ],
  },
  analytics_db: {
    events: [
      [1, "page_view", 2, '{"page": "/home"}', "2024-04-01 10:00:00"],
      [2, "click", 2, '{"element": "buy_button"}', "2024-04-01 10:01:23"],
      [3, "page_view", 1, '{"page": "/products"}', "2024-04-01 10:05:00"],
      [4, "search", 3, '{"query": "headphones"}', "2024-04-01 10:08:12"],
      [5, "purchase", 2, '{"order_id": 1}', "2024-04-01 10:12:00"],
    ],
    sessions: [
      ["a1b2c3d4-...", 2, "2024-04-01 10:00:00", "2024-04-01 10:45:00", "192.168.1.1"],
      ["e5f6g7h8-...", 1, "2024-04-01 10:05:00", null, "10.0.0.2"],
      ["i9j0k1l2-...", 3, "2024-04-01 10:08:00", "2024-04-01 10:30:00", "172.16.0.3"],
    ],
  },
  hr_system: {
    employees: [
      [1, "Alice", "Johnson", "Engineering", 95000, "2021-03-15"],
      [2, "Bob", "Martinez", "Marketing", 72000, "2020-06-01"],
      [3, "Carol", "White", "Engineering", 105000, "2019-09-10"],
      [4, "David", "Lee", "HR", 68000, "2022-01-20"],
      [5, "Emma", "Davis", "Engineering", 98000, "2021-11-05"],
    ],
    departments: [
      [1, "Engineering", 3],
      [2, "Marketing", 2],
      [3, "HR", 4],
      [4, "Finance", null],
    ],
  },
};

export const getRowCount = (dbName: string, tableName: string): number => {
  return DUMMY_TABLE_DATA[dbName]?.[tableName]?.length ?? 0;
};

export const DUMMY_DATABASES: DatabaseInfo[] = [
  {
    name: "ecommerce_db",
    tables: [
      {
        name: "users",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "username", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "email", type: "varchar(255)", nullable: false, primaryKey: false },
          { name: "created_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
          { name: "is_active", type: "boolean", nullable: false, primaryKey: false, defaultValue: "true" },
        ],
      },
      {
        name: "products",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "name", type: "varchar(200)", nullable: false, primaryKey: false },
          { name: "price", type: "numeric(10,2)", nullable: false, primaryKey: false },
          { name: "stock", type: "integer", nullable: false, primaryKey: false, defaultValue: "0" },
          { name: "category_id", type: "integer", nullable: true, primaryKey: false },
        ],
      },
      {
        name: "orders",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "user_id", type: "integer", nullable: false, primaryKey: false },
          { name: "total", type: "numeric(10,2)", nullable: false, primaryKey: false },
          { name: "status", type: "varchar(50)", nullable: false, primaryKey: false, defaultValue: "'pending'" },
          { name: "created_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
        ],
      },
      {
        name: "categories",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "name", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "parent_id", type: "integer", nullable: true, primaryKey: false },
        ],
      },
    ],
  },
  {
    name: "analytics_db",
    tables: [
      {
        name: "events",
        rowCount: 0,
        columns: [
          { name: "id", type: "bigint", nullable: false, primaryKey: true },
          { name: "event_type", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "user_id", type: "integer", nullable: true, primaryKey: false },
          { name: "metadata", type: "jsonb", nullable: true, primaryKey: false },
          { name: "timestamp", type: "timestamp", nullable: false, primaryKey: false },
        ],
      },
      {
        name: "sessions",
        rowCount: 0,
        columns: [
          { name: "id", type: "uuid", nullable: false, primaryKey: true },
          { name: "user_id", type: "integer", nullable: true, primaryKey: false },
          { name: "started_at", type: "timestamp", nullable: false, primaryKey: false },
          { name: "ended_at", type: "timestamp", nullable: true, primaryKey: false },
          { name: "ip_address", type: "inet", nullable: true, primaryKey: false },
        ],
      },
    ],
  },
  {
    name: "hr_system",
    tables: [
      {
        name: "employees",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "first_name", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "last_name", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "department", type: "varchar(100)", nullable: true, primaryKey: false },
          { name: "salary", type: "numeric(12,2)", nullable: false, primaryKey: false },
          { name: "hire_date", type: "date", nullable: false, primaryKey: false },
        ],
      },
      {
        name: "departments",
        rowCount: 0,
        columns: [
          { name: "id", type: "integer", nullable: false, primaryKey: true },
          { name: "name", type: "varchar(100)", nullable: false, primaryKey: false },
          { name: "manager_id", type: "integer", nullable: true, primaryKey: false },
        ],
      },
    ],
  },
];

DUMMY_DATABASES.forEach((db) => {
  db.tables.forEach((table) => {
    table.rowCount = getRowCount(db.name, table.name);
  });
});

export const DUMMY_CONNECTION = {
  dbType: "postgresql",
  host: "localhost",
  port: "5432",
  username: "root",
  password: "root",
};

export function simulateQuery(sql: string): QueryResult {
  const normalized = sql.trim().toLowerCase();
  const activeDb = "ecommerce_db";

  const tableDataMap: Record<string, string[]> = {
    users: ["id", "username", "email", "created_at", "is_active"],
    products: ["id", "name", "price", "stock", "category_id"],
    orders: ["id", "user_id", "total", "status", "created_at"],
    categories: ["id", "name", "parent_id"],
  };

  const extractTableName = (query: string): string | null => {
    const match = query.match(/from\s+(\w+)/i);
    return match ? match[1] : null;
  };

  if (normalized.startsWith("select")) {
    const tableName = extractTableName(normalized);
    if (!tableName) {
      return {
        columns: [],
        rows: [],
        error: "Invalid SELECT query. Table name not found.",
      };
    }

    const tableKey = tableName.toLowerCase();
    const dbTableData = DUMMY_TABLE_DATA[activeDb]?.[tableKey];
    if (!dbTableData) {
      return {
        columns: [],
        rows: [],
        error: `Table "${tableName}" not found.`,
      };
    }

    const columns = tableDataMap[tableKey] ?? [];
    const rows = dbTableData.map((row) => {
      const obj: Record<string, string | number | boolean | null> = {};
      columns.forEach((col, i) => {
        obj[col] = row[i] as string | number | boolean | null;
      });
      return obj;
    });

    return {
      columns,
      rows,
      rowsAffected: rows.length,
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
