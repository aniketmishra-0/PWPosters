import React, { useState, useRef, useEffect } from 'react';
import { PwLogo } from './PwLogo';
import {
  Download,
  FileText,
  FolderOpen,
  Copy,
  Check,
  ChevronDown,
  Menu,
  Undo2,
  Redo2,
  Users
} from 'lucide-react';
import { PresetSample, PosterConfig } from '../types';
import { PRESET_SAMPLES } from '../data/defaultPresets';

interface HeaderProps {
  onOpenSavedModal: () => void;
  onSelectPreset: (preset: PresetSample) => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onExportSyllabusPdf: () => void;
  onCopyImage: () => void;
  isExporting: boolean;
  copied: boolean;
  savedCount: number;
  batchName: string;
  onChangeBatchName: (name: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onToggleSidebar?: () => void;
  posterType?: PosterConfig['type'];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSavedModal,
  onSelectPreset,
  onExportPng,
  onExportPdf,
  onExportSyllabusPdf,
  onCopyImage,
  isExporting,
  copied,
  savedCount,
  batchName,
  onChangeBatchName,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onToggleSidebar,
  posterType = 'syllabus'
}) => {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPresetsOpen(false);
      }
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPresetsOpen(false);
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 shrink-0 relative z-50 h-[60px] flex items-center justify-between px-3 sm:px-4 shadow-sm">
      {/* Left Section: Menu & Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors text-slate-700"
          title="Toggle Studio Settings / Sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-1.5">
          <PwLogo size={28} className="text-purple-700 shrink-0" />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">Posters</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
          <button type="button" className="px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 text-slate-700 rounded-md transition-colors">Home</button>
          
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPresetsOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 text-slate-700 rounded-md transition-colors"
            >
              <span>Templates</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPresetsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPresetsOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>PW Templates</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                  {PRESET_SAMPLES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setIsPresetsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-purple-50 active:bg-purple-100 text-slate-800 transition-colors"
                    >
                      <div className="font-bold text-sm text-slate-900">{preset.name}</div>
                      <div className="text-xs text-slate-500 truncate">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: Document Title & Undo/Redo */}
      <div className="flex-1 flex items-center justify-center gap-2 max-w-lg hidden md:flex">
        <button 
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button 
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        
        <input
          type="text"
          value={batchName}
          onChange={(e) => onChangeBatchName(e.target.value)}
          placeholder="Untitled Poster"
          className="bg-transparent border-none outline-none text-slate-800 font-bold text-center hover:bg-slate-100 focus:bg-slate-200 px-3 py-1 rounded-md transition-colors w-64 placeholder-slate-400"
        />
        <span className="text-slate-400 text-xs font-semibold">- Saved</span>
      </div>

      {/* Right Section: Avatars, Share, Download */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenSavedModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          title="View saved projects"
        >
          <FolderOpen className="w-4 h-4 text-purple-600" />
          {savedCount > 0 && <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{savedCount}</span>}
        </button>
        
        <button type="button" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
          <Users className="w-4 h-4 text-slate-500" />
        </button>

        <div className="relative shrink-0" ref={downloadDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDownloadOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors shadow-sm"
          >
            <span>Share</span>
            <Download className="w-4 h-4" />
          </button>
          
          {isDownloadOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-slate-800">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Export As</p>
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => { onExportPng(); setIsDownloadOpen(false); }} disabled={isExporting} className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm hover:bg-slate-50 rounded-lg font-medium">
                    <Download className="w-4 h-4 text-purple-600" /> Download PNG
                  </button>
                  <button type="button" onClick={() => { onExportPdf(); setIsDownloadOpen(false); }} disabled={isExporting} className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm hover:bg-slate-50 rounded-lg font-medium">
                    <FileText className="w-4 h-4 text-rose-600" /> {posterType === 'syllabus' ? 'Standard Poster PDF' : 'Download PDF'}
                  </button>
                  {posterType === 'syllabus' && (
                    <button type="button" onClick={() => { onExportSyllabusPdf(); setIsDownloadOpen(false); }} disabled={isExporting} className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm hover:bg-slate-50 rounded-lg font-medium">
                      <FileText className="w-4 h-4 text-blue-600" /> Official Syllabus PDF (A4)
                    </button>
                  )}
                  <button type="button" onClick={() => { onCopyImage(); setIsDownloadOpen(false); }} disabled={isExporting} className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm hover:bg-slate-50 rounded-lg font-medium">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />} Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
