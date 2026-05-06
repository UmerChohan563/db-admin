import React, { useMemo, useState } from "react";
import { Plus, Trash2, Columns, RefreshCw, ChevronDown } from "lucide-react";
import { useExplorerStore } from "../../stores/tablesStore";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { FilterDropdown, type FilterState } from "./FilterDropdown";
import { useDbDataStore } from "../../stores/dbDataStore";

const TAKE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

export const TableView: React.FC = () => {
  const {
    activeDatabase,
    activeTable,
    tableData,
    tableColumns,
    tableColumnTypes,
    tablePage,
    tableTake,
    tableTotalOnPage,
    isTableLoading,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    openTable,
    setTableTake,
  } = useExplorerStore();

  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const { databases } = useDbDataStore();
  const [activeFilters, setActiveFilters] = useState<FilterState[]>([]);
  const [customTake, setCustomTake] = useState("");
  const [showTakeDropdown, setShowTakeDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!activeDatabase || !activeTable) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-dim">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-20">⊞</div>
          <p className="text-sm font-mono">Select a table from the sidebar</p>
        </div>
      </div>
    );
  }

  if (isTableLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-dim">
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="animate-spin text-accent" />
          <span className="text-sm font-mono">Loading table...</span>
        </div>
      </div>
    );
  }

  const startEdit = (rowIndex: number, col: string) => {
    setEditingCell({ row: rowIndex, col });
    setEditValue(String(tableData[rowIndex][col] ?? ""));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    updateCell(editingCell.row, editingCell.col, editValue);
    setEditingCell(null);
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    addColumn(newColName.trim());
    setNewColName("");
    setShowAddCol(false);
  };

  const handleCustomTake = () => {
    const val = parseInt(customTake, 10);
    if (!isNaN(val) && val > 0) {
      setShowTakeDropdown(false);
      setShowAddCol(false);
      setTableTake(val);
    }
  };

    const tableInfo = databases
    .find((d) => d.name === activeDatabase)
    ?.tables.find((t) => t.name === activeTable);

   const columnDefs = useMemo(() => {
    if (!tableInfo) return tableColumns.map((c) => ({ name: c, type: "unknown" }));
    return tableColumns.map((c) => {
      const found = tableInfo.columns.find((col) => col.name === c);
      return { name: c, type: found?.type ?? "unknown" };
    });
  }, [tableInfo, tableColumns]);

  const handleApplyFilter = (f: FilterState) => {
    setActiveFilters((prev) => {
      const existing = prev.findIndex((p) => p.column === f.column);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = f;
        return next;
      }
      return [...prev, f];
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-surface/50">
        <div className="flex items-center gap-2">
          <span className="text-text-dim text-xs font-mono">{activeDatabase}</span>
          <span className="text-muted">/</span>
          <span className="text-text text-xs font-mono font-semibold">{activeTable}</span>
        </div>
        <Badge variant="default">{tableTotalOnPage} rows</Badge>

        {/* Take Dropdown */}
        <div className="relative ml-3">
          <button
            onClick={() => setShowTakeDropdown(!showTakeDropdown)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-text-dim border border-border rounded hover:border-accent/40 transition-colors"
          >
            {tableTake} <ChevronDown size={12} />
          </button>
          {showTakeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-20 min-w-[100px]">
              {TAKE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setShowTakeDropdown(false);
                    setTableTake(opt.value);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-white/5 transition-colors ${
                    tableTake === opt.value ? "text-accent" : "text-text-dim"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <div className="border-t border-border px-1 py-1.5">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customTake}
                    className="py-1 px-1 w-full rounded text-[12px] text-text-dim"
                    onChange={(e) => setCustomTake(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomTake()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <FilterDropdown
            columns={columnDefs}
            tableData={tableData}
            activeFilters={activeFilters}
            onApply={handleApplyFilter}
            onClear={() => setActiveFilters([])}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openTable(activeDatabase, activeTable, tablePage, tableTake)}
          >
            <RefreshCw size={13} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAddCol(true)}>
            <Columns size={13} />
            Add Column
          </Button>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus size={13} />
            Add Row
          </Button>
        </div>
      </div>

      {/* Schema info */}
      {tableColumns.length > 0 && (
        <div className="px-5 py-2 border-b border-border bg-bg/30 flex items-center gap-3 overflow-x-auto">
          {tableColumns.map((col) => (
            <div key={col} className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono text-text-dim">{col}</span>
              <Badge variant={tableColumnTypes[col] ? "accent" : "default"} className="text-[10px]">
                {tableColumnTypes[col] ?? "UNKNOWN"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="px-5 py-2 border-b border-border bg-accent/5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-text-dim shrink-0">Filters:</span>
          {activeFilters.map((f) => (
            <div key={f.column} className="flex items-center gap-1 bg-surface border border-accent/30 rounded px-2 py-0.5 shrink-0">
              <span className="text-[11px] font-mono text-accent">{f.column}</span>
              <span className="text-[10px] font-mono text-muted">{f.condition}</span>
              <button onClick={() => setActiveFilters((p) => p.filter((x) => x.column !== f.column))} className="text-muted hover:text-danger ml-1">
                <span className="text-[10px]">×</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface border-b border-border">
              <th className="w-10 px-3 py-2.5 text-left text-muted font-normal border-r border-border">
                #
              </th>
              {tableColumns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2.5 text-left text-text-dim font-medium border-r border-border whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              <th className="w-12 px-3 py-2.5 text-center text-muted font-normal">⋯</th>
            </tr>
          </thead>
          <tbody>
            {(searchQuery.trim()
              ? tableData.filter((row) =>
                  tableColumns.some((col) => {
                    const val = row[col];
                    return val !== undefined && String(val).toLowerCase().includes(searchQuery.toLowerCase());
                  })
                )
              : tableData
            ).map((row, rowIndex) => (
              <tr
                key={String(row._id)}
                className="border-b border-border/50 hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-3 py-2 text-muted border-r border-border/50 text-center">
                  {rowIndex + 1}
                </td>
                {tableColumns.map((col) => {
                  const isEditing =
                    editingCell?.row === rowIndex && editingCell?.col === col;
                  const val = row[col];
                  return (
                    <td
                      key={col}
                      className="px-3 py-2 border-r border-border/50 max-w-[200px] cursor-text"
                      onClick={() => startEdit(rowIndex, col)}
                      onDoubleClick={() => startEdit(rowIndex, col)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="bg-accent/10 border border-accent/40 rounded px-1 py-0.5 text-xs font-mono text-text w-full outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit();
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                        />
                      ) : (
                        <span
                          className={`block truncate ${
                            val === null
                              ? "text-muted italic"
                              : val === true || val === false
                              ? val
                                ? "text-accent"
                                : "text-danger"
                              : "text-text"
                          }`}
                        >
                          {val === null ? "NULL" : String(val)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(searchQuery.trim()
          ? tableData.filter((row) =>
              tableColumns.some((col) => {
                const val = row[col];
                return val !== undefined && String(val).toLowerCase().includes(searchQuery.toLowerCase());
              })
            )
          : tableData
        ).length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-dim">
            <p className="text-sm font-mono">
              {searchQuery.trim() ? `No records found for "${searchQuery}"` : "No data in this table"}
            </p>
          </div>
        ) : null}
      </div>

      {/* Add Column Modal */}
      <Modal isOpen={showAddCol} onClose={() => setShowAddCol(false)} title="Add New Column">
        <div className="flex flex-col gap-4">
          <Input
            label="Column Name"
            placeholder="e.g. updated_at"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAddCol(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddColumn}>
              Add Column
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};