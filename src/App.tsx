import React, { useState, useRef, useEffect } from 'react';
import { PosterConfig, SavedPoster, PresetSample } from './types';
import { DEFAULT_CLEAN_POSTER } from './data/defaultPresets';
import { Header } from './components/Header';
import { PosterForm } from './components/PosterForm';
import { PosterPreview } from './components/PosterPreview';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { SavedPostersModal } from './components/SavedPostersModal';
import {
  exportPosterAsImage,
  exportPosterAsPdf,
  copyPosterToClipboard
} from './utils/exporter';
import {
  CheckCircle2,
  Layout,
  Type,
  Palette,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Info,
  FileText,
  LayoutTemplate,
  X
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'pw_generator_saved_posters_v1';

export default function App() {
  const [config, setConfigState] = useState<PosterConfig>(DEFAULT_CLEAN_POSTER);
  const [previewMode, setPreviewMode] = useState<'poster' | 'pdf'>('poster');
  
  // History State
  const [history, setHistory] = useState<PosterConfig[]>([DEFAULT_CLEAN_POSTER]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const historyRef = useRef<PosterConfig[]>([DEFAULT_CLEAN_POSTER]);
  const historyIndexRef = useRef(0);

  const setConfig = (updater: React.SetStateAction<PosterConfig>) => {
    setConfigState((prev) => {
      const next = typeof updater === 'function' ? (updater as (prev: PosterConfig) => PosterConfig)(prev) : updater;
      return next;
    });
  };

  // Use useEffect to push to history after state settles
  useEffect(() => {
    // Debounce history pushes
    const timer = setTimeout(() => {
      const currentHistory = historyRef.current;
      const currentIndex = historyIndexRef.current;
      const lastEntry = currentHistory[currentIndex];
      
      // Only push if actually changed
      if (lastEntry !== config && JSON.stringify(lastEntry) !== JSON.stringify(config)) {
        const newHistory = currentHistory.slice(0, currentIndex + 1);
        const cloned = structuredClone(config);
        newHistory.push(cloned);
        if (newHistory.length > 50) newHistory.shift();
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [config]);

  const handleUndo = () => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx > 0) {
      const newIdx = idx - 1;
      historyIndexRef.current = newIdx;
      setHistoryIndex(newIdx);
      setConfigState(structuredClone(hist[newIdx]));
    }
  };

  const handleRedo = () => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx < hist.length - 1) {
      const newIdx = idx + 1;
      historyIndexRef.current = newIdx;
      setHistoryIndex(newIdx);
      setConfigState(structuredClone(hist[newIdx]));
    }
  };

  const [savedPosters, setSavedPosters] = useState<SavedPoster[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const posterRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'content' | 'grid' | 'typography' | 'theme'>('grid');

  // Global Keyboard Shortcuts for Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Cmd+Shift+Z or Ctrl+Shift+Z
      else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load saved posters on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPosters(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved posters from localStorage:', e);
    }
  }, []);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg({ text, type });
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper to sync config partial updates
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('preview');

  const handleConfigChange = (updated: Partial<PosterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Keep matrix data array in sync with row/col count changes
  const handleDimensionsChange = (newRows: number, newCols: number) => {
    setConfig((prev) => {
      const currentData = prev.tableData || [];
      const updatedMatrix: string[][] = [];

      for (let r = 0; r < newRows; r++) {
        const row: string[] = [];
        for (let c = 0; c < newCols; c++) {
          if (currentData[r] && currentData[r][c] !== undefined) {
            row.push(currentData[r][c]);
          } else if (prev.type === 'timetable' && r === 0 && c === 0) {
            row.push('Days');
          } else {
            row.push('');
          }
        }
        updatedMatrix.push(row);
      }

      return {
        ...prev,
        numRows: newRows,
        numCols: newCols,
        tableData: updatedMatrix
      };
    });
  };

  // Save poster to localStorage
  const handleSavePoster = () => {
    const newSaved: SavedPoster = {
      id: Date.now().toString(),
      name: config.batchName || 'Untitled Poster',
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      config: { ...config }
    };

    const updated = [newSaved, ...savedPosters];
    setSavedPosters(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      showToast('Poster saved successfully to local history!');
    } catch (e) {
      showToast('Failed to save to localStorage', 'error');
    }
  };

  // Delete single saved item
  const handleDeletePoster = (id: string) => {
    const updated = savedPosters.filter((p) => p.id !== id);
    setSavedPosters(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update localStorage:', e);
    }
    showToast('Poster removed from history', 'info');
  };

  // Clear all saved
  const handleClearAllSaved = () => {
    if (window.confirm('Are you sure you want to clear all saved posters?')) {
      setSavedPosters([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
      showToast('Cleared saved history', 'info');
    }
  };

  // Presets selector
  const handleSelectPreset = (preset: PresetSample) => {
    setConfig(structuredClone(preset.config));
    showToast(`Loaded preset: ${preset.name}`);
  };

  // Reset to initial
  const handleReset = () => {
    if (window.confirm('Reset poster parameters to default clean template?')) {
      setConfig(structuredClone(DEFAULT_CLEAN_POSTER));
      showToast('Reset to clean poster template', 'info');
    }
  };

  // Export handlers
  const handleExportPng = async () => {
    if (!posterRef.current) { showToast('Poster preview not ready', 'error'); return; }
    if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
    setIsExporting(true);
    showToast('Rendering high-res PNG image...', 'info');

    try {
      const filename = (config.batchName || 'pw_poster')
        .toLowerCase()
        .replace(/[^\wऀ-ॿঀ-৿]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      await exportPosterAsImage(posterRef.current, 'png', filename);
      showToast('PNG downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PNG', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!posterRef.current) { showToast('Poster preview not ready', 'error'); return; }
    if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
    setIsExporting(true);
    showToast('Generating PDF document...', 'info');

    try {
      const filename = (config.batchName || 'pw_poster')
        .toLowerCase()
        .replace(/[^\wऀ-ॿঀ-৿]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      await exportPosterAsPdf(posterRef.current, filename);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSyllabusPdf = async () => {
    if (!pdfDocRef.current) { showToast('Poster preview not ready', 'error'); return; }
    if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
    setIsExporting(true);
    showToast('Exporting in Official PW Syllabus PDF Template...', 'info');

    try {
      const filename = (config.batchName || 'pw_syllabus_doc')
        .toLowerCase()
        .replace(/[^\wऀ-ॿঀ-৿]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      await exportPosterAsPdf(pdfDocRef.current, filename);
      showToast('Official PW Syllabus PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export Syllabus PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!posterRef.current) { showToast('Poster preview not ready', 'error'); return; }
    if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
    setIsExporting(true);

    try {
      const success = await copyPosterToClipboard(posterRef.current);
      if (success) {
        setCopied(true);
        showToast('Image copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        showToast('Clipboard copy not supported by browser', 'error');
      }
    } catch (err) {
      showToast('Error copying to clipboard', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200" role="status" aria-live="polite">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toastMsg.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : toastMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onSelectPreset={handleSelectPreset}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onExportSyllabusPdf={handleExportSyllabusPdf}
        onCopyImage={handleCopyImage}
        onReset={handleReset}
        isExporting={isExporting}
        copied={copied}
        savedCount={savedPosters.length}
        batchName={config.batchName}
        onChangeBatchName={(name) => handleConfigChange({ batchName: name })}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onToggleSidebar={() => {
          if (window.innerWidth < 768) {
            setMobileTab((prev) => (prev === 'form' ? 'preview' : 'form'));
          } else {
            setIsSidebarCollapsed((prev) => !prev);
          }
        }}
        posterType={config.type}
      />

      {/* Main Studio Body Grid - Canva style Dynamic Full Canvas Toggle */}
      <main className="flex-1 w-full mx-auto p-0 flex h-[calc(100vh-60px)] overflow-hidden relative">
        
        {/* Far-Left Nav (Canva Structure, Original Colors) */}
        <div className="w-[72px] bg-white flex-shrink-0 flex-col items-center py-4 gap-2 z-40 hidden md:flex border-r border-slate-200 shadow-sm">
          <button 
            onClick={() => { setActiveTab('grid'); setIsSidebarCollapsed(false); }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-14 ${activeTab === 'grid' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Layout className="w-5 h-5" />
            <span className="text-[10px] font-bold">Editor</span>
          </button>
          <button 
            onClick={() => { setActiveTab('typography'); setIsSidebarCollapsed(false); }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-14 ${activeTab === 'typography' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-bold">Text</span>
          </button>
          <button 
            onClick={() => { setActiveTab('theme'); setIsSidebarCollapsed(false); }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-14 ${activeTab === 'theme' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Palette className="w-5 h-5" />
            <span className="text-[10px] font-bold">Brand</span>
          </button>
          <button 
            onClick={() => { setActiveTab('content'); setIsSidebarCollapsed(false); }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-14 ${activeTab === 'content' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <UploadCloud className="w-5 h-5" />
            <span className="text-[10px] font-bold">Template</span>
          </button>
        </div>

        {/* Left Sidebar: Form & Interactive Studio Panel (Collapsible on Desktop) */}
        <div 
          className={`flex-shrink-0 bg-white border-r border-slate-200 shadow-sm flex-col h-full overflow-hidden transition-all duration-300 relative z-30 hidden md:flex ${
            isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none border-0' : 'md:w-[320px] lg:w-[350px]'
          }`}
        >
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
            <PosterForm
              key="desktop"
              config={config}
              onChange={handleConfigChange}
              onDimensionsChange={handleDimensionsChange}
              onSavePoster={handleSavePoster}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              activeTab={activeTab}
            />
          </div>
        </div>

        {/* Collapse Handle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-all"
          style={{ left: isSidebarCollapsed ? '60px' : 'calc(72px + max(320px, min(350px, 100vw - 72px)) - 12px)' }}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Right Column: Live Poster / PDF Document Preview (Expands to Full Width when Sidebar is Collapsed) */}
        <div className="flex-1 overflow-y-auto bg-[#f3f4f6] relative flex flex-col">
          <div className="w-full min-h-full p-4 lg:px-8 lg:pt-4 lg:pb-32 flex flex-col items-center justify-start">
            <div className="w-full max-w-[1440px] mx-auto mt-1 mb-auto relative">
              <PosterPreview
                config={config}
                posterRef={posterRef}
                pdfDocRef={pdfDocRef}
                onChange={handleConfigChange}
                onDimensionsChange={handleDimensionsChange}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                onExportPng={handleExportPng}
                onExportPdf={handleExportPdf}
                onExportSyllabusPdf={handleExportSyllabusPdf}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
              />
            </div>
          </div>
        </div>

        {/* Mobile Dark Backdrop when Form is open */}
        {mobileTab === 'form' && (
          <div
            onClick={() => setMobileTab('preview')}
            className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-xs"
          />
        )}

        {/* Mobile Bottom Sheet Drawer for Form */}
        <div 
          className={`md:hidden fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.25)] transition-transform duration-300 z-50 flex flex-col ${
            mobileTab === 'form' ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '85vh' }}
        >
          {/* Drawer Header with Title and Close Button */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-sm font-extrabold text-slate-800">Design Studio Settings</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full p-2 pb-6">
            <PosterForm
              key="mobile"
              config={config}
              onChange={handleConfigChange}
              onDimensionsChange={handleDimensionsChange}
              onSavePoster={handleSavePoster}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              activeTab={activeTab}
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom Quick Navigation Bar for Mobile Phones */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] h-[62px] px-3">
        <div className="flex items-center justify-between h-full gap-2">
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'form' ? 'preview' : 'form')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all rounded-xl py-1 ${
              mobileTab === 'form'
                ? 'text-purple-700 bg-purple-100/70'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {config.type === 'syllabus' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const nextMode = previewMode === 'poster' ? 'pdf' : 'poster';
                  setPreviewMode(nextMode);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold rounded-xl py-1 transition-all ${
                  previewMode === 'pdf'
                    ? 'text-blue-700 bg-blue-100/70 shadow-2xs'
                    : 'text-purple-700 bg-purple-100/70 shadow-2xs'
                }`}
              >
                {previewMode === 'pdf' ? (
                  <>
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-extrabold">PDF Form</span>
                  </>
                ) : (
                  <>
                    <LayoutTemplate className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 font-extrabold">Poster</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (previewMode === 'pdf') {
                    handleExportSyllabusPdf();
                  } else {
                    handleExportPng();
                  }
                }}
                disabled={isExporting}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-white bg-purple-600 active:bg-purple-700 rounded-xl py-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 active:bg-slate-200 rounded-xl py-1.5 shadow-2xs transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExporting}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-white bg-purple-600 active:bg-purple-700 rounded-xl py-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export PNG</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyData={(data) => {
          setConfig((prev) => ({ ...prev, ...data }));
          showToast('Applied AI generated poster contents!');
        }}
      />

      <SavedPostersModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPosters={savedPosters}
        onLoadPoster={(saved) => {
          setConfig(structuredClone(saved));
          showToast('Loaded saved poster from history!');
        }}
        onDeletePoster={handleDeletePoster}
        onClearAll={handleClearAllSaved}
      />
    </div>
  );
}
