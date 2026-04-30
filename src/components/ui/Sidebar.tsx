import React, { useEffect } from "react";
import {
  Database,
  Table2,
  ChevronDown,
  ChevronRight,
  LogOut,
  TerminalSquare,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDbDataStore } from "../../stores/dbDataStore";
import { useExplorerStore } from "../../stores/tablesStore";

export const Sidebar: React.FC = () => {
  const { disconnect, credentials } = useAuthStore();
  const { databases, databasesLoading, databasesError, tablesLoading, fetchTables } = useDbDataStore();
  const {
    expandedDatabases,
    activeDatabase,
    activeTable,
    activeView,
    toggleDatabase,
    openTable,
    setActiveView,
  } = useExplorerStore();

  useEffect(() => {
    useDbDataStore.getState().fetchDatabases();
  }, []);

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-accent" />
          <span className="text-sm font-semibold text-text font-mono">
            DB<span className="text-accent">Admin</span>
          </span>
        </div>
        <p className="text-xs text-muted font-mono mt-1 truncate">
          {credentials.username}@{credentials.host}:{credentials.port}
        </p>
      </div>

      {/* Query editor button */}
      <div className="px-3 py-2 border-b border-border">
        <button
          onClick={() => setActiveView("query")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeView === "query"
              ? "bg-accent/10 text-accent"
              : "text-text-dim hover:text-text hover:bg-white/5"
          }`}
        >
          <TerminalSquare size={14} />
          Query Editor
        </button>
      </div>

      {/* Database list */}
      <div className="flex-1 overflow-y-auto py-2">
        {databasesLoading ? (
          <div className="px-4 py-4 flex items-center gap-2 text-xs font-mono text-text-dim">
            <Loader2 size={12} className="animate-spin text-accent" />
            Loading databases...
          </div>
        ) : databasesError ? (
          <div className="px-4 py-4 text-xs font-mono text-danger">
            {databasesError}
          </div>
        ) : (
          databases.map((db) => {
            const isExpanded = expandedDatabases.has(db.name);
            return (
              <div key={db.name}>
                {/* Database row */}
                <button
                  onDoubleClick={() => {
                    toggleDatabase(db.name);
                    if (!isExpanded) {
                      fetchTables(db.name);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-dim hover:text-text hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {tablesLoading === db.name ? (
                    <Loader2 size={12} className="shrink-0 text-accent animate-spin" />
                  ) : isExpanded ? (
                    <ChevronDown size={12} className="shrink-0 text-accent" />
                  ) : (
                    <ChevronRight size={12} className="shrink-0" />
                  )}
                  <Database size={12} className="shrink-0" />
                  <span className="truncate font-medium">{db.name}</span>
                  <span className="ml-auto text-muted text-[10px]">{db.totalSets ?? 0}</span>
                </button>

                {/* Tables */}
                {isExpanded && (
                  <div className="ml-4 border-l border-border/50">
                    {db.tables.map((table) => {
                      const isActive =
                        activeDatabase === db.name && activeTable === table.name && activeView === "table";
                      return (
                        <button
                          key={table.name}
                          onDoubleClick={() => openTable(db.name, table.name)}
                          className={`w-full flex items-center gap-2 pl-3 pr-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                            isActive
                              ? "bg-accent/10 text-accent border-r-2 border-accent"
                              : "text-text-dim hover:text-text hover:bg-white/5"
                          }`}
                        >
                          <Table2 size={11} className="shrink-0" />
                          <span className="truncate">{table.name}</span>
                          <span className="ml-auto text-muted text-[10px]">
                            {table.rowCount ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={disconnect}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-text-dim hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={13} />
          Disconnect
        </button>
      </div>
    </aside>
  );
};