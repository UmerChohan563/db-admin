import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Filter,
  ChevronDown,
  ArrowLeft,
  ChevronRight,
  Check,
  X,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useExplorerStore } from "../../stores/tablesStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type ColumnType = "integer" | "text" | "date" | "boolean" | "unknown";

export interface FilterState {
  column: string;
  condition: string;
  value: string | number | [number, number] | [string, string] | null;
  selectedValues?: string[];
}

interface ColumnDef {
  name: string;
  type: string;
}

interface FilterDropdownProps {
  columns: ColumnDef[];
  tableData: Record<string, string | number | boolean | null>[];
  activeFilters: FilterState[];
  onApply: (filter: FilterState) => void;
  onClear: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveType(rawType: string): ColumnType {
  const t = rawType.toLowerCase();
  if (t.includes("int") || t.includes("numeric") || t.includes("float") || t.includes("decimal") || t.includes("double") || t.includes("real") || t.includes("bigint"))
    return "integer";
  if (t.includes("timestamp") || t.includes("date") || t.includes("time"))
    return "date";
  if (t.includes("bool"))
    return "boolean";
  if (t.includes("char") || t.includes("text") || t.includes("varchar") || t.includes("string") || t.includes("uuid") || t.includes("inet") || t.includes("json"))
    return "text";
  return "unknown";
}

// Should we show range slider for this integer column?
// Only if max expected value <= 100 (e.g. age, percentage)
function isRangeColumn(colName: string): boolean {
  const rangeHints = ["age", "percent", "percentage", "score", "rating", "grade", "level", "count"];
  return rangeHints.some((h) => colName.toLowerCase().includes(h));
}

const INTEGER_CONDITIONS = [
  "Greater than", "Less than", "Between",
  "Greater than or equal to", "Less than or equal to",
];

const TEXT_CONDITIONS = [
  "Is", "Is not", "Contains", "Does not contain",
  "Starts with", "Ends with", "Is empty", "Not empty",
];

const DATE_OPTIONS = [
  { label: "Today", group: "days" },
  { label: "Yesterday", group: "days" },
  { label: "Previous week", group: "days" },
  { label: "Previous 7 days", group: "days" },
  { label: "Previous month", group: "months" },
  { label: "Previous 3 months", group: "months" },
  { label: "Previous 12 months", group: "months" },
  { label: "Fixed date range", group: "fixed" },
];

const DATE_HEADER_CONDITIONS = ["Between", "Before", "On", "After"];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Mini Calendar ─────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  selected: Date | null;
  onSelect: (d: Date) => void;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  isStart?: boolean;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selected, onSelect, rangeStart, rangeEnd }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(selected ?? today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const inRange = (d: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const dt = new Date(year, month, d);
    return dt > rangeStart && dt < rangeEnd;
  };

  const isSelected = (d: number) => {
    if (!selected) return false;
    const dt = new Date(year, month, d);
    return dt.toDateString() === selected.toDateString();
  };

  const isToday = (d: number) => {
    const dt = new Date(year, month, d);
    return dt.toDateString() === today.toDateString();
  };

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-white/10 text-text-dim hover:text-text transition-colors"
        >
          <ChevronLeft size={12} />
        </button>
        <span className="text-xs font-mono text-text font-medium">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-white/10 text-text-dim hover:text-text transition-colors"
        >
          <ChevronRight size={12} />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] text-muted font-mono py-0.5">{d}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) =>
          d === null ? (
            <div key={`e-${i}`} />
          ) : (
            <button
              key={d}
              onClick={() => onSelect(new Date(year, month, d))}
              className={cn(
                "text-center text-[11px] font-mono py-1 rounded transition-colors",
                isSelected(d)
                  ? "bg-accent text-bg font-semibold"
                  : inRange(d)
                  ? "bg-accent/20 text-accent"
                  : isToday(d)
                  ? "text-accent border border-accent/40"
                  : "text-text-dim hover:bg-white/10 hover:text-text"
              )}
            >
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

type Step = "column-list" | "column-detail";

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  columns,
  tableData,
  activeFilters,
  onApply,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("column-list");
  const [colSearch, setColSearch] = useState("");
  const [selectedCol, setSelectedCol] = useState<ColumnDef | null>(null);
  const colType = selectedCol ? resolveType(selectedCol.type) : "unknown";

  // Integer filter state
  const [intCondition, setIntCondition] = useState(INTEGER_CONDITIONS[0]);
  const [intValue, setIntValue] = useState<number>(0);
  const [intRange, setIntRange] = useState<[number, number]>([0, 100]);
  const [intMax, setIntMax] = useState<number>(100);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);
  const { activeTable } = useExplorerStore()

  // Text filter state
  const [textCondition, setTextCondition] = useState(TEXT_CONDITIONS[0]);
  const [textSearch, setTextSearch] = useState("");
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  // Date filter state
  const [dateOption, setDateOption] = useState<string | null>(null);
  const [dateCondition, setDateCondition] = useState("Between");
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);
  const [calendarStep, setCalendarStep] = useState<"options" | "calendar">("options");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openColumn = (col: ColumnDef) => {
    setSelectedCol(col);
    setStep("column-detail");
    setIntCondition(INTEGER_CONDITIONS[0]);
    setIntValue(0);
    setIntRange([0, 100]);
    setIntMax(100);
    setActiveHandle(null);
    setTextCondition(TEXT_CONDITIONS[0]);
    setTextSearch("");
    setSelectedValues(new Set());
    setDateOption(null);
    setDateCondition("Between");
    setDateStart(null);
    setDateEnd(null);
    setCalendarStep("options");
  };

  const goBack = () => {
    setStep("column-list");
    setCalendarStep("options");
  };

  // Unique text values from column
  const columnValues = useCallback((): string[] => {
    if (!selectedCol) return [];
    const vals = new Set<string>();
    tableData.forEach((row) => {
      const v = row[selectedCol.name];
      if (v !== null && v !== undefined) vals.add(String(v));
    });
    return Array.from(vals).sort();
  }, [selectedCol, tableData]);

  const filteredColValues = columnValues().filter((v) =>
    v.toLowerCase().includes(textSearch.toLowerCase())
  );

  const toggleValue = (v: string) => {
    const next = new Set(selectedValues);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setSelectedValues(next);
  };

  const toggleAll = () => {
    if (selectedValues.size === filteredColValues.length) {
      setSelectedValues(new Set());
    } else {
      setSelectedValues(new Set(filteredColValues));
    }
  };

  const handleApply = () => {
    if (!selectedCol) return;

    let value: FilterState["value"] = null;
    let condition = "";

    if (colType === "integer") {
      condition = intCondition;
      const isRange = intCondition === "Between";
      const showSlider = isRangeColumn(selectedCol.name);
      value = isRange ? (showSlider ? intRange : intRange) : intValue;
    } else if (colType === "text" || colType === "unknown") {
      condition = textCondition;
      value = selectedValues.size > 0 ? Array.from(selectedValues).join(",") : null;
    } else if (colType === "date") {
      condition = dateOption ?? "";
      if (dateOption === "Fixed date range") {
        if (dateCondition === "Between") {
          value = [
            dateStart?.toISOString().split("T")[0] ?? "",
            dateEnd?.toISOString().split("T")[0] ?? "",
          ];
        } else {
          value = dateStart?.toISOString().split("T")[0] ?? "";
        }
      }
    }

    onApply({ column: selectedCol.name, condition, value, selectedValues: Array.from(selectedValues) });
    setOpen(false);
    setStep("column-list");
  };

  const filteredCols = columns.filter((c) =>
    c.name.toLowerCase().includes(colSearch.toLowerCase())
  );

  const isTwoValue = (cond: string) => cond === "Between";
  const showSlider = selectedCol && colType === "integer";
  const isTwoCondition = isTwoValue(intCondition);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!selectedCol || !showSlider || !isTwoCondition) return;
      
      const sliderEl = document.querySelector('[data-slider-target]') as HTMLInputElement | null;
      if (!sliderEl) return;
      
      const rect = sliderEl.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round(percent * intMax);
      
      if (activeHandle === "start" && value < intRange[1] - 1) {
        setIntRange([value, intRange[1]]);
      } else if (activeHandle === "end" && value > intRange[0] + 1) {
        setIntRange([intRange[0], value]);
        if (value > 100) setIntMax(value);
        else setIntMax(100);
      }
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    if (activeHandle) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeHandle, intMax, intRange, selectedCol, showSlider, isTwoCondition, intCondition]);

  const isFilterValid = () => {
    if (colType === "integer") {
      if (isTwoValue(intCondition)) {
        return intRange[0] < intRange[1] && intRange[0] >= 0 && intRange[1] > 0;
      }
      return intValue >= 0;
    } else if (colType === "text" || colType === "unknown") {
      if (["Is empty", "Not empty"].includes(textCondition)) return true;
      return selectedValues.size > 0;
    } else if (colType === "date") {
      if (dateOption === "Fixed date range") {
        if (dateCondition === "Between") {
          return dateStart && dateEnd;
        }
        return !!dateStart;
      }
      return !!dateOption;
    }
    return true;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); setStep("column-list"); setColSearch(""); }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors",
          activeFilters.length > 0
            ? "border-accent/60 text-accent bg-accent/10"
            : "border-border text-text-dim hover:border-accent/40 hover:text-text bg-surface"
        )}
      >
        <Filter size={12} />
        Filter
        {activeFilters.length > 0 && (
          <span className="bg-accent text-bg rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {activeFilters.length}
          </span>
        )}
        <ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={`absolute top-full left-0 mt-1.5 z-50 w-[400px] bg-surface border border-border rounded-xl shadow-2xl overflow-hidden`}>

          {/* ── STEP 1: Column list ── */}
          {step === "column-list" && (
            <>
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-text font-semibold">
                  <Filter size={12} className="text-accent" />
                  Filter {activeTable} by column
                </div>
                {activeFilters.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-[10px] font-mono text-danger hover:text-danger/80 flex items-center gap-1"
                  >
                    <X size={10} /> Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-border">
                <input
                  autoFocus
                  placeholder="Search columns..."
                  value={colSearch}
                  onChange={(e) => setColSearch(e.target.value)}
                  className="w-full bg-bg border border-border rounded px-3 py-1.5 text-xs font-mono text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
              </div>

              {/* Column options */}
              <div className="max-h-52 overflow-y-auto">
                {filteredCols.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted font-mono">No columns found</div>
                ) : (
                  filteredCols.map((col) => {
                    const t = resolveType(col.type);
                    const isFiltered = activeFilters.some((f) => f.column === col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => openColumn(col)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text">{col.name}</span>
                          {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </div>
                        <span className="text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5">
                          {t === "integer" ? "INT" : t === "date" ? "DATE" : t === "text" ? "TEXT" : col.type.toUpperCase().slice(0, 6)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ── STEP 2: Column detail ── */}
          {step === "column-detail" && selectedCol && (
            <>
              {/* Header row */}
              <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
                <button
                  onClick={goBack}
                  className="text-text-dim hover:text-text transition-colors p-0.5 rounded hover:bg-white/10"
                >
                  <ArrowLeft size={13} />
                </button>
                <span className="text-xs font-mono text-text font-semibold flex-1 truncate">
                  {selectedCol.name}
                </span>

                {/* Condition dropdown — hidden for date type */}
                {colType !== "date" && (
                  <div className="relative group">
                    <select
                      value={colType === "integer" ? intCondition : textCondition}
                      onChange={(e) => {
                        if (colType === "integer") setIntCondition(e.target.value);
                        else setTextCondition(e.target.value);
                      }}
                      className="text-[11px] font-mono text-text-dim bg-bg border border-border rounded px-2 py-1 focus:outline-none focus:border-accent cursor-pointer appearance-none pr-5"
                    >
                      {(colType === "integer" ? INTEGER_CONDITIONS : TEXT_CONDITIONS).map((c) => (
                        <option key={c} value={c} className="bg-surface">{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                )}
              </div>

              {/* ── INTEGER type ── */}
              {colType === "integer" && (
                <div className="px-4 py-3 border-b border-border">
                  {showSlider && isTwoValue(intCondition) ? (
                    <>
                      <div className="flex justify-between text-[10px] font-mono text-text-dim mb-1">
                        <span>{intRange[0]}</span>
                        <span>{intRange[1]}</span>
                      </div>
                      <div className="relative h-5 flex items-center">
                        <div className="absolute left-0 right-0 h-1 bg-border rounded" />
                        <div
                          className="absolute h-1 bg-accent rounded"
                          style={{
                            left: `${(intRange[0] / intMax) * 100}%`,
                            right: `${100 - (intRange[1] / intMax) * 100}%`,
                          }}
                        />
                        <input
                          type="range" min={0} max={intMax}
                          value={intRange[0]}
                          data-slider-target="true"
                          onPointerDown={() => setActiveHandle("start")}
                          onPointerUp={() => setActiveHandle(null)}
                          className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg"
                        />
                        <input
                          type="range" min={0} max={intMax}
                          value={intRange[1]}
                          data-slider-target="true"
                          onPointerDown={() => setActiveHandle("end")}
                          onPointerUp={() => setActiveHandle(null)}
                          className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number" min={0} max={intRange[1] - 1}
                          value={intRange[0]}
                          onChange={(e) => {
                            const v = Math.min(parseInt(e.target.value) || 0, intRange[1] - 1);
                            setIntRange([v, intRange[1]]);
                            if (v > intMax) setIntMax(v);
                          }}
                          className="w-full bg-bg border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-accent"
                        />
                        <span className="text-muted text-xs self-center">–</span>
                        <input
                          type="number" min={intRange[0] + 1}
                          value={intRange[1]}
                          onChange={(e) => {
                            const raw = parseInt(e.target.value) || 0;
                            const v = Math.max(raw, intRange[0] + 1);
                            setIntRange([intRange[0], v]);
                            if (raw > 100) {
                              setIntMax(raw);
                            } else {
                              const highest = Math.max(intRange[0], 100);
                              setIntMax(highest);
                            }
                          }}
                          className="w-full bg-bg border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-accent"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-[10px] font-mono text-text-dim mb-1">
                        <span>{intValue}</span>
                      </div>
                      <div className="relative h-5 flex items-center">
                        <div className="absolute left-0 right-0 h-1 bg-border rounded" />
                        <div
                          className="absolute h-1 bg-accent rounded"
                          style={{
                            left: `${(intValue / intMax) * 100}%`,
                            right: `${100 - (intValue / intMax) * 100}%`,
                          }}
                        />
                        <input
                          type="range" min={0} max={intMax}
                          value={intValue}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            setIntValue(v);
                            if (v > 100) setIntMax(v);
                            else setIntMax(100);
                          }}
                          className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg"
                        />
                      </div>
                      <input
                        type="number"
                        value={intValue}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setIntValue(v);
                          if (v > 100) setIntMax(v);
                          else setIntMax(100);
                        }}
                        className="w-full bg-bg border border-border rounded px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent mt-2"
                        placeholder="Enter value..."
                      />
                    </>
                  )}
                </div>
              )}

              {/* ── TEXT type ── */}
              {(colType === "text" || colType === "unknown") && (
                <>
                  {/* Value search */}
                  {!["Is empty", "Not empty"].includes(textCondition) && (
                    <div className="px-3 py-2 border-b border-border">
                      <input
                        autoFocus
                        placeholder={`Search ${selectedCol.name} values...`}
                        value={textSearch}
                        onChange={(e) => setTextSearch(e.target.value)}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text placeholder:text-muted focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}

                  {/* Select-all + values list */}
                  {!["Is empty", "Not empty"].includes(textCondition) && (
                    <div className="max-h-44 overflow-y-auto">
                      {/* Select all */}
                      <button
                        onClick={toggleAll}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 border-b border-border/50"
                      >
                        <div className={cn(
                          "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          selectedValues.size === filteredColValues.length && filteredColValues.length > 0
                            ? "bg-accent border-accent"
                            : "border-border"
                        )}>
                          {selectedValues.size === filteredColValues.length && filteredColValues.length > 0 && (
                            <Check size={9} className="text-bg" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-text-dim">Select all</span>
                      </button>

                      {filteredColValues.length === 0 ? (
                        <div className="py-4 text-center text-xs font-mono text-muted">No values found</div>
                      ) : (
                        filteredColValues.map((v) => (
                          <button
                            key={v}
                            onClick={() => toggleValue(v)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/5 transition-colors"
                          >
                            <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                              selectedValues.has(v) ? "bg-accent border-accent" : "border-border"
                            )}>
                              {selectedValues.has(v) && <Check size={9} className="text-bg" />}
                            </div>
                            <span className="text-[11px] font-mono text-text truncate">{v}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {["Is empty", "Not empty"].includes(textCondition) && (
                    <div className="px-4 py-3">
                      <p className="text-[11px] font-mono text-muted italic">No value needed for this condition.</p>
                    </div>
                  )}
                </>
              )}

              {/* ── DATE type ── */}
              {colType === "date" && (
                <>
                  {calendarStep === "options" && (
                    <div className="py-1">
                      {/* Days group */}
                      {DATE_OPTIONS.filter((o) => o.group === "days").map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setDateOption(opt.label);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-xs font-mono text-text">{opt.label}</span>
                          {dateOption === opt.label && <Check size={11} className="text-accent" />}
                        </button>
                      ))}
                      <div className="border-t border-border my-1" />
                      {DATE_OPTIONS.filter((o) => o.group === "months").map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setDateOption(opt.label)}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-xs font-mono text-text">{opt.label}</span>
                          {dateOption === opt.label && <Check size={11} className="text-accent" />}
                        </button>
                      ))}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { setDateOption("Fixed date range"); setCalendarStep("calendar"); }}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-accent" />
                          <span className="text-xs font-mono text-text">Fixed date range</span>
                        </div>
                        <ChevronRight size={11} className="text-muted" />
                      </button>
                    </div>
                  )}

                  {calendarStep === "calendar" && (
                    <>
                      {/* Calendar sub-header */}
                      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                        <button
                          onClick={() => setCalendarStep("options")}
                          className="text-text-dim hover:text-text transition-colors p-0.5 rounded hover:bg-white/10"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <div className="flex gap-1 flex-1">
                          {DATE_HEADER_CONDITIONS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setDateCondition(c)}
                              className={cn(
                                "flex-1 text-[10px] font-mono rounded py-1 transition-colors",
                                dateCondition === c
                                  ? "bg-accent text-bg font-semibold"
                                  : "text-text-dim hover:bg-white/10"
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calendar(s) */}
                      <div className="px-4 py-3">
                        {dateCondition === "Between" ? (
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <p className="text-[10px] font-mono text-muted mb-1">Start</p>
                              <MiniCalendar
                                selected={dateStart}
                                onSelect={setDateStart}
                                rangeStart={dateStart}
                                rangeEnd={dateEnd}
                              />
                            </div>
                            <div className="w-px bg-border" />
                            <div className="flex-1">
                              <p className="text-[10px] font-mono text-muted mb-1">End</p>
                              <MiniCalendar
                                selected={dateEnd}
                                onSelect={setDateEnd}
                                rangeStart={dateStart}
                                rangeEnd={dateEnd}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] font-mono text-muted mb-1">Date</p>
                            <MiniCalendar
                              selected={dateStart}
                              onSelect={setDateStart}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Footer – Apply button */}
              <div className="px-3 py-2.5 border-t border-border bg-bg/50">
                <button
                  onClick={handleApply}
                  disabled={!isFilterValid()}
                  className={cn(
                    "w-full text-xs font-mono font-semibold py-2 rounded-lg transition-colors active:scale-[0.98]",
                    isFilterValid()
                      ? "bg-accent text-bg hover:bg-accent-dim"
                      : "bg-border text-muted cursor-not-allowed"
                  )}
                >
                  Apply filter
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
