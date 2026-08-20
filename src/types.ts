export type PosterType = 'timetable' | 'syllabus' | 'announcement';

export type SyllabusType = 'Short' | 'Long';

export type ThemePreset = 'purple-pw' | 'navy-pw' | 'vibrant-gold' | 'emerald-pw' | 'dark-slate' | 'maroon-pw';

export type BgStyleMode = 's3-template1' | 's3-template2' | 'drive-template1' | 'css-exact' | 'custom';

export type LogoStyleMode = 'pw-official-img' | 'pw-svg' | 'custom';

export interface PosterConfig {
  id?: string;
  type: PosterType;
  syllabusType: SyllabusType;
  batchName: string;
  title: string;
  startDate: string;
  endDate: string;
  numRows: number;
  numCols: number;
  theme: ThemePreset;
  bgStyleMode?: BgStyleMode;
  customBgUrl?: string;
  logoStyleMode?: LogoStyleMode;
  customLogoUrl?: string;
  showLogo: boolean;
  headerGap?: number;
  tableData: string[][];
  announcementBadge?: string;
  announcementText?: string;
  announcementFontSize?: number;
  announcementLineHeight?: number;
  announcementFontWeight?: 'normal' | 'semibold' | 'bold' | 'extrabold' | '400' | '500' | '600' | '700' | '800' | '900';
  announcementTextAlign?: 'left' | 'center' | 'justify';
  announcementVerticalAlign?: 'top' | 'center';
  badgeLayoutMode?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-left' | 'top-right' | 'attached' | 'free-drag';
  badgeGap?: number;
  badgeX?: number; // Position X as percentage (0 to 100)
  badgeY?: number; // Position Y as percentage (0 to 100)
  badgeBgColor?: string;
  badgeTextColor?: string; // Announcement badge text color
  badgeFontSize?: number;
  badgePadding?: string;
  badgeBorderRadius?: number;
  showMegaphone?: boolean;
  customMegaphoneUrl?: string;
  megaphoneSize?: number;
  megaphoneX?: number;
  megaphoneY?: number;
  pdfHeaderLine1?: string;
  pdfHeaderLine2?: string;
  pdfHeaderLine1FontSize?: number;
  pdfHeaderLine2FontSize?: number;
  pdfSubjectFontSize?: number; // Independent font size for PDF subject names
  pdfTopicFontSize?: number; // Independent font size for PDF topic lines
  pdfBannerY?: number; // Vertical offset for blue banner
  pdfContentY?: number; // Vertical offset for syllabus table content
  pdfSubjectWidth?: number; // Subject column width (px)
  pdfRowGap?: number; // Row spacing (px)
  pdfBannerColor?: string;
  pdfSubjectColor?: string;
  pdfTopicColor?: string;
  pdfFooterLink?: string;
  pdfFooterText?: string;
  pdfTemplateBgUrl?: string;
  pdfTemplateMode?: 'exact-template' | 'vector-frame' | 'custom-image';
  tableStyleMode?: 'modern-clean' | 'classic-grid' | 'floating-rows';
  fontFamilyChoice?: 'plus-jakarta' | 'inter' | 'poppins';
  // Canva Typography Studio Options
  fontFamily?: string;
  headerFontFamily?: string;
  tableFontFamily?: string;
  batchNameFontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  batchNameLetterSpacing?: number;
  batchNameTextColor?: string;
  titleFontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  titleLetterSpacing?: number;
  titleTextColor?: string;
  dateBadgeBgColor?: string; // Date badge (yellow pill) background color
  dateBadgeTextColor?: string; // Date badge (yellow pill) text color
  dateBadgeFontWeight?: '600' | '700' | '800' | '900';
  // Draggable Offsets
  batchNameX?: number;
  batchNameY?: number;
  titleX?: number;
  titleY?: number;
  dateX?: number;
  dateY?: number;
  tableX?: number;
  tableY?: number;
  // Granular Font Size Customization
  batchNameFontSize?: number;
  titleFontSize?: number;
  dateFontSize?: number;
  tableHeaderFontSize?: number;
  tableCellFontSize?: number;
  tableLineHeight?: number;
  globalFontScale?: number;
  // Canva Table Customizer
  tableHasHeaderRow?: boolean;
  tableHeaderBgColor?: string;
  tableHeaderTextColor?: string;
  tableHeaderFontWeight?: '600' | '700' | '800' | '900';
  tableHeaderAlign?: 'left' | 'center' | 'right';
  tableHeaderLetterSpacing?: number;
  tableCellBgColor?: string;
  tableCellTextColor?: string;
  tableCellFontWeight?: '400' | '500' | '600' | '700' | '800';
  tableCellAlign?: 'left' | 'center' | 'right';
  tableCellLetterSpacing?: number;
  tableBorderColor?: string;
  tableBorderWidth?: number;
  tableCol0BgColor?: string;
  tableCol0TextColor?: string;
  tableCol0WidthPercent?: number;
  tableShadowEffect?: 'none' | 'subtle' | 'elevated' | 'strong';
  // Per-Cell Granular Customization (e.g. key "0-1" for Row 0 Col 1)
  cellStyles?: Record<string, {
    fontSize?: number;
    color?: string;
    fontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
  }>;
}

export interface SavedPoster {
  id: string;
  name: string;
  createdAt: string;
  config: PosterConfig;
}

export interface PresetSample {
  name: string;
  description: string;
  config: PosterConfig;
}
