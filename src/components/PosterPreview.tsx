import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PosterConfig } from '../types';
import { PwLogo, PW_OFFICIAL_LOGO_URL } from './PwLogo';
import { SyllabusPdfDocument } from './SyllabusPdfDocument';
import { CanvaTextToolbar } from './CanvaTextToolbar';
import { OFFICIAL_PW_ANNOUNCEMENT_BG } from '../data/announcementTemplateBg';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LayoutTemplate,
  FileText,
  Download,
  FileDown,
  ChevronUp,
  Check,
  Sparkles,
  Move
} from 'lucide-react';

interface PosterPreviewProps {
  config: PosterConfig;
  posterRef: React.RefObject<HTMLDivElement | null>;
  pdfDocRef?: React.RefObject<HTMLDivElement | null>;
  onChange?: (newConfig: Partial<PosterConfig>) => void;
  onDimensionsChange?: (rows: number, cols: number) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onExportPdf?: () => void;
  onExportPng?: () => void;
  onExportSyllabusPdf?: () => void;
  previewMode?: 'poster' | 'pdf';
  onPreviewModeChange?: (mode: 'poster' | 'pdf') => void;
  isExporting?: boolean;
}

const Megaphone3D: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(-8px 12px 20px rgba(0,0,0,0.45))' }}
  >
    <defs>
      <linearGradient id="bodyGrad" x1="60" y1="40" x2="160" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor="#f8fafc" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="mouthGrad" x1="50" y1="60" x2="80" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="redCoreGrad" x1="50" y1="80" x2="85" y2="115" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="handleGrad" x1="130" y1="130" x2="160" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="rimGrad" x1="45" y1="50" x2="65" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>
    </defs>

    <g transform="translate(10, 15) rotate(18 120 120)">
      {/* Handle Joint Mount & Grip */}
      <rect x="132" y="125" width="22" height="70" rx="11" fill="url(#handleGrad)" transform="rotate(18 143 125)" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="136" y="135" width="14" height="24" rx="4" fill="#94a3b8" opacity="0.4" transform="rotate(18 143 125)" />
      
      {/* Base Back Cap (Dark slate) */}
      <ellipse cx="160" cy="100" rx="14" ry="28" fill="#0f172a" />
      <path d="M158 72 L172 78 A 14 22 0 0 1 172 122 L158 128 Z" fill="#1e293b" />
      
      {/* Main Conical Horn Body */}
      <path d="M56 42 L160 74 L160 126 L56 158 Z" fill="url(#bodyGrad)" />
      {/* Top Highlighting Stripe on Horn */}
      <path d="M56 42 L160 74 L160 95 L56 80 Z" fill="#ffffff" opacity="0.75" />
      {/* Bottom Shading Stripe on Horn */}
      <path d="M56 158 L160 126 L160 110 L56 125 Z" fill="#64748b" opacity="0.4" />

      {/* Front Outer Rim Collar (Black) */}
      <ellipse cx="56" cy="100" rx="18" ry="58" fill="url(#rimGrad)" />
      <ellipse cx="58" cy="100" rx="14" ry="54" fill="#334155" />
      
      {/* Deep Inner Speaker Well (Black cavity) */}
      <ellipse cx="60" cy="100" rx="11" ry="48" fill="url(#mouthGrad)" />

      {/* Center Sound Wave Cone (Vibrant Red Core) */}
      <path d="M62 76 L90 94 L90 106 L62 124 Z" fill="url(#redCoreGrad)" />
      <ellipse cx="62" cy="100" rx="5.5" ry="24" fill="#ef4444" />
      <ellipse cx="90" cy="100" rx="3.5" ry="8" fill="#7f1d1d" />

      {/* Subtle Sparkle / Highlight Dot */}
      <circle cx="56" cy="52" r="3" fill="#ffffff" opacity="0.9" />
    </g>
  </svg>
);

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  config,
  posterRef,
  pdfDocRef,
  onChange,
  onDimensionsChange,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onExportPdf,
  onExportPng,
  onExportSyllabusPdf,
  previewMode: controlledPreviewMode,
  onPreviewModeChange,
  isExporting = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalPreviewMode, setInternalPreviewMode] = useState<'poster' | 'pdf'>('poster');
  const previewMode = controlledPreviewMode !== undefined ? controlledPreviewMode : internalPreviewMode;

  const setPreviewMode = (mode: 'poster' | 'pdf') => {
    setInternalPreviewMode(mode);
    if (onPreviewModeChange) onPreviewModeChange(mode);
  };
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [activeCanvasElement, setActiveCanvasElement] = useState<'batchName' | 'title' | 'date' | 'tableHeader' | 'tableCell' | 'all'>('all');
  const [selectedCell, setSelectedCell] = useState<{ rIdx: number; cIdx: number } | null>(null);
  const [scale, setScale] = useState(0.5);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const [isDraggingBadge, setIsDraggingBadge] = useState(false);
  const dragStartRef = useRef<{ startPointerX: number; startPointerY: number; initBadgeX: number; initBadgeY: number }>({
    startPointerX: 0,
    startPointerY: 0,
    initBadgeX: 4.5,
    initBadgeY: 84
  });

  // Handle clicking outside zoom presets menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(event.target as Node)) {
        setIsZoomMenuOpen(false);
      }
    };
    if (isZoomMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isZoomMenuOpen]);

  // Deselect active element and active cell on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCell(null);
        setActiveCanvasElement('all');
        setEditingElement(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const padding = 48;
      const parentWidth = containerRef.current.clientWidth - padding;
      const availableHeight = window.innerHeight - (previewMode === 'pdf' ? 240 : 190);

      if (parentWidth > 0 && availableHeight > 0) {
        const targetW = previewMode === 'pdf' ? 794 : posterWidth;
        const targetH = previewMode === 'pdf' ? 1123 : posterHeight;
        const scaleWidth = parentWidth / targetW;
        const scaleHeight = availableHeight / targetH;
        const calculatedScale = Math.min(Math.max(Math.min(scaleWidth, scaleHeight), 0.15), 1.0);
        setScale(calculatedScale);
      }
    }
  };

  // Pointer Drag Handlers for the Dynamic Yellow Movable Badge
  const handleBadgePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If user clicked inside the contentEditable text, let them focus text unless dragging header/handle
    const target = e.target as HTMLElement;
    if (target.isContentEditable && target.tagName.toLowerCase() === 'span') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const isBottomLeft = config.badgeLayoutMode === 'bottom-left' || !config.badgeLayoutMode;
    const currX = config.badgeX !== undefined ? config.badgeX
      : isBottomLeft ? 4.5
      : config.badgeLayoutMode === 'bottom-right' ? 62
      : config.badgeLayoutMode === 'bottom-center' ? 36
      : config.badgeLayoutMode === 'top-left' ? 4.5
      : config.badgeLayoutMode === 'top-right' ? 60
      : 4.5;
    const currY = config.badgeY !== undefined ? config.badgeY
      : config.badgeLayoutMode === 'top-left' || config.badgeLayoutMode === 'top-right' ? 12
      : 84;

    dragStartRef.current = {
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      initBadgeX: currX,
      initBadgeY: currY
    };

    setIsDraggingBadge(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleBadgePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingBadge || !onChange) return;
    e.preventDefault();

    const deltaPixelX = (e.clientX - dragStartRef.current.startPointerX) / scale;
    const deltaPixelY = (e.clientY - dragStartRef.current.startPointerY) / scale;

    const posterW = config.type === 'announcement' ? 1000 : 1280;
    const posterH = config.type === 'announcement' ? 375 : 720;

    const deltaPctX = (deltaPixelX / posterW) * 100;
    const deltaPctY = (deltaPixelY / posterH) * 100;

    const newX = Math.max(0, Math.min(88, dragStartRef.current.initBadgeX + deltaPctX));
    const newY = Math.max(0, Math.min(90, dragStartRef.current.initBadgeY + deltaPctY));

    onChange({
      badgeX: Math.round(newX * 10) / 10,
      badgeY: Math.round(newY * 10) / 10,
      badgeLayoutMode: 'free-drag'
    });
  };

  const handleBadgePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingBadge) {
      setIsDraggingBadge(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };


  // Poster dimensions: 1024x384 for Official Announcement Banner, 1280x720 for Syllabus/Timetable, 794x1123 for A4 PDF
  const posterWidth = previewMode === 'pdf' ? 794 : config.type === 'announcement' ? 1024 : 1280;
  const posterHeight = previewMode === 'pdf' ? 1123 : config.type === 'announcement' ? 384 : 720;
  const isLongFormat = config.type === 'syllabus' && config.syllabusType === 'Long';

  // Synchronize preview mode when poster type changes
  useEffect(() => {
    if (config.type === 'announcement' || config.type === 'timetable') {
      setPreviewMode('poster');
    }
  }, [config.type]);

  // Auto calculate scale on window resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Find the visible window height and container bounds to ensure full visibility
        const padding = 32; // 16px on each side
        const parentWidth = containerRef.current.clientWidth - padding;
        
        // Calculate max available height in the viewport for the canvas
        // (subtracting header and floating control bar padding)
        const availableHeight = window.innerHeight - (previewMode === 'pdf' ? 240 : 190);
        
        if (parentWidth > 0 && availableHeight > 0) {
          // Fit poster 100% inside parent container width OR available height, whichever is more constrained
          const scaleWidth = parentWidth / posterWidth;
          const scaleHeight = availableHeight / posterHeight;
          
          // Use the smaller scale to ensure it fits entirely on the screen without scrolling
          const calculatedScale = Math.min(Math.max(Math.min(scaleWidth, scaleHeight), 0.15), 1.0);
          
          setScale(calculatedScale);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [posterWidth, posterHeight, isSidebarCollapsed, previewMode]);

  // Date display logic
  const getDateDisplay = () => {
    if (config.startDate && config.endDate) {
      return `${config.startDate} - ${config.endDate}`;
    }
    return config.startDate || config.endDate || '';
  };

  const dateText = getDateDisplay();

  // Logo Image Resolution Logic
  const getLogoUrl = () => {
    const mode = config.logoStyleMode || 'pw-official-img';
    switch (mode) {
      case 'custom':
        return config.customLogoUrl || PW_OFFICIAL_LOGO_URL;
      case 'pw-official-img':
      case 'pw-svg':
      default:
        return PW_OFFICIAL_LOGO_URL;
    }
  };

  const logoUrl = getLogoUrl();

  const isMaroon = config.theme === 'maroon-pw';

  // Helper to clean pasted / edited cell text and remove unwanted leading/trailing/multiple blank lines & corrupted placeholders
  const cleanCellText = (raw: string): string => {
    if (!raw) return '';
    let text = raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/^\s*\n+/, '')
      .replace(/\n+\s*$/, '')
      .replace(/\n{2,}/g, '\n')
      .trim();
    return text;
  };

  const handleCellCanvasBlur = (rIdx: number, cIdx: number, newContent: string) => {
    if (!onChange) return;
    const cleaned = cleanCellText(newContent);
    const updated = (config.tableData || []).map((row, r) => {
      if (r !== rIdx) return [...row];
      const paddedRow = [...row];
      while (paddedRow.length <= cIdx) paddedRow.push('');
      return paddedRow.map((cell, c) => (c === cIdx ? cleaned : cell));
    });
    onChange({ tableData: updated });
  };

  // Dynamic cell font size to prevent rows from overflowing while keeping text clear, large, balanced and readable
  const getCellDynamicFontSize = (text: string, rowCount: number, isCol0 = false, isHeader = false) => {
    const globalScale = config.globalFontScale !== undefined ? config.globalFontScale : 1.0;

    if ((isHeader || isCol0) && config.tableHeaderFontSize !== undefined) {
      return `${config.tableHeaderFontSize * globalScale}px`;
    }

    if (!isHeader && !isCol0 && config.tableCellFontSize !== undefined) {
      return `${config.tableCellFontSize * globalScale}px`;
    }

    // Default sizes: Subject = 22px (Heading), Topic = 17px (Content)
    const baseSize = (isCol0 || isHeader) ? 22 : 17;
    return `${baseSize * globalScale}px`;
  };

  // Helper function for smart announcement font scaling with user custom overrides
  const getAnnouncementStyle = (text: string) => {
    const len = text ? text.trim().length : 0;
    
    // Smart auto-font scaling calibrated to fill canvas space properly without becoming unnecessarily small
    let defaultFontSize = 26;
    let defaultLineHeight = 1.34;
    let defaultBadgeSize = 14;
    let defaultBadgePadding = '5.5px 18px';

    if (len <= 90) {
      defaultFontSize = 32;
      defaultLineHeight = 1.32;
      defaultBadgeSize = 15;
      defaultBadgePadding = '6px 20px';
    } else if (len <= 180) {
      defaultFontSize = 28;
      defaultLineHeight = 1.32;
      defaultBadgeSize = 14.5;
      defaultBadgePadding = '6px 20px';
    } else if (len <= 280) {
      defaultFontSize = 25;
      defaultLineHeight = 1.34;
      defaultBadgeSize = 14;
      defaultBadgePadding = '5.5px 18px';
    } else if (len <= 400) {
      defaultFontSize = 22;
      defaultLineHeight = 1.32;
      defaultBadgeSize = 13.5;
      defaultBadgePadding = '5px 18px';
    } else if (len <= 550) {
      defaultFontSize = 19;
      defaultLineHeight = 1.30;
      defaultBadgeSize = 13;
      defaultBadgePadding = '4.5px 16px';
    } else {
      defaultFontSize = 16.5;
      defaultLineHeight = 1.26;
      defaultBadgeSize = 12;
      defaultBadgePadding = '4px 14px';
    }

    // Support both announcementFontSize and titleFontSize for explicit user overrides
    const explicitFontSize = config.announcementFontSize || config.titleFontSize;
    const fontSize = explicitFontSize && explicitFontSize > 0 
      ? explicitFontSize 
      : defaultFontSize;

    const lineHeight = config.announcementLineHeight && config.announcementLineHeight > 0 
      ? config.announcementLineHeight 
      : defaultLineHeight;

    const rawWeight = config.announcementFontWeight || config.titleFontWeight || '500';
    let numericWeight: number = 500;
    if (rawWeight === 'normal' || rawWeight === '400') numericWeight = 400;
    else if (rawWeight === 'medium' || rawWeight === '500') numericWeight = 500;
    else if (rawWeight === 'semibold' || rawWeight === '600') numericWeight = 600;
    else if (rawWeight === 'bold' || rawWeight === '700') numericWeight = 700;
    else if (rawWeight === 'extrabold' || rawWeight === '800') numericWeight = 800;
    else if (rawWeight === '900') numericWeight = 900;
    else if (!isNaN(Number(rawWeight))) numericWeight = Number(rawWeight);

    const fontWeight = numericWeight;
    const textAlign = config.announcementTextAlign || 'left';
    const verticalAlign = config.announcementVerticalAlign || 'top';
    const badgeLayoutMode = config.badgeLayoutMode || 'bottom-left';
    const badgeGap = config.badgeGap !== undefined ? config.badgeGap : 16;
    
    // Override badge with dateFontSize if set
    const badgeFontSizeOverride = config.dateFontSize || defaultBadgeSize;

    return {
      fontSize: `${fontSize * (config.globalFontScale || 1.0)}px`,
      lineHeight: `${lineHeight}`,
      fontWeight,
      textAlign,
      verticalAlign,
      badgeLayoutMode,
      badgeGap,
      badgeFontSize: `${badgeFontSizeOverride * (config.globalFontScale || 1.0)}px`,
      badgePadding: defaultBadgePadding
    };
  };

  // Theme Background Style Resolver
  const getPosterBgStyle = (): React.CSSProperties => {
    if (config.customBgUrl) {
      return {
        backgroundImage: `url("${config.customBgUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: config.type === 'announcement' ? '#074836' : '#2b0d18'
      };
    }

    if (config.type === 'announcement') {
      return {
        backgroundColor: '#074836',
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1.5px, transparent 1.5px, transparent 9px),
          linear-gradient(135deg, #095942 0%, #054836 45%, #023627 100%)
        `,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    switch (config.theme) {
      case 'maroon-pw':
        return {
          backgroundColor: '#2b0d18',
          backgroundImage: 'linear-gradient(135deg, #4a1426 0%, #2b0d18 50%, #17040b 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'navy-pw':
        return {
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'dark-slate':
        return {
          backgroundColor: '#18181b',
          backgroundImage: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'emerald-pw':
        return {
          backgroundColor: '#064e3b',
          backgroundImage: 'linear-gradient(135deg, #047857 0%, #064e3b 50%, #022c22 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'vibrant-gold':
        return {
          backgroundColor: '#78350f',
          backgroundImage: 'linear-gradient(135deg, #b45309 0%, #78350f 50%, #451a03 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'purple-pw':
      default:
        return {
          backgroundColor: '#350769',
          backgroundImage: 'linear-gradient(135deg, #5d17a3 0%, #340766 50%, #1d013b 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative group bg-[#f3f4f6]">
      {/* CANVA DOCKED TYPOGRAPHY TOOLBAR */}
      <div 
        className="sticky top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 shadow-sm shrink-0"
      >
        <CanvaTextToolbar
          config={config}
          onChange={onChange || (() => {})}
          activeElement={activeCanvasElement}
          selectedCell={selectedCell}
          previewMode={previewMode}
          onSelectActiveElement={(elem) => {
            if (elem !== 'tableCell' && elem !== 'tableHeader') {
              setSelectedCell(null);
            }
            setActiveCanvasElement(elem);
          }}
        />
      </div>

      {/* Main Preview Workspace Container */}
      <div
        ref={containerRef}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            !target.closest('.pw-cell-text') &&
            !target.closest('.pw-header-text') &&
            !target.closest('.pw-subheader-text') &&
            !target.closest('.pw-poster-date-badge') &&
            !target.closest('.pw-announcement-text') &&
            !target.closest('.pw-announcement-badge-text') &&
            !target.closest('.pw-announcement-tag') &&
            !target.closest('[contenteditable="true"]') &&
            !target.closest('button') &&
            !target.closest('input') &&
            !target.closest('select') &&
            !target.closest('textarea')
          ) {
            setSelectedCell(null);
            setActiveCanvasElement('all');
            setEditingElement(null);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }
        }}
        className="flex-1 w-full overflow-hidden flex items-center justify-center px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-28 rounded-2xl min-h-[320px] sm:min-h-[420px]"
      >
        {previewMode === 'pdf' ? (
          <div
            style={{
              width: `${794 * scale}px`,
              height: `${1123 * scale}px`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out'
            }}
            className="relative shrink-0 flex items-center justify-center"
          >
            <div className="absolute top-0 left-0">
              <SyllabusPdfDocument
                config={config}
                pdfDocRef={pdfDocRef}
                onChange={onChange}
                scale={scale}
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
                onSelectActiveElement={setActiveCanvasElement}
                isExporting={isExporting}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              width: `${posterWidth * scale}px`,
              height: `${posterHeight * scale}px`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out'
            }}
            className="relative shrink-0 flex items-center justify-center"
          >
            {previewMode === 'poster' && (
              <div
                style={{
                  position: 'fixed',
                  top: '-9999px',
                  left: '-9999px',
                  opacity: 1,
                  pointerEvents: 'none',
                  zIndex: -999
                }}
              >
                <SyllabusPdfDocument config={config} pdfDocRef={pdfDocRef} onChange={onChange} scale={1} isExporting={isExporting} />
              </div>
            )}

            {/* Unscaled poster element transformed visually */}
            <div
              ref={posterRef}
              id="pw-poster-root"
              data-width={posterWidth}
              data-height={posterHeight}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('pw-poster-root-bg')) {
                   // When clicking background, reset active element
                   setActiveCanvasElement('all');
                   setEditingElement(null);
                }
              }}
              style={{
                width: `${posterWidth}px`,
                height: `${posterHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                fontFamily: "'Poppins', sans-serif",
                ...getPosterBgStyle()
              }}
              className="absolute top-0 left-0 text-white flex flex-col justify-start items-stretch overflow-hidden shadow-2xl selection:bg-none"
            >
            {config.type === 'announcement' ? (() => {
              const rawText = config.announcementText || 'ENTER YOUR ANNOUNCEMENT DETAILS HERE. LIVE CLASSES, BATCH UPDATES, OR IMPORTANT EXAM NOTICES.';
              const annText = rawText.toUpperCase();
              const styleSpec = getAnnouncementStyle(annText);
              const topicTag = config.batchName ? config.batchName.trim().toUpperCase() : '';
              const badgeText = config.announcementBadge ? config.announcementBadge.trim().toUpperCase() : '';

              const fontWtClass = parseInt(String(styleSpec.fontWeight)) >= 800
                ? 'font-extrabold'
                : parseInt(String(styleSpec.fontWeight)) >= 600
                ? 'font-semibold'
                : parseInt(String(styleSpec.fontWeight)) <= 400
                ? 'font-normal'
                : 'font-bold';

              const customBg = config.bgStyleMode === 'custom' && config.customBgUrl ? config.customBgUrl : null;
              const bgImg = customBg || OFFICIAL_PW_ANNOUNCEMENT_BG;

              return (
                <div className="relative w-full h-full overflow-hidden border-[5px] border-white box-border pointer-events-auto">
                  {/* 1. Official High-Resolution Announcement Template Background */}
                  <img
                    src={bgImg}
                    alt="Official PW Announcement Template"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                  />

                  {/* 2. Custom Uploaded Logo (Only if user uploaded custom logo) */}
                  {config.showLogo && config.logoStyleMode === 'custom' && config.customLogoUrl && (
                    <div className="pw-poster-logo absolute right-8 top-6 z-30 flex items-center justify-center bg-white rounded-full shadow-md">
                      <PwLogo size={66} src={logoUrl} />
                    </div>
                  )}

                  {/* 3. Main Text Content Area (Vertically Balanced with Dynamic Flowing Badge) */}
                  <div
                    className="absolute left-[44px] top-0 bottom-0 z-20 flex flex-col justify-center items-start max-w-[650px] pointer-events-auto select-text"
                  >
                    {/* Optional Topic Tag */}
                    {topicTag.length > 0 && (
                      <div className="shrink-0 mb-2.5">
                        <span
                          contentEditable={!!onChange}
                          spellCheck={false}
                          suppressContentEditableWarning
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCell(null);
                            setActiveCanvasElement('batchName');
                            setEditingElement('batchName');
                          }}
                          onFocus={(e) => {
                            e.stopPropagation();
                            setSelectedCell(null);
                            setActiveCanvasElement('batchName');
                          }}
                          onBlur={(e) => {
                            if (onChange) onChange({ batchName: e.currentTarget.innerText.trim().toUpperCase() });
                            setEditingElement(null);
                          }}
                          className={`pw-announcement-tag inline-block bg-white/20 backdrop-blur-md text-yellow-300 border border-yellow-300/50 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-md outline-none cursor-text shadow-sm select-text ${
                            !isExporting ? 'focus:ring-2 focus:ring-yellow-400 hover:ring-1 hover:ring-yellow-300' : ''
                          }`}
                          title="Click to edit topic tag"
                        >
                          {topicTag}
                        </span>
                      </div>
                    )}

                    {/* Direct Main Announcement Message (Click to Edit Directly on Canvas) */}
                    <p
                      contentEditable={!isExporting && !!onChange}
                      spellCheck={false}
                      suppressContentEditableWarning
                      data-placeholder="ENTER NOTICE MESSAGE HERE..."
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCell(null);
                        setActiveCanvasElement('title');
                        setEditingElement('title');
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        setSelectedCell(null);
                        setActiveCanvasElement('title');
                      }}
                      onBlur={(e) => {
                        if (onChange) onChange({ announcementText: e.currentTarget.innerText.trim() });
                        setEditingElement(null);
                      }}
                      style={{
                        fontSize: styleSpec.fontSize,
                        lineHeight: styleSpec.lineHeight,
                        fontWeight: styleSpec.fontWeight,
                        textAlign: (config.announcementTextAlign || config.tableCellAlign || styleSpec.textAlign) as any,
                        color: config.titleTextColor || '#ffffff',
                        fontFamily: config.fontFamily || "'Montserrat', 'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '0.005em',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                      className={`pw-announcement-text text-white uppercase outline-none rounded px-2 py-1 cursor-text transition-all duration-150 drop-shadow-md empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 select-text whitespace-pre-wrap break-words ${
                        !isExporting ? 'focus:ring-2 focus:ring-[#ffd200] focus:bg-black/25 hover:ring-1 hover:ring-white/40' : ''
                      }`}
                      title="Click to edit announcement text directly on canvas"
                    >
                      {annText}
                    </p>

                    {/* Dynamic Yellow Pill Badge (Directly editable on canvas) */}
                    {(badgeText || '').trim().length > 0 && (
                      <div className="shrink-0 mt-3.5 sm:mt-4">
                        <div
                          style={{
                            backgroundColor: config.badgeBgColor || '#ffd200',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                            borderRadius: '9999px',
                            padding: config.badgePadding || '5.5px 18px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '32px'
                          }}
                          className="relative group cursor-pointer hover:shadow-lg transition-all"
                        >
                          <span
                            contentEditable={!isExporting && !!onChange}
                            spellCheck={false}
                            suppressContentEditableWarning
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCell(null);
                              setActiveCanvasElement('date');
                              setEditingElement('date');
                            }}
                            onFocus={(e) => {
                              e.stopPropagation();
                              setSelectedCell(null);
                              setActiveCanvasElement('date');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.preventDefault();
                            }}
                            onBlur={(e) => {
                              if (onChange) onChange({ announcementBadge: e.currentTarget.innerText.trim() });
                              setEditingElement(null);
                            }}
                            style={{
                              color: config.badgeTextColor || '#000000',
                              fontSize: `${config.badgeFontSize || 14}px`,
                              fontWeight: '800',
                              letterSpacing: '0.2px',
                              lineHeight: '1',
                              fontFamily: config.fontFamily || "'Montserrat', 'Plus Jakarta Sans', sans-serif"
                            }}
                            className={`pw-announcement-badge-text outline-none cursor-text text-center font-bold px-2 py-0.5 rounded select-text ${
                              !isExporting ? 'focus:ring-2 focus:ring-emerald-700 hover:ring-1 hover:ring-black/30' : ''
                            }`}
                            title="Click to edit pill badge text directly on canvas"
                          >
                            {badgeText}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="w-full h-full px-6 pt-5 pb-5 flex flex-col justify-start items-center">
                {/* Geometric Overlay Lines (Subtle diagonal dot grid) */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23ffffff'/%3E%3C/svg%3E")`
                  }}
                />

            {/* TOP HEADER SECTION */}
            <div
              className="pw-poster-header relative z-10 flex flex-col items-center justify-center text-center w-full min-h-[110px] pt-3 pb-1 mb-2 shrink-0"
            >
              {/* Single Logo Top Left - Official PW Monogram Badge */}
              {config.showLogo && (
                <div className="pw-poster-logo absolute left-8 top-3 z-20 flex items-center justify-center">
                  <PwLogo size={64} src={logoUrl} />
                </div>
              )}

              {/* Batch Name Header (Optional - only rendered if provided) */}
              <motion.div
                drag
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  if (onChange) {
                    onChange({
                      batchNameX: (config.batchNameX || 0) + info.offset.x / scale,
                      batchNameY: (config.batchNameY || 0) + info.offset.y / scale
                    });
                  }
                }}
                animate={{ x: config.batchNameX || 0, y: config.batchNameY || 0 }}
                transition={{ type: 'tween', duration: 0 }}
                className="w-full max-w-[1020px] px-4 mx-auto text-center flex justify-center items-center z-20 cursor-move"
                style={{
                  marginBottom: `${config.headerGap !== undefined ? config.headerGap : 5}px`
                }}
              >
                <h1
                  contentEditable={!isExporting && !!onChange}
                  spellCheck={false}
                  suppressContentEditableWarning
                  data-placeholder="ENTER BATCH NAME"
                  onClick={() => { setSelectedCell(null); setActiveCanvasElement('batchName'); setEditingElement('batchName'); }}
                  onFocus={() => { setSelectedCell(null); setActiveCanvasElement('batchName'); }}
                  onBlur={(e) => {
                    if (onChange) {
                      const text = e.currentTarget.innerText.trim();
                      onChange({ batchName: text });
                    }
                    setEditingElement(null);
                  }}
                  className={`uppercase tracking-wider drop-shadow-md outline-none rounded px-2 cursor-text transition-all text-center pw-header-text empty:before:content-[attr(data-placeholder)] empty:before:opacity-35 empty:before:font-extrabold ${
                    !isExporting ? 'focus:ring-2 focus:ring-[#8b3dff] focus:bg-white/10 hover:ring-1 hover:ring-white/50' : ''
                  }`}
                  title="Click to edit batch header directly on canvas"
                  style={{
                    fontFamily: config.fontFamily || "'Montserrat', sans-serif",
                    fontWeight: config.batchNameFontWeight || 800,
                    color: config.batchNameTextColor || '#ffffff',
                    fontSize: `${
                      (config.batchNameFontSize !== undefined
                        ? config.batchNameFontSize
                        : (config.batchName || '').length > 40
                        ? 28
                        : (config.batchName || '').length > 25
                        ? 32
                        : 35) * (config.globalFontScale !== undefined ? config.globalFontScale : 1.0)
                    }px`,
                    lineHeight: '1.25',
                    letterSpacing: '1px'
                  }}
                >
                  {(config.batchName || '').trim() || ''}
                </h1>
              </motion.div>

              {/* Subtitle / Title (Optional - only rendered if entered) */}
              <motion.div
                drag
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  if (onChange) {
                    onChange({
                      titleX: (config.titleX || 0) + info.offset.x / scale,
                      titleY: (config.titleY || 0) + info.offset.y / scale
                    });
                  }
                }}
                animate={{ x: config.titleX || 0, y: config.titleY || 0 }}
                transition={{ type: 'tween', duration: 0 }}
                className="w-full max-w-[1020px] px-4 mx-auto text-center flex justify-center items-center z-20 cursor-move"
                style={{
                  marginBottom: `${config.headerGap !== undefined ? config.headerGap : 5}px`
                }}
              >
                <div
                  contentEditable={!isExporting && !!onChange}
                  spellCheck={false}
                  suppressContentEditableWarning
                  data-placeholder="ENTER TITLE / SCHEDULE DETAILS"
                  onClick={() => { setSelectedCell(null); setActiveCanvasElement('title'); setEditingElement('title'); }}
                  onFocus={() => { setSelectedCell(null); setActiveCanvasElement('title'); }}
                  onBlur={(e) => {
                    if (onChange) {
                      const text = e.currentTarget.innerText.trim();
                      onChange({ title: text });
                    }
                    setEditingElement(null);
                  }}
                  className={`tracking-wider drop-shadow-md outline-none rounded px-2 cursor-text transition-all text-center uppercase pw-subheader-text empty:before:content-[attr(data-placeholder)] empty:before:opacity-35 empty:before:font-bold ${
                    !isExporting ? 'focus:ring-2 focus:ring-[#8b3dff] focus:bg-white/10 hover:ring-1 hover:ring-white/50' : ''
                  }`}
                  title="Click to edit subtitle directly on canvas"
                  style={{
                    fontFamily: config.fontFamily || "'Montserrat', sans-serif",
                    fontWeight: config.titleFontWeight || 700,
                    color: config.titleTextColor || '#ffffff',
                    fontSize: `${
                      (config.titleFontSize !== undefined
                        ? config.titleFontSize
                        : (config.title || '').trim().length > 45
                        ? 19
                        : 22) * (config.globalFontScale !== undefined ? config.globalFontScale : 1.0)
                    }px`,
                    letterSpacing: '0.8px',
                    lineHeight: '1.25'
                  }}
                >
                  {(config.title || '').trim() || ''}
                </div>
              </motion.div>

              {/* Yellow Date Badge Pill - Positioned cleanly and perfectly centered date text */}
              {dateText && (
                <motion.div
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    if (onChange) {
                      onChange({
                        dateX: (config.dateX || 0) + info.offset.x / scale,
                        dateY: (config.dateY || 0) + info.offset.y / scale
                      });
                    }
                  }}
                  animate={{ x: config.dateX || 0, y: config.dateY || 0 }}
                  transition={{ type: 'tween', duration: 0 }}
                  className="pw-poster-date-badge relative flex items-center justify-center mx-auto text-center z-10 w-full cursor-move"
                  style={{ marginTop: '5px', marginBottom: '5px' }}
                >
                  <div
                    style={{
                      backgroundColor: config.dateBadgeBgColor || '#fcec24',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                      borderRadius: '9999px',
                      padding: '0 20px',
                      height: '29px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      overflow: 'hidden'
                    }}
                    className="shadow-sm border border-yellow-300"
                  >
                    <span
                      spellCheck={false}
                      onClick={() => { setSelectedCell(null); setActiveCanvasElement('date'); setEditingElement('date'); }}
                      onFocus={() => { setSelectedCell(null); setActiveCanvasElement('date'); }}
                      style={{
                        color: config.dateBadgeTextColor || '#991b1b',
                        fontFamily: config.fontFamily || "'Montserrat', sans-serif",
                        fontSize: `${
                          (config.dateFontSize !== undefined ? config.dateFontSize : 14.5) *
                          (config.globalFontScale !== undefined ? config.globalFontScale : 1.0)
                        }px`,
                        fontWeight: config.dateBadgeFontWeight || '900',
                        letterSpacing: '0.6px',
                        lineHeight: '1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        margin: '0 auto',
                        padding: '0'
                      }}
                      className="uppercase outline-none focus:ring-2 focus:ring-[#8b3dff] focus:ring-offset-1 rounded cursor-text whitespace-nowrap text-center px-1"
                      title="Click to edit date directly on canvas"
                    >
                      {dateText}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* CENTER TABLE CONTAINER - Centered vertically with balanced top and bottom gaps */}
            <motion.div 
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => {
                if (onChange) {
                  onChange({
                    tableX: (config.tableX || 0) + info.offset.x / scale,
                    tableY: (config.tableY || 0) + info.offset.y / scale
                  });
                }
              }}
              animate={{ x: config.tableX || 0, y: config.tableY || 0 }}
              transition={{ type: 'tween', duration: 0 }}
              className="pw-poster-table-container relative z-10 w-full flex-1 flex flex-col items-center justify-center overflow-hidden mt-2 mb-2 cursor-move"
            >
              <div
                style={{
                  backgroundColor: isMaroon ? '#230a13' : '#ffffff',
                  borderColor: isMaroon ? '#f5d061' : '#000000',
                  width: '98%',
                  maxWidth: '1228px',
                  height: '100%',
                  margin: '0 auto'
                }}
                className="pw-poster-table-card rounded-md shadow-xl border-[2px] overflow-hidden text-center flex flex-col justify-stretch"
              >
                <table className="w-full h-full border-collapse" style={{ tableLayout: 'fixed', height: '100%' }}>
                  <tbody style={{ height: '100%' }}>
                    {(() => {
                      const paddedData = [...config.tableData];
                      while (paddedData.length < config.numRows) {
                        paddedData.push(Array(config.numCols).fill(''));
                      }
                      return paddedData.slice(0, config.numRows).map((row, rIdx) => {
                        const paddedRow = [...row];
                        while (paddedRow.length < config.numCols) {
                          paddedRow.push('');
                        }
                        const isHeaderRow = config.type === 'timetable' && rIdx === 0;
                        const rowCount = config.numRows;

                        return (
                          <tr
                            key={rIdx}
                            style={{
                              height: `${100 / rowCount}%`,
                              maxHeight: `${100 / rowCount}%`,
                              backgroundColor: isMaroon
                                ? '#230a13'
                                : isHeaderRow && config.type === 'timetable'
                                ? '#f8fafc'
                                : '#ffffff'
                            }}
                          >
                            {paddedRow.slice(0, config.numCols).map((rawCellText, cIdx) => {
                              const cellText = cleanCellText(rawCellText);
                              const isLeftCol = cIdx === 0;
                              const isGoldText = isMaroon && (isHeaderRow || isLeftCol);
                              const cellFontSize = getCellDynamicFontSize(cellText, rowCount, isLeftCol, isHeaderRow);
                              const placeholderText =
                                config.type === 'timetable'
                                    ? rIdx === 0 && cIdx === 0
                                      ? 'DAYS'
                                      : cIdx === 0
                                      ? 'DAY'
                                      : 'Time / Subject'
                                    : cIdx === 0
                                    ? 'Subject'
                                    : 'Topics';

                              const cellKey = `${rIdx}-${cIdx}`;
                              const cellStyle = config.cellStyles?.[cellKey];
                              const isCellSelected = !isExporting && selectedCell?.rIdx === rIdx && selectedCell?.cIdx === cIdx;

                              const finalCellFontSize = cellStyle?.fontSize !== undefined
                                ? `${cellStyle.fontSize * (config.globalFontScale || 1.0)}px`
                                : cellFontSize;

                              const finalCellColor = cellStyle?.color || (
                                isMaroon
                                  ? isGoldText
                                    ? '#f5d061'
                                    : '#ffffff'
                                  : isHeaderRow || isLeftCol
                                  ? (config.tableHeaderTextColor || '#020617')
                                  : (config.tableCellTextColor || '#0f172a')
                              );

                              const finalCellFontWeight = cellStyle?.fontWeight
                                ? parseInt(cellStyle.fontWeight, 10)
                                : isHeaderRow || isLeftCol
                                ? (config.tableHeaderFontWeight ? parseInt(String(config.tableHeaderFontWeight), 10) : 800)
                                : (config.tableCellFontWeight ? parseInt(String(config.tableCellFontWeight), 10) : 600);

                              const finalCellFontFamily = cellStyle?.fontFamily || config.fontFamily || "'Montserrat', sans-serif";
                              const finalCellAlign = cellStyle?.textAlign || (isLeftCol ? 'center' : (config.tableCellAlign || 'center'));

                              return (
                                <td
                                  key={cIdx}
                                  style={{
                                    padding: '6px 14px',
                                    height: `${100 / rowCount}%`,
                                    border: isMaroon ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid #000000',
                                    textAlign: finalCellAlign,
                                    verticalAlign: 'middle',
                                    color: finalCellColor,
                                    fontWeight: finalCellFontWeight,
                                    fontFamily: finalCellFontFamily,
                                    width:
                                      config.type === 'syllabus'
                                        ? (isLeftCol ? `${config.tableCol0WidthPercent || 28}%` : `${(100 - (config.tableCol0WidthPercent || 28)) / (config.numCols - 1)}%`)
                                        : `${100 / config.numCols}%`,
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  {/* Direct Canvas Editable Cell */}
                                  <div
                                    contentEditable={!isExporting && !!onChange}
                                    spellCheck={false}
                                    suppressContentEditableWarning
                                    data-placeholder={placeholderText}
                                    onClick={() => {
                                      setSelectedCell({ rIdx, cIdx });
                                      setActiveCanvasElement(isHeaderRow || isLeftCol ? 'tableHeader' : 'tableCell');
                                      setEditingElement(isHeaderRow || isLeftCol ? 'tableHeader' : 'tableCell');
                                    }}
                                    onFocus={() => {
                                      setSelectedCell({ rIdx, cIdx });
                                      setActiveCanvasElement(isHeaderRow || isLeftCol ? 'tableHeader' : 'tableCell');
                                    }}
                                    onPaste={(e) => {
                                      e.preventDefault();
                                      const text = e.clipboardData.getData('text/plain') || '';
                                      const cleaned = cleanCellText(text);
                                      document.execCommand('insertText', false, cleaned);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        document.execCommand('insertText', false, '\n');
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleCellCanvasBlur(rIdx, cIdx, e.currentTarget.innerText);
                                      setEditingElement(null);
                                    }}
                                    style={{
                                      position: 'relative',
                                      fontSize: finalCellFontSize,
                                      lineHeight: '1.4',
                                      wordBreak: 'break-word',
                                      overflowWrap: 'anywhere',
                                      fontFamily: finalCellFontFamily,
                                      fontWeight: finalCellFontWeight,
                                      color: finalCellColor,
                                      textAlign: finalCellAlign
                                    }}
                                    className={`pw-cell-text whitespace-pre-line outline-none rounded cursor-text transition-all px-2.5 py-1 w-full block empty:before:content-[attr(data-placeholder)] empty:before:opacity-35 empty:before:italic empty:before:font-normal empty:before:text-sm empty:before:pointer-events-none ${
                                      isExporting
                                        ? ''
                                        : isCellSelected
                                        ? 'ring-2 ring-[#8b3dff] bg-purple-50/80 shadow-xs'
                                        : isMaroon
                                        ? 'hover:ring-1 hover:ring-white/30 focus:ring-2 focus:ring-[#8b3dff] focus:bg-white/10'
                                        : 'hover:ring-1 hover:ring-[#8b3dff]/30 focus:ring-2 focus:ring-[#8b3dff] focus:bg-purple-50/80'
                                    }`}
                                    title="Click to edit text and customize this specific cell font, size & color in top toolbar"
                                  >
                                    {cellText || ''}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Modern Glassmorphism Control Dock (Desktop / Tablet - Centered Directly on Canvas) */}
      <div
        style={{
          left: isSidebarCollapsed ? 'calc(50% + 36px)' : 'calc(50% + 211px)',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="fixed bottom-4 -translate-x-1/2 z-30 hidden md:flex items-center justify-center pointer-events-auto"
      >
        {/* Main Dock Container - Frosted Semi-Transparent Glass */}
        <div className="flex items-center bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-1.5 gap-1.5 transition-all duration-200">
          {/* Segmented View Mode Toggle (Exclusive to Syllabus) */}
          {config.type === 'syllabus' && (
            <>
              <div className="flex items-center bg-slate-100/75 backdrop-blur-sm p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('poster')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewMode === 'poster'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="Switch to Interactive Canvas Poster View"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Poster</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode('pdf')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewMode === 'pdf'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="Switch to Official PW Syllabus A4 PDF View"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Form</span>
                  <span
                    className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                      previewMode === 'pdf'
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    A4
                  </span>
                </button>
              </div>
              <div className="w-px h-5 bg-slate-200 mx-0.5" />
            </>
          )}

          {/* Zoom Controls & Interactive Popover */}
          <div className="flex items-center gap-1 relative" ref={zoomMenuRef}>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(Number((s - 0.05).toFixed(2)), 0.15))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-purple-700 transition-all active:scale-95"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Clickable Percentage Pill that toggles preset menu */}
            <button
              type="button"
              onClick={() => setIsZoomMenuOpen((prev) => !prev)}
              className="px-2.5 py-1 text-xs font-black font-mono text-slate-700 bg-slate-100/90 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all min-w-[50px] text-center flex items-center justify-center gap-0.5"
              title="Click to choose Zoom Preset"
            >
              <span>{Math.round(scale * 100)}%</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${isZoomMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Zoom Presets Popover Menu */}
            {isZoomMenuOpen && (
              <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-1.5 min-w-[110px] z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {[0.5, 0.75, 1.0, 1.25].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    onClick={() => {
                      setScale(presetVal);
                      setIsZoomMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left transition-colors ${
                      Math.round(scale * 100) === Math.round(presetVal * 100)
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{Math.round(presetVal * 100)}%</span>
                    {Math.round(scale * 100) === Math.round(presetVal * 100) && (
                      <Check className="w-3 h-3 text-purple-600" />
                    )}
                  </button>
                ))}
                <div className="w-full h-px bg-slate-100 my-0.5" />
                <button
                  type="button"
                  onClick={() => {
                    handleFitToScreen();
                    setIsZoomMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg text-left transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Fit Screen</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setScale((s) => Math.min(Number((s + 0.05).toFixed(2)), 1.5))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-purple-700 transition-all active:scale-95"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleFitToScreen}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-purple-700 transition-all active:scale-95"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setScale(1.0)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-purple-700 transition-all active:scale-95"
              title="Reset to 100% Actual Size"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5" />

          {/* Quick Action: Export / Download */}
          {config.type === 'syllabus' && previewMode === 'pdf' ? (
            <button
              type="button"
              onClick={() => {
                setSelectedCell(null);
                setActiveCanvasElement('all');
                setEditingElement(null);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                setTimeout(() => {
                  if (onExportSyllabusPdf) onExportSyllabusPdf();
                  else if (onExportPdf) onExportPdf();
                }, 40);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Export Official PW Syllabus PDF Document"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCell(null);
                  setActiveCanvasElement('all');
                  setEditingElement(null);
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  setTimeout(() => {
                    if (onExportPng) onExportPng();
                  }, 40);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Export High-Resolution PNG Image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCell(null);
                  setActiveCanvasElement('all');
                  setEditingElement(null);
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  setTimeout(() => {
                    if (onExportPdf) onExportPdf();
                  }, 40);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Export Poster directly as PDF Document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

