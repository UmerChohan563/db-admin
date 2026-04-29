import React, { useState } from "react";
import { Plus, Trash2, Columns, RefreshCw } from "lucide-react";
import { useExplorerStore } from "../../stores/explorerStore";
import { useDbDataStore } from "../../stores/dbDataStore";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { formatRowCount } from "../../utils/format";

export const TableView: React.FC = () => {
  const {
    activeDatabase,
    activeTable,
    tableData,
    tableColumns,
    isTableLoading,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    openTable,
  } = useExplorerStore();

  const { databases } = useDbDataStore();
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  const tableInfo = databases
    .find((d) => d.name === activeDatabase)
    ?.tables.find((t) => t.name === activeTable);

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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-surface/50">
        <div className="flex items-center gap-2">
          <span className="text-text-dim text-xs font-mono">{activeDatabase}</span>
          <span className="text-muted">/</span>
          <span className="text-text text-xs font-mono font-semibold">{activeTable}</span>
        </div>
        {tableInfo && (
          <Badge variant="default">{formatRowCount(tableData.length)} rows</Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openTable(activeDatabase, activeTable)}
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
      {tableInfo && (
        <div className="px-5 py-2 border-b border-border bg-bg/30 flex gap-3 overflow-x-auto">
          {tableInfo.columns.map((col) => (
            <div key={col.name} className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono text-text-dim">{col.name}</span>
              <Badge variant={col.primaryKey ? "accent" : "default"} className="text-[10px]">
                {col.type}
              </Badge>
              {col.primaryKey && <Badge variant="warning" className="text-[10px]">PK</Badge>}
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
            {tableData.map((row, rowIndex) => (
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

        {tableData.length === 0 && (
          <div className="flex items-center justify-center h-40 text-text-dim">
            <p className="text-sm font-mono">No data in this table</p>
          </div>
        )}
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
