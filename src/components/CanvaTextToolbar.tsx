import React from 'react';
import { PosterConfig } from '../types';
import { CANVA_FONTS, BRAND_COLORS } from '../data/fonts';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';

interface CanvaTextToolbarProps {
  config: PosterConfig;
  onChange: (updated: Partial<PosterConfig>) => void;
  activeElement: 'batchName' | 'title' | 'date' | 'tableHeader' | 'tableCell' | 'all';
  onSelectActiveElement?: (elem: 'batchName' | 'title' | 'date' | 'tableHeader' | 'tableCell' | 'all') => void;
  selectedCell?: { rIdx: number; cIdx: number } | null;
  previewMode?: 'poster' | 'pdf';
}

export const CanvaTextToolbar: React.FC<CanvaTextToolbarProps> = ({
  config,
  onChange,
  activeElement,
  selectedCell,
  previewMode = 'poster'
}) => {
  const isPdf = previewMode === 'pdf';
  const cellKey = selectedCell ? `${selectedCell.rIdx}-${selectedCell.cIdx}` : null;
  const currentCellStyle = cellKey && config.cellStyles ? config.cellStyles[cellKey] : null;

  // Current active font family
  const currentFontFamily = currentCellStyle?.fontFamily || config.fontFamily || CANVA_FONTS[0].family;

  // Compute font size for active element or specific selected cell
  const getActiveFontSize = () => {
    if (selectedCell && currentCellStyle?.fontSize) {
      return currentCellStyle.fontSize;
    }
    if (isPdf) {
      switch (activeElement) {
        case 'batchName':
          return config.pdfHeaderLine1FontSize || 28;
        case 'title':
          return config.pdfHeaderLine2FontSize || 16;
        case 'tableHeader':
          return config.pdfSubjectFontSize || config.tableHeaderFontSize || 22;
        case 'tableCell':
          return config.pdfTopicFontSize || config.tableCellFontSize || 17;
        default:
          return 100;
      }
    }
    switch (activeElement) {
      case 'batchName':
        return config.batchNameFontSize || 34;
      case 'title':
        return config.titleFontSize || 22;
      case 'date':
        return Math.round(config.dateFontSize || 15);
      case 'tableHeader':
        return config.tableHeaderFontSize || 22;
      case 'tableCell':
        return config.tableCellFontSize || 17;
      default:
        return Math.round((config.globalFontScale || 1.0) * 100);
    }
  };

  const currentSize = getActiveFontSize();

  const handleSizeChange = (delta: number) => {
    if (selectedCell && cellKey) {
      const base = currentCellStyle?.fontSize || (
        isPdf
          ? (activeElement === 'tableHeader' ? config.pdfSubjectFontSize || 22 : config.pdfTopicFontSize || 17)
          : (activeElement === 'tableHeader' ? config.tableHeaderFontSize || 22 : config.tableCellFontSize || 17)
      );
      const next = Math.max(10, Math.min(48, base + delta));
      const updated = { ...(config.cellStyles || {}) };
      updated[cellKey] = { ...(updated[cellKey] || {}), fontSize: next };
      onChange({ cellStyles: updated });
      return;
    }

    if (isPdf) {
      switch (activeElement) {
        case 'batchName': {
          const next = Math.max(14, Math.min(52, (config.pdfHeaderLine1FontSize || 28) + delta));
          onChange({ pdfHeaderLine1FontSize: next });
          break;
        }
        case 'title': {
          const next = Math.max(10, Math.min(36, (config.pdfHeaderLine2FontSize || 16) + delta));
          onChange({ pdfHeaderLine2FontSize: next });
          break;
        }
        case 'tableHeader': {
          const next = Math.max(10, Math.min(36, (config.pdfSubjectFontSize || config.tableHeaderFontSize || 22) + delta));
          onChange({ pdfSubjectFontSize: next });
          break;
        }
        case 'tableCell': {
          const next = Math.max(10, Math.min(36, (config.pdfTopicFontSize || config.tableCellFontSize || 17) + delta));
          onChange({ pdfTopicFontSize: next });
          break;
        }
      }
      return;
    }

    switch (activeElement) {
      case 'batchName': {
        const next = Math.max(16, Math.min(60, (config.batchNameFontSize || 34) + delta));
        onChange({ batchNameFontSize: next });
        break;
      }
      case 'title': {
        const base = config.type === 'announcement' ? (config.announcementFontSize || config.titleFontSize || 26) : (config.titleFontSize || 22);
        const next = Math.max(12, Math.min(54, base + delta));
        onChange({ titleFontSize: next, announcementFontSize: next });
        break;
      }
      case 'date': {
        const next = Math.max(10, Math.min(28, (config.dateFontSize || 15) + delta));
        onChange({ dateFontSize: next });
        break;
      }
      case 'tableHeader': {
        const next = Math.max(12, Math.min(36, (config.tableHeaderFontSize || 22) + delta));
        onChange({ tableHeaderFontSize: next });
        break;
      }
      case 'tableCell': {
        const next = Math.max(10, Math.min(36, (config.tableCellFontSize || 17) + delta));
        onChange({ tableCellFontSize: next });
        break;
      }
      case 'all': {
        const currentScale = config.globalFontScale || 1.0;
        const nextScale = parseFloat(Math.max(0.6, Math.min(1.6, currentScale + delta * 0.05)).toFixed(2));
        onChange({ globalFontScale: nextScale });
        break;
      }
    }
  };

  const handleFontFamilyChange = (family: string) => {
    if (selectedCell && cellKey) {
      const updated = { ...(config.cellStyles || {}) };
      updated[cellKey] = { ...(updated[cellKey] || {}), fontFamily: family };
      onChange({ cellStyles: updated });
    } else {
      onChange({ fontFamily: family });
    }
  };

  const handleFontWeightChange = (val: PosterConfig['batchNameFontWeight']) => {
    if (selectedCell && cellKey) {
      const updated = { ...(config.cellStyles || {}) };
      updated[cellKey] = { ...(updated[cellKey] || {}), fontWeight: val };
      onChange({ cellStyles: updated });
      return;
    }

    if (activeElement === 'tableCell') onChange({ tableCellFontWeight: val });
    else if (activeElement === 'batchName') onChange({ batchNameFontWeight: val });
    else if (activeElement === 'title') onChange({ titleFontWeight: val, announcementFontWeight: val });
    else if (activeElement === 'tableHeader') onChange({ tableHeaderFontWeight: val });
    else if (activeElement === 'date') onChange({ dateBadgeFontWeight: val as PosterConfig['dateBadgeFontWeight'] });
    else {
      onChange({
        batchNameFontWeight: val,
        titleFontWeight: val,
        announcementFontWeight: val,
        tableHeaderFontWeight: val,
        tableCellFontWeight: val
      });
    }
  };

  const handleAlignChange = (align: 'left' | 'center' | 'right') => {
    if (selectedCell && cellKey) {
      const updated = { ...(config.cellStyles || {}) };
      updated[cellKey] = { ...(updated[cellKey] || {}), textAlign: align };
      onChange({ cellStyles: updated });
      return;
    }

    if (activeElement === 'tableCell') onChange({ tableCellAlign: align });
    else if (activeElement === 'tableHeader') onChange({ tableHeaderAlign: align });
    else if (activeElement === 'title') onChange({ announcementTextAlign: align });
  };

  const handleColorChange = (hex: string) => {
    if (selectedCell && cellKey) {
      const updated = { ...(config.cellStyles || {}) };
      updated[cellKey] = { ...(updated[cellKey] || {}), color: hex };
      onChange({ cellStyles: updated });
      return;
    }

    if (activeElement === 'batchName') onChange({ batchNameTextColor: hex });
    else if (activeElement === 'title') onChange({ titleTextColor: hex });
    else if (activeElement === 'date') onChange({ dateBadgeTextColor: hex });
    else if (activeElement === 'tableHeader') onChange({ tableHeaderTextColor: hex, pdfSubjectColor: hex });
    else if (activeElement === 'tableCell') onChange({ tableCellTextColor: hex, pdfTopicColor: hex });
    else if (activeElement === 'all') {
      onChange({
        batchNameTextColor: hex,
        titleTextColor: hex,
        tableHeaderTextColor: hex,
        tableCellTextColor: hex,
        dateBadgeTextColor: hex,
        pdfSubjectColor: hex,
        pdfTopicColor: hex
      });
    }
  };

  // Compute active weight value
  const currentFontWeight = selectedCell && currentCellStyle?.fontWeight
    ? currentCellStyle.fontWeight
    : activeElement === 'tableCell'
    ? config.tableCellFontWeight || '600'
    : activeElement === 'batchName'
    ? config.batchNameFontWeight || '800'
    : activeElement === 'title'
    ? config.titleFontWeight || (config.announcementFontWeight === 'extrabold' ? '800' : config.announcementFontWeight === 'bold' ? '700' : config.announcementFontWeight === 'semibold' ? '600' : config.announcementFontWeight === 'normal' ? '400' : config.announcementFontWeight === 'medium' ? '500' : (config.announcementFontWeight as any)) || '500'
    : activeElement === 'tableHeader'
    ? config.tableHeaderFontWeight || '800'
    : activeElement === 'date'
    ? config.dateBadgeFontWeight || '800'
    : config.titleFontWeight || '700';

  // Compute active alignment value
  const currentAlign = selectedCell && currentCellStyle?.textAlign
    ? currentCellStyle.textAlign
    : activeElement === 'tableHeader'
    ? config.tableHeaderAlign || 'center'
    : config.tableCellAlign || 'center';

  return (
    <div className="w-full bg-white h-full px-2 sm:px-4 flex items-center justify-start gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar">
      {/* Selected Cell Badge (Only shown when a specific cell is clicked) */}
      {selectedCell && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-purple-100/90 text-purple-800 border border-purple-200 shadow-2xs shrink-0 whitespace-nowrap">
          <Type className="w-3.5 h-3.5 text-purple-700" />
          <span>Cell [R{selectedCell.rIdx + 1}, C{selectedCell.cIdx + 1}]</span>
        </div>
      )}

      {/* Main Canva-Style Toolbar Controls */}
      <div className="flex items-center justify-start gap-2 sm:gap-3 text-xs flex-1 shrink-0 whitespace-nowrap">
        {/* Pro-Grade Font Family Dropdown with Smart Icon */}
        <div className="flex items-center shrink-0">
          <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-300 rounded-lg px-2.5 py-1 gap-1.5 transition-all shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <select
              value={currentFontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1 w-32 sm:w-40"
              style={{ fontFamily: currentFontFamily }}
              title="Choose Typography Font"
            >
              {CANVA_FONTS.map((font) => (
                <option
                  key={font.id}
                  value={font.family}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Center: Font Size Stepper */}
        <div className="flex items-center bg-transparent border border-slate-200 rounded-md overflow-hidden h-8">
          <button
            type="button"
            onClick={() => handleSizeChange(-1)}
            className="h-full px-2 text-slate-700 hover:text-purple-700 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold"
            title="Decrease Font Size"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="px-2.5 font-mono font-extrabold text-slate-800 text-xs border-x border-slate-200 h-full flex items-center bg-white min-w-[42px] justify-center cursor-default">
            {activeElement === 'all' && !selectedCell ? `${currentSize}%` : `${currentSize}px`}
          </div>
          <button
            type="button"
            onClick={() => handleSizeChange(1)}
            className="h-full px-2 text-slate-700 hover:text-purple-700 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold"
            title="Increase Font Size"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Font Weight Dropdown */}
        <div className="flex items-center">
          <select
            value={currentFontWeight}
            onChange={(e) => handleFontWeightChange(e.target.value as PosterConfig['batchNameFontWeight'])}
            className="bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-purple-600 cursor-pointer transition-colors h-8"
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">SemiBold</option>
            <option value="700">Bold</option>
            <option value="800">ExtraBold</option>
            <option value="900">Black</option>
          </select>
        </div>

        <div className="w-px h-5 bg-slate-200 shrink-0 hidden sm:block" />

        {/* Alignment controls (Left, Center, Right) */}
        <div className="flex items-center bg-transparent border border-slate-200 rounded-md p-0.5 h-8">
          <button
            type="button"
            onClick={() => handleAlignChange('left')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'left'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('center')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'center'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('right')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'right'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 shrink-0 hidden lg:block" />

        {/* Quick Brand Colors Swatches & Custom Picker */}
        <div className="flex items-center gap-1.5 h-8 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline-block">Color:</span>
          
          <label className="w-5 h-5 rounded-full overflow-hidden border border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center shrink-0 relative group" title="Custom Color">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-purple-400 to-sky-400 pointer-events-none" />
            <input
              type="color"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </label>

          <div className="w-px h-3 bg-slate-200 mx-0.5" />

          {BRAND_COLORS.slice(0, 6).map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorChange(color.hex)}
              style={{ backgroundColor: color.hex }}
              className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-125 transition-transform"
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
