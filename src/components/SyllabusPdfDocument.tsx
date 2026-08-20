import React from 'react';
import { PosterConfig } from '../types';
import { OFFICIAL_PW_SYLLABUS_BG } from '../data/syllabusTemplateBg';
import { PW_OFFICIAL_LOGO_URL } from './PwLogo';

interface SyllabusPdfDocumentProps {
  config: PosterConfig;
  pdfDocRef?: React.RefObject<HTMLDivElement | null>;
  onChange?: (updated: Partial<PosterConfig>) => void;
  scale?: number;
  selectedCell?: { rIdx: number; cIdx: number } | null;
  onSelectCell?: (cell: { rIdx: number; cIdx: number } | null) => void;
  onSelectActiveElement?: (elem: 'batchName' | 'title' | 'date' | 'tableHeader' | 'tableCell' | 'all') => void;
  isExporting?: boolean;
}

export const SyllabusPdfDocument: React.FC<SyllabusPdfDocumentProps> = ({
  config,
  pdfDocRef,
  onChange,
  scale = 1,
  selectedCell,
  onSelectCell,
  onSelectActiveElement,
  isExporting = false
}) => {
  // Extract syllabus rows from config.tableData
  const getSyllabusRows = () => {
    if (config.tableData && config.tableData.length > 0) {
      return config.tableData.map((row) => {
        const subject = row[0] || '';
        const topic = row[1] || row.slice(1).filter(Boolean).join(' - ') || '';
        return { subject, topic };
      });
    }

    return [
      { subject: 'PHYSICS', topic: 'Units and Measurements, Motion in a Straight Line, Motion in a Plane' },
      { subject: 'CHEMISTRY', topic: 'Some Basic Concepts of Chemistry, Structure of Atom, Classification of Elements' },
      { subject: 'BOTANY', topic: 'The Living World, Biological Classification, Plant Kingdom' },
      { subject: 'ZOOLOGY', topic: 'Animal Kingdom, Structural Organisation in Animals' }
    ];
  };

  const syllabusRows = getSyllabusRows();

  // Always keep batchName in sync between Poster and PDF views
  const headerLine1 = (config.batchName || config.pdfHeaderLine1 || '').trim().toUpperCase();

  const getAutoHeaderLine2 = () => {
    const title = (config.title || '').trim().toUpperCase();
    const date = (config.startDate || '').trim().toUpperCase();

    if (title && date) {
      return `${title} (${date})`;
    }
    if (title) {
      return title;
    }
    if (date) {
      return `SYLLABUS (${date})`;
    }
    if (config.pdfHeaderLine2) {
      return config.pdfHeaderLine2;
    }
    return '';
  };

  const headerLine2 = getAutoHeaderLine2();
  const hasLine1 = headerLine1.length > 0;
  const hasLine2 = headerLine2.length > 0;

  // Dynamic expansion for blue pill when large or multi-line content is present
  const isExtendedBanner =
    headerLine1.length > 32 || headerLine2.length > 48 || headerLine1.includes('\n') || headerLine2.includes('\n');

  // Reactive font sizing tied directly to config font size steppers (+ / - buttons)
  const baseBatchSize = config.batchNameFontSize || 34;
  const line1FontSize = config.pdfHeaderLine1FontSize || Math.max(14, Math.round(baseBatchSize * 0.65));

  const baseTitleSize = config.titleFontSize || 22;
  const line2FontSize = config.pdfHeaderLine2FontSize || Math.max(10, Math.round(baseTitleSize * 0.58));

  const subjectColor = config.pdfSubjectColor || '#c00000';
  const footerLink = config.pdfFooterLink || 'https://smart.link/7wwosivoicgd4';
  const templateMode = config.pdfTemplateMode || 'official-bg';
  const customBgUrl = config.pdfTemplateBgUrl;

  const bgImageUrl =
    templateMode === 'custom-image' && customBgUrl ? customBgUrl : OFFICIAL_PW_SYLLABUS_BG;

  return (
    <div
      ref={pdfDocRef}
      id="pw-syllabus-pdf-root"
      data-width="794"
      data-height="1123"
      style={{
        width: '794px',
        height: '1123px',
        transformOrigin: 'top left',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Montserrat', sans-serif",
        color: '#0f172a'
      }}
      className="relative select-text box-border shadow-2xl p-[20px] bg-white"
    >
      {/* Exact Framed Document Box (Matches Tamplate.pdf with no clipping) */}
      <div className="relative w-full h-full border-[1.8px] border-[#0f172a] bg-white overflow-hidden">
        {/* 1. Official High-Resolution Template Background Image */}
        <img
          src={bgImageUrl}
          alt="Official PW Syllabus Template Background"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 select-none"
        />

        {/* 2. TOP OFFICIAL PW SEAL LOGO (Positioned inside top frame box) */}
        {config.showLogo && (
          <div
            className="absolute top-[8px] left-1/2 -translate-x-1/2 z-20 w-[76px] h-[76px] rounded-full bg-white flex items-center justify-center p-1 pointer-events-none"
          >
            <img
              src={config.customLogoUrl || PW_OFFICIAL_LOGO_URL}
              alt="PW Logo"
              crossOrigin="anonymous"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* 3. BLUE HEADER BANNER TEXT OVERLAY (Centered directly on the single official template blue pill) */}
        <div
          style={{
            top: `${config.pdfBannerY !== undefined ? config.pdfBannerY - 18 : 102}px`,
            backgroundColor: 'transparent'
          }}
          className="absolute left-1/2 -translate-x-1/2 z-20 w-[440px] min-h-[72px] flex flex-col items-center justify-center text-center px-4 select-text pointer-events-auto transition-all"
        >
          <div
            contentEditable={!!onChange}
            suppressContentEditableWarning
            data-placeholder="ENTER BATCH / TEST NAME"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCell?.(null);
              onSelectActiveElement?.('batchName');
            }}
            onFocus={() => {
              onSelectCell?.(null);
              onSelectActiveElement?.('batchName');
            }}
            onBlur={(e) => {
              if (onChange) {
                const val = e.currentTarget.innerText.trim();
                onChange({ batchName: val, pdfHeaderLine1: val });
              }
            }}
            style={{
              color: '#ffffff',
              fontSize: `${line1FontSize}px`,
              lineHeight: '1.15'
            }}
            className="pw-pdf-header font-extrabold tracking-wide uppercase text-center flex items-center justify-center outline-none focus:ring-1 focus:ring-white rounded px-1.5 max-w-full text-ellipsis overflow-hidden empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:font-normal cursor-text"
            title="Click to edit Header Line 1 (Batch / Test Name)"
          >
            {headerLine1 || ''}
          </div>

          {hasLine2 && (
            <div
              contentEditable={!!onChange}
              suppressContentEditableWarning
              data-placeholder="ENTER SYLLABUS / DATE"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCell?.(null);
                onSelectActiveElement?.('title');
              }}
              onFocus={() => {
                onSelectCell?.(null);
                onSelectActiveElement?.('title');
              }}
              onBlur={(e) => {
                if (onChange) {
                  const val = e.currentTarget.innerText.trim();
                  onChange({ title: val, pdfHeaderLine2: val });
                }
              }}
              style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: `${line2FontSize}px`,
                lineHeight: '1.15'
              }}
              className="pw-pdf-header font-semibold tracking-wider uppercase text-center mt-0.5 flex items-center justify-center outline-none focus:ring-1 focus:ring-white rounded px-1.5 max-w-full text-ellipsis overflow-hidden empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:font-normal cursor-text"
              title="Click to edit Header Line 2 (Syllabus Date)"
            >
              {headerLine2}
            </div>
          )}
        </div>

        {/* 4. SYLLABUS SUBJECT & TOPIC BREAKDOWN (Full-width "Subject : Topic / Link" Pairing) */}
        <div
          className="absolute left-[36px] right-[36px] z-30 select-text"
          style={{
            top: `${config.pdfContentY !== undefined ? config.pdfContentY - 18 : 225}px`,
            maxHeight: '735px',
            overflow: 'hidden'
          }}
        >
          {syllabusRows.map((item, idx) => {
            const totalRows = syllabusRows.length;
            const subjectFontSize = totalRows <= 3 ? 22 : totalRows <= 5 ? 19 : 16;
            const topicFontSize = totalRows <= 3 ? 17 : totalRows <= 5 ? 15 : 13.5;
            const rowMarginBottom = config.pdfRowGap !== undefined
              ? config.pdfRowGap
              : 60;
            const subjectWidth = config.pdfSubjectWidth !== undefined ? config.pdfSubjectWidth : 195;

            const activeSubjectColor = config.pdfSubjectColor || config.tableHeaderTextColor || subjectColor || '#c00000';

            const isSubjectSelected = selectedCell?.rIdx === idx && selectedCell?.cIdx === 0;
            const isTopicSelected = selectedCell?.rIdx === idx && selectedCell?.cIdx === 1;

            const subjectCellStyle = config.cellStyles?.[`${idx}-0`];
            const topicCellStyle = config.cellStyles?.[`${idx}-1`];

            const finalSubjectColor = subjectCellStyle?.color || activeSubjectColor;
            const finalSubjectFontSize = subjectCellStyle?.fontSize || (config.pdfSubjectFontSize !== undefined ? config.pdfSubjectFontSize : (config.tableHeaderFontSize ? config.tableHeaderFontSize : subjectFontSize));
            const finalSubjectFontWeight = subjectCellStyle?.fontWeight ? parseInt(subjectCellStyle.fontWeight, 10) : (config.tableHeaderFontWeight ? parseInt(String(config.tableHeaderFontWeight), 10) : 800);
            const finalSubjectFontFamily = subjectCellStyle?.fontFamily || config.fontFamily || "'Plus Jakarta Sans', 'Montserrat', sans-serif";

            const finalTopicColor = topicCellStyle?.color || (config.pdfTopicColor || config.tableCellTextColor || '#0f172a');
            const finalTopicFontSize = topicCellStyle?.fontSize || (config.pdfTopicFontSize !== undefined ? config.pdfTopicFontSize : (config.tableCellFontSize ? config.tableCellFontSize : topicFontSize));
            const finalTopicFontWeight = topicCellStyle?.fontWeight ? parseInt(topicCellStyle.fontWeight, 10) : (config.tableCellFontWeight ? parseInt(String(config.tableCellFontWeight), 10) : 500);
            const finalTopicFontFamily = topicCellStyle?.fontFamily || config.fontFamily || "'Plus Jakarta Sans', 'Inter', sans-serif";

            return (
              <div
                key={`row-${idx}`}
                className="flex flex-row items-baseline w-full"
                style={{ marginBottom: `${rowMarginBottom}px` }}
              >
                {/* Subject Header Column with Right-Aligned Colon for Perfect Vertical Grid Alignment */}
                <div
                  className="flex items-baseline justify-between shrink-0 mr-4"
                  style={{ width: `${subjectWidth}px` }}
                >
                  <span
                    key={`subject-${idx}`}
                    contentEditable={!isExporting && !!onChange}
                    suppressContentEditableWarning
                    data-placeholder="SUBJECT"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCell?.({ rIdx: idx, cIdx: 0 });
                      onSelectActiveElement?.('tableHeader');
                    }}
                    onFocus={() => {
                      onSelectCell?.({ rIdx: idx, cIdx: 0 });
                      onSelectActiveElement?.('tableHeader');
                    }}
                    onBlur={(e) => {
                      if (onChange) {
                        const currentTable = (config.tableData || []).map((row) => [...row]);
                        while (currentTable.length <= idx) currentTable.push(['', '']);
                        currentTable[idx][0] = e.currentTarget.innerText.trim();
                        onChange({ tableData: currentTable });
                      }
                    }}
                    style={{
                      color: finalSubjectColor,
                      fontSize: `${finalSubjectFontSize}px`,
                      fontFamily: finalSubjectFontFamily,
                      fontWeight: finalSubjectFontWeight,
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}
                    className={`pw-cell-text tracking-wide outline-none rounded px-1 -ml-1 cursor-text uppercase font-black empty:before:content-[attr(data-placeholder)] empty:before:opacity-30 empty:before:italic empty:before:font-normal transition-all ${
                      !isExporting && isSubjectSelected ? 'ring-2 ring-purple-600 bg-purple-50/60' : !isExporting ? 'focus:ring-1 focus:ring-rose-400' : ''
                    }`}
                    title="Click to select & edit subject name"
                  >
                    {item.subject}
                  </span>
                  {(item.subject || '').trim().length > 0 && (
                    <span
                      style={{
                        color: finalSubjectColor,
                        fontSize: `${finalSubjectFontSize}px`,
                        fontWeight: '800',
                        lineHeight: '1.25'
                      }}
                      className="select-none font-bold ml-1 shrink-0"
                    >
                      :
                    </span>
                  )}
                </div>

                {/* Topic / Link Column (Starts at exact same horizontal position across all rows) */}
                <div className="flex-1 min-w-0">
                  <span
                    key={`topic-${idx}`}
                    contentEditable={!isExporting && !!onChange}
                    suppressContentEditableWarning
                    data-placeholder="Enter topics / syllabus link..."
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCell?.({ rIdx: idx, cIdx: 1 });
                      onSelectActiveElement?.('tableCell');
                    }}
                    onFocus={() => {
                      onSelectCell?.({ rIdx: idx, cIdx: 1 });
                      onSelectActiveElement?.('tableCell');
                    }}
                    onBlur={(e) => {
                      if (onChange) {
                        const currentTable = (config.tableData || []).map((row) => [...row]);
                        while (currentTable.length <= idx) currentTable.push(['', '']);
                        currentTable[idx][1] = e.currentTarget.innerText.trim();
                        onChange({ tableData: currentTable });
                      }
                    }}
                    style={{
                      color: finalTopicColor,
                      fontSize: `${finalTopicFontSize}px`,
                      fontFamily: finalTopicFontFamily,
                      fontWeight: finalTopicFontWeight,
                      lineHeight: '1.45',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}
                    className={`pw-cell-text block w-full outline-none rounded px-1 -ml-1 cursor-text empty:before:content-[attr(data-placeholder)] empty:before:opacity-30 empty:before:italic empty:before:font-normal transition-all ${
                      !isExporting && isTopicSelected ? 'ring-2 ring-purple-600 bg-purple-50/60' : !isExporting ? 'focus:ring-1 focus:ring-blue-400' : ''
                    }`}
                    title="Click to select & edit topic details"
                  >
                    {item.topic}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. CLICKABLE FOOTER LINK ANNOTATION OVERLAY */}
        <div
          style={{
            position: 'absolute',
            bottom: '33px',
            left: '200px',
            zIndex: 35
          }}
          className="flex items-center gap-2 select-text pointer-events-auto"
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Montserrat', 'Inter', sans-serif",
              fontSize: '17px',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: '1.2',
              letterSpacing: '-0.01em'
            }}
          >
            PW Web/App -
          </span>
          <a
            href={footerLink}
            target="_blank"
            rel="noopener noreferrer"
            data-pdf-link={footerLink}
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Montserrat', 'Inter', sans-serif",
              fontSize: '17px',
              fontWeight: 800,
              color: '#2563eb',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              lineHeight: '1.2'
            }}
            className="hover:text-blue-800 transition-colors cursor-pointer"
            title="Open PW Web / App link"
          >
            {footerLink}
          </a>
        </div>
      </div>
    </div>
  );
};



