import React, { useState } from 'react';
import { PosterType } from '../types';
import {
  Plus,
  Minus,
  Trash2,
  Table as TableIcon,
  RotateCcw,
  Maximize2,
  Minimize2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';

interface DynamicTableEditorProps {
  type: PosterType;
  tableData: string[][];
  onChange: (newData: string[][]) => void;
  numRows: number;
  numCols: number;
  onRowsColsChange: (rows: number, cols: number) => void;
}

const WEEKDAYS = [
  'Select Day',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const configTypePlaceholder = (type: PosterType, rIdx: number, cIdx: number): string => {
  if (type === 'timetable') {
    if (rIdx === 0) {
      return cIdx === 0 ? 'DAYS' : 'Subject / Time Slot Header';
    }
    if (cIdx === 0) {
      return 'Select Day';
    }
    return 'Time / Subject (e.g. 8:00 AM - Physics)';
  }

  if (rIdx === 0) {
    return cIdx === 0 ? 'Header 1 (Subject)' : `Header ${cIdx + 1} (Topics / Syllabus)`;
  }
  if (cIdx === 0) {
    return 'Subject / Section Name';
  }
  return 'Enter topics, chapters or syllabus details...';
};

export const DynamicTableEditor: React.FC<DynamicTableEditorProps> = ({
  type,
  tableData,
  onChange,
  numRows,
  numCols,
  onRowsColsChange
}) => {
  const [isExpandedModal, setIsExpandedModal] = useState(false);

  const cleanCellText = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/^\s*\n+/, '') // remove leading blank lines
      .replace(/\n+\s*$/, '') // remove trailing blank lines
      .replace(/\n{2,}/g, '\n') // collapse multiple blank lines to a single newline
      .trim();
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const cleaned = val
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/^\s*\n+/, '')
      .replace(/\n{3,}/g, '\n\n');
    const updated = tableData.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? cleaned : cell)) : [...row]
    );
    onChange(updated);
  };

  const addRow = () => {
    const newRow = Array(numCols).fill('');
    if (type === 'timetable' && numRows > 0) {
      const lastDay = tableData[numRows - 1]?.[0];
      const dayIdx = WEEKDAYS.indexOf(lastDay);
      if (dayIdx > 0 && dayIdx < WEEKDAYS.length - 1) {
        newRow[0] = WEEKDAYS[dayIdx + 1];
      }
    }
    const newData = [...tableData, newRow];
    onChange(newData);
    onRowsColsChange(numRows + 1, numCols);
  };

  const removeRow = (rIdx: number) => {
    if (numRows <= 1) return;
    const newData = tableData.filter((_, idx) => idx !== rIdx);
    onChange(newData);
    onRowsColsChange(numRows - 1, numCols);
  };

  const moveRow = (rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    if (targetIdx < 0 || targetIdx >= numRows) return;
    const newData = [...tableData];
    const temp = newData[rIdx];
    newData[rIdx] = newData[targetIdx];
    newData[targetIdx] = temp;
    onChange(newData);
  };

  const addColumn = () => {
    if (numCols >= 8) return;
    const newData = tableData.map((row, idx) => {
      if (type === 'timetable' && idx === 0) {
        return [...row, `Slot ${numCols}`];
      }
      return [...row, ''];
    });
    onChange(newData);
    onRowsColsChange(numRows, numCols + 1);
  };

  const removeColumn = () => {
    if (numCols <= 1) return;
    const newData = tableData.map((row) => row.slice(0, numCols - 1));
    onChange(newData);
    onRowsColsChange(numRows, numCols - 1);
  };

  const clearAllCells = () => {
    if (window.confirm('Clear all text from table cells?')) {
      const newData = tableData.map((row, r) =>
        row.map((cell, c) => {
          if (type === 'timetable' && r === 0 && c === 0) return 'Days';
          return '';
        })
      );
      onChange(newData);
    }
  };

  const renderGridContent = (isModal = false) => {
    if (type === 'announcement') {
      return (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-extrabold text-sm text-emerald-950">PW Announcement Banner Format</h3>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            This mode generates a high-impact <strong>1000 × 375 pixel Announcement Banner</strong> (matching official Physics Wallah notices). You can edit all text directly on the canvas preview or in the <strong>Text Details</strong> tab!
          </p>
        </div>
      );
    }

    return (
      <div className={`overflow-x-auto overflow-y-auto flex-1 border border-slate-200 rounded-xl bg-slate-50 p-1 shadow-2xs ${isModal ? 'max-h-[75vh]' : ''}`}>
      <table className="w-full text-xs text-left text-slate-800 border-collapse table-fixed min-w-[360px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="p-2 w-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              #
            </th>
            {Array.from({ length: numCols }).map((_, cIdx) => {
              const isFirstCol = cIdx === 0;
              const colWidthClass =
                numCols === 2
                  ? (isFirstCol ? '32%' : '68%')
                  : `${100 / numCols}%`;

              return (
                <th
                  key={cIdx}
                  style={{ width: colWidthClass }}
                  className="p-2 text-purple-800 font-extrabold uppercase tracking-wider text-xs text-center"
                >
                  <div className="bg-purple-100/80 text-purple-900 py-1 px-2 rounded-lg border border-purple-200/60 inline-block text-[11px] font-bold">
                    {cIdx === 0 ? 'Subject / Day' : `Topics (Col ${cIdx + 1})`}
                  </div>
                </th>
              );
            })}
            <th className="p-2 w-14 text-center text-slate-400 font-bold text-[11px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.slice(0, numRows).map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-slate-200/80 hover:bg-slate-100/60 transition-colors group">
              {/* Row Index & Reorder Handle */}
              <td className="p-2 text-center align-top pt-3.5">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center">
                    {rIdx + 1}
                  </span>
                  <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => moveRow(rIdx, 'up')}
                      disabled={rIdx === 0}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20"
                      title="Move row up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(rIdx, 'down')}
                      disabled={rIdx === numRows - 1}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20"
                      title="Move row down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </td>

              {/* Table Data Cells */}
              {row.slice(0, numCols).map((cellVal, cIdx) => {
                const isTimeTableSelect =
                  type === 'timetable' && rIdx > 0 && cIdx === 0;
                const isContentCol = cIdx > 0 || type !== 'timetable';

                return (
                  <td key={cIdx} className="p-2 align-top">
                    {isTimeTableSelect ? (
                      <select
                        value={cellVal || 'Select Day'}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 font-bold shadow-2xs transition-all"
                      >
                        {WEEKDAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        rows={isContentCol ? (isModal ? 5 : 3) : 2}
                        value={cellVal ?? ''}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        onPaste={(e) => {
                          const pasteData = e.clipboardData.getData('text');
                          if (pasteData.includes('\n\n') || /^\s*\n/.test(pasteData) || /\n\s*$/.test(pasteData)) {
                            e.preventDefault();
                            const cleanPaste = cleanCellText(pasteData);
                            const target = e.currentTarget;
                            const start = target.selectionStart || 0;
                            const end = target.selectionEnd || 0;
                            const currentVal = target.value;
                            const newVal = currentVal.substring(0, start) + cleanPaste + currentVal.substring(end);
                            handleCellChange(rIdx, cIdx, newVal);
                            setTimeout(() => {
                              target.setSelectionRange(start + cleanPaste.length, start + cleanPaste.length);
                            }, 0);
                          }
                        }}
                        placeholder={
                          configTypePlaceholder(type, rIdx, cIdx)
                        }
                        className={`w-full bg-white border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-sans font-medium leading-relaxed shadow-2xs resize-y ${
                          isContentCol ? 'min-h-[80px]' : 'min-h-[48px]'
                        }`}
                      />
                    )}
                  </td>
                );
              })}

              {/* Delete Row Button */}
              <td className="p-2 text-center align-top pt-3.5">
                <button
                  type="button"
                  onClick={() => removeRow(rIdx)}
                  disabled={numRows <= 1}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 disabled:opacity-20 transition-all"
                  title="Delete row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Row Bottom Button */}
      <div className="mt-3">
        <button
          type="button"
          onClick={addRow}
          className="w-full py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
        >
          <Plus className="w-4 h-4 text-purple-600" />
          <span>Add New Row ({numRows + 1})</span>
        </button>
      </div>
    </div>
  );
};

  return (
    <div className="bg-white/50 p-2 text-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header Title & Badge */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <TableIcon className="w-3.5 h-3.5 text-purple-600" />
          Grid Content Data
        </label>
        {type !== 'announcement' && (
          <button
            type="button"
            onClick={() => setIsExpandedModal(true)}
            className="flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold rounded-lg transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-purple-600" /> Full Screen Grid
          </button>
        )}
      </div>

      {/* Structured Steppers & Action Bar Controls */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
        {/* Row Counter Stepper */}
        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-700">Rows ({numRows})</span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => removeRow(numRows - 1)}
              disabled={numRows <= 1}
              className="p-0.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-30 border border-slate-200 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-4 text-center text-[10px] font-extrabold text-slate-900">
              {numRows}
            </span>
            <button
              type="button"
              onClick={addRow}
              className="p-0.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded border border-slate-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column Counter Stepper */}
        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-700">Cols ({numCols})</span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={removeColumn}
              disabled={numCols <= 1}
              className="p-0.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-30 border border-slate-200 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-4 text-center text-[10px] font-extrabold text-slate-900">
              {numCols}
            </span>
            <button
              type="button"
              onClick={addColumn}
              disabled={numCols >= 8}
              className="p-0.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-30 border border-slate-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Quick Reset Bar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-500 font-medium">
          Type or edit details cell by cell:
        </span>
        <button
          type="button"
          onClick={clearAllCells}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-600 font-bold px-1.5 py-0.5 hover:bg-red-50 rounded transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" /> Clear Data
        </button>
      </div>

      {/* Grid Table Render */}
      {!isExpandedModal && renderGridContent(false)}

      {/* Pro Tip Box */}
      <div className="p-2 bg-purple-50/70 border border-purple-100 rounded-lg text-[10px] text-purple-900 flex items-start gap-1.5 leading-relaxed shrink-0">
        <Info className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong>Pro-tip:</strong> You can edit text <u>directly on the live poster preview</u> canvas! Click any cell to type.
        </div>
      </div>

      {/* Fullscreen Expanded Grid Modal */}
      {isExpandedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  Full Screen Grid Editor
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {numRows} × {numCols}
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {renderGridContent(true)}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-600" /> Add Row
                </button>
                <button
                  type="button"
                  onClick={addColumn}
                  disabled={numCols >= 8}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-600" /> Add Column
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpandedModal(false)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


