import React, { useState, useRef } from 'react';
import {
  PosterConfig,
  PosterType,
  ThemePreset
} from '../types';
import { CANVA_FONTS } from '../data/fonts';
import {
  Type,
  Sliders,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  RotateCcw,
  Maximize2,
  Minimize2,
  Edit3,
  BookmarkPlus,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

export type TabType = 'content' | 'grid' | 'typography' | 'theme';

interface PosterFormProps {
  config: PosterConfig;
  onChange: (updated: Partial<PosterConfig>) => void;
  onDimensionsChange: (rows: number, cols: number) => void;
  onSavePoster: () => void;
  onOpenAiModal: () => void;
  activeTab: TabType;
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

export const PosterForm: React.FC<PosterFormProps> = ({
  config,
  onChange,
  onDimensionsChange,
  onSavePoster,
  onOpenAiModal,
  activeTab
}) => {
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'customBgUrl' | 'customLogoUrl' | 'customMegaphoneUrl',
    extraUpdates?: Partial<PosterConfig>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange({
          [field]: dataUrl,
          ...extraUpdates
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTypeChange = (type: PosterType) => {
    if (type === config.type) return;

    if (type === 'timetable') {
      const existingHasData = config.tableData && config.tableData.length >= 2 && config.tableData[0]?.length >= 2;
      onChange({
        type: 'timetable',
        batchName: config.batchName || '',
        title: config.title || '',
        startDate: config.startDate || '',
        endDate: config.endDate || '',
        numRows: existingHasData ? config.numRows : 7,
        numCols: 2,
        theme: 'maroon-pw',
        tableData: existingHasData
          ? config.tableData
          : [
              ['Days', ''],
              ['Monday', ''],
              ['Tuesday', ''],
              ['Wednesday', ''],
              ['Thursday', ''],
              ['Friday', ''],
              ['Saturday', '']
            ]
      });
    } else if (type === 'announcement') {
      onChange({
        type: 'announcement',
        batchName: config.batchName || '',
        title: '',
        startDate: '',
        endDate: '',
        numRows: 1,
        numCols: 1,
        theme: 'emerald-pw',
        announcementBadge: config.announcementBadge || 'Keep Learning !!',
        announcementText: config.announcementText || 'LIVE CLASSES WILL RESUME TOMORROW AT 8:00 AM SHARP ON PW APP.',
        tableData: [['']]
      });
    } else {
      // Syllabus - Preserve user's typed data or provide clean blank rows
      const existingHasData = config.tableData && config.tableData.length >= 2 && config.tableData[0]?.length >= 2;
      onChange({
        type: 'syllabus',
        syllabusType: 'Long',
        batchName: config.batchName || '',
        title: config.title || '',
        startDate: config.startDate || '',
        endDate: config.endDate || '',
        numRows: existingHasData ? config.numRows : 4,
        numCols: 2,
        theme: 'purple-pw',
        tableData: existingHasData
          ? config.tableData
          : [
              ['', ''],
              ['', ''],
              ['', ''],
              ['', '']
            ]
      });
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Clear all text details and start with empty fields?')) {
      if (config.type === 'timetable') {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          endDate: '',
          numRows: 7,
          numCols: 2,
          tableData: [
            ['Days', ''],
            ['Monday', ''],
            ['Tuesday', ''],
            ['Wednesday', ''],
            ['Thursday', ''],
            ['Friday', ''],
            ['Saturday', '']
          ]
        });
      } else if (config.type === 'announcement') {
        onChange({
          batchName: '',
          announcementText: '',
          announcementBadge: 'KEEP LEARNING !!'
        });
      } else {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          numRows: 3,
          numCols: 2,
          tableData: [
            ['', ''],
            ['', ''],
            ['', '']
          ]
        });
      }
    }
  };

  // Table Cell Handlers
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const cleaned = val
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/^\s*\n+/, '')
      .replace(/\n{3,}/g, '\n\n');
    const updated = config.tableData.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? cleaned : cell)) : [...row]
    );
    onChange({ tableData: updated });
  };

  const addRow = () => {
    const newRow = Array(config.numCols).fill('');
    if (config.type === 'timetable' && config.numRows > 0) {
      const lastDay = config.tableData[config.numRows - 1]?.[0];
      const dayIdx = WEEKDAYS.indexOf(lastDay);
      if (dayIdx > 0 && dayIdx < WEEKDAYS.length - 1) {
        newRow[0] = WEEKDAYS[dayIdx + 1];
      }
    }
    const newData = [...config.tableData, newRow];
    onChange({ tableData: newData, numRows: config.numRows + 1 });
  };

  const removeRow = (rIdx: number) => {
    if (config.numRows <= 1) return;
    const newData = config.tableData.filter((_, idx) => idx !== rIdx);
    onChange({ tableData: newData, numRows: config.numRows - 1 });
  };

  const moveRow = (rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    if (targetIdx < 0 || targetIdx >= config.numRows) return;
    const newData = [...config.tableData];
    const temp = newData[rIdx];
    newData[rIdx] = newData[targetIdx];
    newData[targetIdx] = temp;
    onChange({ tableData: newData });
  };

  const addColumn = () => {
    if (config.numCols >= 8) return;
    const newData = config.tableData.map((row, idx) => {
      if (config.type === 'timetable' && idx === 0) {
        return [...row, `Slot ${config.numCols}`];
      }
      return [...row, ''];
    });
    onChange({ tableData: newData, numCols: config.numCols + 1 });
  };

  const removeColumn = () => {
    if (config.numCols <= 1) return;
    const newData = config.tableData.map((row) => row.slice(0, config.numCols - 1));
    onChange({ tableData: newData, numCols: config.numCols - 1 });
  };

  // Helper font size adjustments
  const adjustFontSize = (field: keyof PosterConfig, delta: number, defaultVal: number, minVal: number, maxVal: number) => {
    const current = (config[field] as number) !== undefined ? (config[field] as number) : defaultVal;
    const nextVal = Math.min(Math.max(current + delta, minVal), maxVal);
    onChange({ [field]: nextVal });
  };

  const currentBatchSize = config.batchNameFontSize !== undefined ? config.batchNameFontSize : 34;
  const currentTitleSize = config.titleFontSize !== undefined ? config.titleFontSize : 22;
  const currentDateSize = config.dateFontSize !== undefined ? config.dateFontSize : 14.5;
  const currentTableHeadSize = config.tableHeaderFontSize !== undefined ? config.tableHeaderFontSize : 18;
  const currentTableCellSize = config.tableCellFontSize !== undefined ? config.tableCellFontSize : 16;
  const currentGlobalScale = config.globalFontScale !== undefined ? config.globalFontScale : 1.0;

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none overflow-hidden">
      {/* Top Header & Save / Reset Actions */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Studio Editor</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSavePoster}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 transition-colors"
            title="Save this poster"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content Body (Smooth scrollable container) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ================= TAB 1: CONTENT & DETAILS ================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Format Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Poster Format
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTypeChange('syllabus')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'syllabus'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('timetable')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'timetable'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Timetable
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('announcement')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'announcement'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Notice
                </button>
              </div>
            </div>

            {/* Batch Name Header Input + Quick Font Size Adjuster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {config.type === 'announcement' ? 'Notice Header / Tag' : 'Batch Name (Main Heading)'}
                </label>
                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600">Font:</span>
                  <button
                    type="button"
                    onClick={() => adjustFontSize('batchNameFontSize', -2, 34, 18, 54)}
                    className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                    title="Decrease Header Font Size"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                    {currentBatchSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustFontSize('batchNameFontSize', 2, 34, 18, 54)}
                    className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                    title="Increase Header Font Size"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={config.batchName}
                onChange={(e) => onChange({ batchName: e.target.value })}
                placeholder="e.g. PRAHAAR 2027 / TEST SYLLABUS"
                className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
              />
            </div>

            {/* Subtitle / Schedule Title Input + Quick Font Size Adjuster */}
            {config.type !== 'announcement' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Schedule Subtitle (Optional)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600">Font:</span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('titleFontSize', -2, 22, 14, 38)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Decrease Subtitle Font Size"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                      {currentTitleSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('titleFontSize', 2, 22, 14, 38)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Increase Subtitle Font Size"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder="e.g. WEEKLY TEST 04 / CLASS TIME TABLE"
                  className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                />
              </div>
            )}

            {/* Date Badge Pill + Quick Font Size */}
            {config.type !== 'announcement' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Date Pill Text (Yellow Badge)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600">Font:</span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('dateFontSize', -1, 14.5, 11, 26)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Decrease Date Font Size"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                      {Math.round(currentDateSize)}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('dateFontSize', 1, 14.5, 11, 26)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Increase Date Font Size"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={config.startDate}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  placeholder="e.g. 02/08/2026 or 27 JULY TO 02 AUG"
                  className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                />
              </div>
            )}

            {/* PDF Spacing & Layout Quick Controls */}
            {config.type === 'syllabus' && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Spacing & Distance Controls</span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        pdfBannerY: 110,
                        pdfContentY: 245,
                        pdfSubjectWidth: 250,
                        pdfRowGap: 34,
                        pdfSubjectColor: '#c00000',
                        pdfTopicColor: '#0f172a'
                      });
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors"
                  >
                    ★ Recommended Spacing
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Banner Pos</span>
                      <span className="font-mono text-purple-700 font-bold">{config.pdfBannerY !== undefined ? config.pdfBannerY : 110}px</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={160}
                      value={config.pdfBannerY !== undefined ? config.pdfBannerY : 110}
                      onChange={(e) => onChange({ pdfBannerY: parseInt(e.target.value, 10) })}
                      className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Content Pos</span>
                      <span className="font-mono text-purple-700 font-bold">{config.pdfContentY !== undefined ? config.pdfContentY : 245}px</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={320}
                      value={config.pdfContentY !== undefined ? config.pdfContentY : 245}
                      onChange={(e) => onChange({ pdfContentY: parseInt(e.target.value, 10) })}
                      className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Subject Width</span>
                      <span className="font-mono text-purple-700 font-bold">{config.pdfSubjectWidth !== undefined ? config.pdfSubjectWidth : 250}px</span>
                    </div>
                    <input
                      type="range"
                      min={180}
                      max={340}
                      value={config.pdfSubjectWidth !== undefined ? config.pdfSubjectWidth : 250}
                      onChange={(e) => onChange({ pdfSubjectWidth: parseInt(e.target.value, 10) })}
                      className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Row Gap</span>
                      <span className="font-mono text-purple-700 font-bold">{config.pdfRowGap !== undefined ? config.pdfRowGap : 34}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      value={config.pdfRowGap !== undefined ? config.pdfRowGap : 34}
                      onChange={(e) => onChange({ pdfRowGap: parseInt(e.target.value, 10) })}
                      className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Announcement Text Box (Notice Mode) */}
            {config.type === 'announcement' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Announcement Message
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600">Font:</span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('announcementFontSize', -2, 26, 16, 54)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                        {config.announcementFontSize || 26}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('announcementFontSize', 2, 26, 16, 54)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={config.announcementText || ''}
                    onChange={(e) => onChange({ announcementText: e.target.value.toUpperCase() })}
                    placeholder="ENTER NOTICE MESSAGE HERE..."
                    className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Notice Badge Text (Yellow Pill)
                  </label>
                  <input
                    type="text"
                    value={config.announcementBadge || ''}
                    onChange={(e) => onChange({ announcementBadge: e.target.value })}
                    placeholder="e.g. Keep Learning !!"
                    className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {/* AI Assistant Quick Generator Banner */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAiModal}
                className="w-full p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Auto-Generate Schedule / Syllabus</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TABLE & GRID DATA (Unified Main Studio Editor) ================= */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            {/* 1. Poster Format Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Poster Format
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTypeChange('syllabus')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'syllabus'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('timetable')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'timetable'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Timetable
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('announcement')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    config.type === 'announcement'
                      ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Notice
                </button>
              </div>
            </div>

            {/* 2. Main Header Text Inputs (Batch Name, Subtitle, Date) */}
            <div className="space-y-3">
              {/* Batch Name Header Input + Quick Font Size Adjuster */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {config.type === 'announcement' ? 'Notice Header / Tag' : 'Batch Name (Main Heading)'}
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600">Font:</span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('batchNameFontSize', -2, 34, 18, 54)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Decrease Header Font Size"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                      {currentBatchSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('batchNameFontSize', 2, 34, 18, 54)}
                      className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                      title="Increase Header Font Size"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={config.batchName}
                  onChange={(e) => onChange({ batchName: e.target.value })}
                  placeholder="e.g. PRAHAAR 2027 / TEST SYLLABUS"
                  className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                />
              </div>

              {/* Subtitle / Schedule Title Input + Quick Font Size Adjuster */}
              {config.type !== 'announcement' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Schedule Subtitle (Optional)
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600">Font:</span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('titleFontSize', -2, 22, 14, 38)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                        title="Decrease Subtitle Font Size"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                        {currentTitleSize}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('titleFontSize', 2, 22, 14, 38)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                        title="Increase Subtitle Font Size"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="e.g. WEEKLY TEST 04 / CLASS TIME TABLE"
                    className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              )}

              {/* Date Badge Pill + Quick Font Size */}
              {config.type !== 'announcement' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Date Pill Text (Yellow Badge)
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600">Font:</span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('dateFontSize', -1, 14.5, 11, 26)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                        title="Decrease Date Font Size"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[11px] font-black text-purple-900 font-mono w-6 text-center">
                        {Math.round(currentDateSize)}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustFontSize('dateFontSize', 1, 14.5, 11, 26)}
                        className="p-1 hover:bg-white text-slate-700 hover:text-purple-700 rounded transition-colors"
                        title="Increase Date Font Size"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={config.startDate}
                    onChange={(e) => onChange({ startDate: e.target.value })}
                    placeholder="e.g. 02/08/2026 or 27 JULY TO 02 AUG"
                    className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              )}

              {/* Announcement specific inputs */}
              {config.type === 'announcement' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Notice Message</label>
                    <textarea
                      rows={3}
                      value={config.announcementText || ''}
                      onChange={(e) => onChange({ announcementText: e.target.value })}
                      placeholder="e.g. CLASSES WILL REMAIN SUSPENDED TOMORROW DUE TO FESTIVAL"
                      className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none resize-y"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Bottom Badge Text</label>
                    <input
                      type="text"
                      value={config.announcementBadge || 'KEEP LEARNING !!'}
                      onChange={(e) => onChange({ announcementBadge: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Table Rows & Columns (For Syllabus and Timetable) */}
            {config.type !== 'announcement' && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                {/* Stepper Counters for Rows & Cols */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {/* Rows */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700">Rows ({config.numRows})</span>
                    <div className="flex items-center bg-white rounded-xl border border-slate-300 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => removeRow(config.numRows - 1)}
                        disabled={config.numRows <= 1}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center font-extrabold text-sm text-slate-900 font-mono">
                        {config.numRows}
                      </span>
                      <button
                        type="button"
                        onClick={addRow}
                        disabled={config.numRows >= 12}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Columns */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700">Columns ({config.numCols})</span>
                    <div className="flex items-center bg-white rounded-xl border border-slate-300 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={removeColumn}
                        disabled={config.numCols <= 1}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center font-extrabold text-sm text-slate-900 font-mono">
                        {config.numCols}
                      </span>
                      <button
                        type="button"
                        onClick={addColumn}
                        disabled={config.numCols >= 8}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Table Font Adjuster Banner */}
                <div className="flex items-center justify-between p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-xs font-bold text-purple-950">Table Text Font Size:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableCellFontSize', -1, 16, 10, 30)}
                      className="p-1 bg-white hover:bg-purple-100 text-purple-900 rounded-md border border-purple-200"
                      title="Decrease Table Font Size"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-purple-900 font-mono w-7 text-center">
                      {currentTableCellSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableCellFontSize', 1, 16, 10, 30)}
                      className="p-1 bg-white hover:bg-purple-100 text-purple-900 rounded-md border border-purple-200"
                      title="Increase Table Font Size"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Table Row Inputs List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Edit Cell Text
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsGridModalOpen(true)}
                      className="flex items-center gap-1 text-xs text-purple-700 font-bold hover:underline"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full Screen Grid</span>
                    </button>
                  </div>

                  {/* Real-Time Spacing & Distance Sliders */}
                  {config.type === 'syllabus' && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Subject Distance & Spacing</span>
                        <button
                          type="button"
                          onClick={() => onChange({ pdfSubjectWidth: 180, pdfRowGap: 32, pdfContentY: 245 })}
                          className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs"
                        >
                          ★ Reset Spacing
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Subject Width</span>
                            <span className="font-mono text-purple-700 font-bold">{config.pdfSubjectWidth !== undefined ? config.pdfSubjectWidth : 180}px</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={340}
                            value={config.pdfSubjectWidth !== undefined ? config.pdfSubjectWidth : 180}
                            onChange={(e) => onChange({ pdfSubjectWidth: parseInt(e.target.value, 10) })}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Row Gap</span>
                            <span className="font-mono text-purple-700 font-bold">{config.pdfRowGap !== undefined ? config.pdfRowGap : 32}px</span>
                          </div>
                          <input
                            type="range"
                            min={12}
                            max={60}
                            value={config.pdfRowGap !== undefined ? config.pdfRowGap : 32}
                            onChange={(e) => onChange({ pdfRowGap: parseInt(e.target.value, 10) })}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* PDF Independent Font Size Steppers */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-600">PDF Subj:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onChange({ pdfSubjectFontSize: Math.max(10, (config.pdfSubjectFontSize || 22) - 1) })}
                              className="p-0.5 bg-slate-100 hover:bg-purple-100 text-purple-900 rounded"
                              title="Decrease PDF Subject Font"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-[10px] font-extrabold text-purple-900 font-mono w-5 text-center">
                              {config.pdfSubjectFontSize || 22}
                            </span>
                            <button
                              type="button"
                              onClick={() => onChange({ pdfSubjectFontSize: Math.min(36, (config.pdfSubjectFontSize || 22) + 1) })}
                              className="p-0.5 bg-slate-100 hover:bg-purple-100 text-purple-900 rounded"
                              title="Increase PDF Subject Font"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-600">PDF Topic:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onChange({ pdfTopicFontSize: Math.max(10, (config.pdfTopicFontSize || 17) - 1) })}
                              className="p-0.5 bg-slate-100 hover:bg-purple-100 text-purple-900 rounded"
                              title="Decrease PDF Topic Font"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-[10px] font-extrabold text-purple-900 font-mono w-5 text-center">
                              {config.pdfTopicFontSize || 17}
                            </span>
                            <button
                              type="button"
                              onClick={() => onChange({ pdfTopicFontSize: Math.min(36, (config.pdfTopicFontSize || 17) + 1) })}
                              className="p-0.5 bg-slate-100 hover:bg-purple-100 text-purple-900 rounded"
                              title="Increase PDF Topic Font"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {config.tableData.slice(0, config.numRows).map((row, rIdx) => {
                      const isTimeTableSelect = config.type === 'timetable' && rIdx > 0;
                      return (
                        <div
                          key={rIdx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group hover:border-purple-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                              Row {rIdx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveRow(rIdx, 'up')}
                                disabled={rIdx === 0}
                                className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded disabled:opacity-20"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveRow(rIdx, 'down')}
                                disabled={rIdx === config.numRows - 1}
                                className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded disabled:opacity-20"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(rIdx)}
                                disabled={config.numRows <= 1}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-20 ml-1"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Inputs for columns */}
                          <div className="grid grid-cols-1 gap-2">
                            {row.slice(0, config.numCols).map((cellVal, cIdx) => (
                              <div key={cIdx} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-500">
                                  {cIdx === 0
                                    ? config.type === 'timetable'
                                      ? 'Day / Header'
                                      : 'Subject / Name'
                                    : `Column ${cIdx + 1} (Topics / Time)`}
                                </span>
                                {isTimeTableSelect && cIdx === 0 ? (
                                  <select
                                    value={cellVal || 'Select Day'}
                                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                                  >
                                    {WEEKDAYS.map((day) => (
                                      <option key={day} value={day}>
                                        {day}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <textarea
                                    rows={cIdx === 0 ? 1 : 2}
                                    value={cellVal}
                                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                    placeholder={cIdx === 0 ? 'e.g. Physics' : 'e.g. Kinematics & Laws of Motion'}
                                    className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 rounded-lg p-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none resize-y"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="w-full py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-700 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Row ({config.numRows + 1})</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. AI Quick Auto-Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAiModal}
                className="w-full p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Auto-Generate Schedule / Syllabus</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CANVA TYPOGRAPHY STUDIO ================= */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            {/* 1. Canva Font Family Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-purple-600" />
                  <span>Canva Font Family</span>
                </label>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {CANVA_FONTS.find((f) => f.family === config.fontFamily)?.name || 'Montserrat'}
                </span>
              </div>

              {/* Font Family Dropdown */}
              <select
                value={config.fontFamily || CANVA_FONTS[0].family}
                onChange={(e) => onChange({ fontFamily: e.target.value })}
                className="w-full bg-white border-2 border-purple-300 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 shadow-xs outline-none focus:border-purple-600 cursor-pointer"
                style={{ fontFamily: config.fontFamily || "'Montserrat', sans-serif" }}
              >
                {CANVA_FONTS.map((font) => (
                  <option key={font.id} value={font.family} style={{ fontFamily: font.family }}>
                    {font.name} — {font.category}
                  </option>
                ))}
              </select>

              {/* Visual Font Cards Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 max-h-[190px] overflow-y-auto pr-1">
                {CANVA_FONTS.map((font) => {
                  const isSelected = (config.fontFamily || CANVA_FONTS[0].family) === font.family;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => onChange({ fontFamily: font.family })}
                      className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/30'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-bold text-slate-600 truncate">{font.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{font.category}</span>
                      </div>
                      <div
                        style={{ fontFamily: font.family }}
                        className="text-xs font-bold text-slate-900 truncate leading-tight"
                      >
                        PW POSTER
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Global Text Scale */}
            <div className="p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-700" />
                  <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                    Global Poster Text Scale
                  </span>
                </div>
                <span className="text-xs font-black text-purple-900 font-mono bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  {Math.round(currentGlobalScale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0.8, 0.9, 1.0, 1.15, 1.3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ globalFontScale: s })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      currentGlobalScale === s
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white hover:bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    {Math.round(s * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Granular Element Typography Controls */}
            <div className="space-y-3.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Element Sizing & Font Weights
              </label>

              {/* Batch Header Font */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Batch Name (Header)</span>
                  <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                    {currentBatchSize}px
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustFontSize('batchNameFontSize', -2, 34, 18, 54)}
                    className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={18}
                    max={54}
                    value={currentBatchSize}
                    onChange={(e) => onChange({ batchNameFontSize: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-purple-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => adjustFontSize('batchNameFontSize', 2, 34, 18, 54)}
                    className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-medium">Weight:</span>
                  <select
                    value={config.batchNameFontWeight || '800'}
                    onChange={(e) => onChange({ batchNameFontWeight: e.target.value as PosterConfig['batchNameFontWeight'] })}
                    className="bg-white border border-slate-200 rounded-md px-2 py-0.5 font-bold text-slate-700 outline-none"
                  >
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>

              {/* Subtitle Font */}
              {config.type !== 'announcement' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Schedule Subtitle</span>
                    <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                      {currentTitleSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustFontSize('titleFontSize', -2, 22, 14, 38)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={14}
                      max={38}
                      value={currentTitleSize}
                      onChange={(e) => onChange({ titleFontSize: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => adjustFontSize('titleFontSize', 2, 22, 14, 38)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Date Pill Font */}
              {config.type !== 'announcement' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Date Pill Badge</span>
                    <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                      {Math.round(currentDateSize)}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustFontSize('dateFontSize', -1, 14.5, 11, 26)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={11}
                      max={26}
                      value={Math.round(currentDateSize)}
                      onChange={(e) => onChange({ dateFontSize: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => adjustFontSize('dateFontSize', 1, 14.5, 11, 26)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Table Headers / Days */}
              {config.type !== 'announcement' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Table Headers / Days</span>
                    <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                      {currentTableHeadSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableHeaderFontSize', -1, 18, 12, 32)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      value={currentTableHeadSize}
                      onChange={(e) => onChange({ tableHeaderFontSize: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableHeaderFontSize', 1, 18, 12, 32)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Table Content / Topics */}
              {config.type !== 'announcement' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Table Content / Topics</span>
                    <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                      {currentTableCellSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableCellFontSize', -1, 16, 10, 30)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={10}
                      max={30}
                      value={currentTableCellSize}
                      onChange={(e) => onChange({ tableCellFontSize: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => adjustFontSize('tableCellFontSize', 1, 16, 10, 30)}
                      className="p-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-lg text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">Text Alignment:</span>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onChange({ tableCellAlign: 'left' })}
                        className={`p-1 rounded ${
                          config.tableCellAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-600'
                        }`}
                        title="Left"
                      >
                        <AlignLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ tableCellAlign: 'center' })}
                        className={`p-1 rounded ${
                          config.tableCellAlign === 'center' || !config.tableCellAlign ? 'bg-purple-600 text-white' : 'text-slate-600'
                        }`}
                        title="Center"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ tableCellAlign: 'right' })}
                        className={`p-1 rounded ${
                          config.tableCellAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-600'
                        }`}
                        title="Right"
                      >
                        <AlignRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header Vertical Spacing */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Header Vertical Spacing</span>
                  <span className="text-xs font-black text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded">
                    {config.headerGap !== undefined ? config.headerGap : 5}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={config.headerGap !== undefined ? config.headerGap : 5}
                  onChange={(e) => onChange({ headerGap: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Reset Fonts Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    fontFamily: CANVA_FONTS[0].family,
                    batchNameFontSize: undefined,
                    titleFontSize: undefined,
                    dateFontSize: undefined,
                    tableHeaderFontSize: undefined,
                    tableCellFontSize: undefined,
                    batchNameFontWeight: '800',
                    announcementFontSize: undefined,
                    tableHeaderFontWeight: '800',
                    tableCellFontWeight: '600',
                    tableCellAlign: 'center',
                    globalFontScale: 1.0,
                    headerGap: 5
                  })
                }
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Fonts & Sizing to Default</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: THEME & BRANDING ================= */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            {/* Color Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                PW Color Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'purple-pw', label: 'PW Purple', bg: 'bg-[#5b21b6]', border: 'border-purple-400' },
                  { id: 'maroon-pw', label: 'PW Maroon', bg: 'bg-[#4a0404]', border: 'border-rose-400' },
                  { id: 'navy-pw', label: 'PW Navy', bg: 'bg-[#0f172a]', border: 'border-blue-400' },
                  { id: 'emerald-pw', label: 'PW Emerald', bg: 'bg-[#064e3b]', border: 'border-emerald-400' },
                  { id: 'dark-slate', label: 'Dark Slate', bg: 'bg-[#18181b]', border: 'border-zinc-400' },
                  { id: 'vibrant-gold', label: 'Vibrant Gold', bg: 'bg-[#78350f]', border: 'border-amber-400' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ theme: t.id as ThemePreset })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      config.theme === t.id
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-full h-4 rounded-md ${t.bg}`} />
                    <span className="text-[11px] font-bold text-slate-800">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Settings */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Physics Wallah Logo
              </label>
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-800">Show Brand Logo</span>
                <input
                  type="checkbox"
                  checked={config.showLogo}
                  onChange={(e) => onChange({ showLogo: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Custom Logo (Optional)</label>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'customLogoUrl', { logoStyleMode: 'custom' })}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{config.customLogoUrl ? 'Change Custom Logo' : 'Upload Custom Logo'}</span>
                </button>
                {config.customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => onChange({ customLogoUrl: undefined, logoStyleMode: 'pw-official-img' })}
                    className="text-xs text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove Custom Logo
                  </button>
                )}
              </div>
            </div>

            {/* Custom Background Image Uploader */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Custom Background Image
              </label>
              <input
                type="file"
                ref={bgFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'customBgUrl', { bgStyleMode: 'custom' })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bgFileInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{config.customBgUrl ? 'Replace Background' : 'Upload Poster Background'}</span>
              </button>
              {config.customBgUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ customBgUrl: undefined, bgStyleMode: 's3-template1' })}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Remove Custom Background
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Expanded Grid Modal */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col gap-4 max-h-[88vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Full Screen Table Editor ({config.numRows} × {config.numCols})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto max-h-[60vh] space-y-3">
              {config.tableData.slice(0, config.numRows).map((row, rIdx) => (
                <div key={rIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-7 h-7 bg-purple-100 text-purple-800 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                    {rIdx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {row.slice(0, config.numCols).map((cellVal, cIdx) => (
                      <textarea
                        key={cIdx}
                        rows={3}
                        value={cellVal}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        placeholder={`Column ${cIdx + 1}...`}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-900 outline-none focus:border-purple-600"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={addRow}
                disabled={config.numRows >= 12}
                className="px-4 py-2 bg-purple-50 text-purple-800 font-bold text-xs rounded-xl disabled:opacity-50"
              >
                + Add Row
              </button>
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
