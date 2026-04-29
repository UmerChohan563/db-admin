import React from "react";
import { Play, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useExplorerStore } from "../../stores/explorerStore";
import { Button } from "./Button";
import { Badge } from "./Badge";

const EXAMPLE_QUERIES = [
  "SELECT * FROM users LIMIT 100;",
  "SELECT COUNT(*) FROM orders WHERE status = 'pending';",
  "SELECT u.username, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id\nORDER BY order_count DESC;",
  "UPDATE products SET stock = stock - 1 WHERE id = 1;",
];

export const QueryEditor: React.FC = () => {
  const { querySQL, queryResult, isQueryRunning, setQuerySQL, runQuery } = useExplorerStore();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-surface/50">
        <span className="text-text text-xs font-mono font-semibold">Query Editor</span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={runQuery}
            loading={isQueryRunning}
            disabled={!querySQL.trim()}
          >
            <Play size={13} />
            Run Query
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="p-4 border-b border-border bg-bg/40">
        <textarea
          className="w-full bg-surface border border-border rounded-lg p-4 text-sm font-mono text-text resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors placeholder:text-muted"
          rows={8}
          value={querySQL}
          onChange={(e) => setQuerySQL(e.target.value)}
          placeholder="Write your SQL query here..."
          spellCheck={false}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              runQuery();
            }
          }}
        />
        <p className="text-xs text-muted font-mono mt-2">
          Press <kbd className="bg-surface border border-border rounded px-1">Ctrl+Enter</kbd> to run
        </p>
      </div>

      {/* Quick examples */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 overflow-x-auto bg-surface/20">
        <span className="text-xs text-muted font-mono shrink-0">Examples:</span>
        {EXAMPLE_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuerySQL(q)}
            className="text-xs font-mono text-text-dim hover:text-accent border border-border hover:border-accent/40 rounded px-2 py-1 shrink-0 transition-colors"
          >
            {q.split("\n")[0].slice(0, 30)}…
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {isQueryRunning && (
          <div className="flex items-center justify-center h-40 gap-3 text-text-dim">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-mono">Executing query...</span>
          </div>
        )}

        {!isQueryRunning && queryResult && (
          <div className="p-4">
            {/* Result meta */}
            <div className="flex items-center gap-3 mb-3">
              {queryResult.error ? (
                <>
                  <AlertCircle size={14} className="text-danger" />
                  <Badge variant="danger">Error</Badge>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} className="text-accent" />
                  <Badge variant="accent">
                    {queryResult.rowsAffected ?? queryResult.rows.length} rows affected
                  </Badge>
                  {queryResult.executionTime && (
                    <div className="flex items-center gap-1 text-xs text-text-dim font-mono">
                      <Clock size={11} />
                      {queryResult.executionTime}ms
                    </div>
                  )}
                </>
              )}
            </div>

            {queryResult.error && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                <p className="text-sm font-mono text-danger">{queryResult.error}</p>
              </div>
            )}

            {!queryResult.error && queryResult.columns.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      {queryResult.columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2.5 text-left text-text-dim font-medium border-r border-border last:border-r-0"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                        {queryResult.columns.map((col) => (
                          <td
                            key={col}
                            className="px-3 py-2 text-text border-r border-border/50 last:border-r-0"
                          >
                            {String(row[col] ?? "NULL")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!queryResult.error && queryResult.columns.length === 0 && (
              <div className="flex items-center gap-2 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <CheckCircle2 size={14} className="text-accent" />
                <span className="text-sm font-mono text-text">
                  Query executed successfully. {queryResult.rowsAffected} row(s) affected.
                </span>
              </div>
            )}
          </div>
        )}

        {!isQueryRunning && !queryResult && (
          <div className="flex items-center justify-center h-40 text-text-dim">
            <p className="text-sm font-mono">Run a query to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};
