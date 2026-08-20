import { PosterConfig, PresetSample } from '../types';

export const DEFAULT_CLEAN_POSTER: PosterConfig = {
  type: 'syllabus',
  syllabusType: 'Long',
  batchName: '',
  title: '',
  startDate: '',
  endDate: '',
  numRows: 3,
  numCols: 2,
  theme: 'purple-pw',
  bgStyleMode: 's3-template1',
  logoStyleMode: 'pw-official-img',
  showLogo: true,
  tableHeaderFontSize: 22,
  tableCellFontSize: 17,
  pdfSubjectFontSize: 22,
  pdfTopicFontSize: 17,
  pdfRowGap: 60,
  pdfFooterLink: 'https://smart.link/7wwosivoicgd4',
  pdfFooterText: 'PW Web/App -',
  tableData: [
    ['', ''],
    ['', ''],
    ['', '']
  ]
};

export const INITIAL_SYLLABUS_POSTER: PosterConfig = {
  type: 'syllabus',
  syllabusType: 'Long',
  batchName: '',
  title: '',
  startDate: '',
  endDate: '',
  numRows: 3,
  numCols: 2,
  theme: 'purple-pw',
  bgStyleMode: 's3-template1',
  logoStyleMode: 'pw-official-img',
  showLogo: true,
  tableHeaderFontSize: 22,
  tableCellFontSize: 17,
  pdfHeaderLine1: '',
  pdfHeaderLine2: '',
  pdfSubjectFontSize: 22,
  pdfTopicFontSize: 17,
  pdfRowGap: 60,
  pdfBannerColor: '#4285f4',
  pdfSubjectColor: '#c00000',
  pdfTopicColor: '#00a651',
  pdfFooterLink: 'https://smart.link/7wwosivoicgd4',
  pdfFooterText: 'PW Web/App -',
  tableData: [
    ['Subject', 'Topics'],
    ['Subject', 'Topics'],
    ['Subject', 'Topics']
  ]
};

export const INITIAL_TIMETABLE_POSTER: PosterConfig = {
  type: 'timetable',
  syllabusType: 'Short',
  batchName: '',
  title: '',
  startDate: '',
  endDate: '',
  numRows: 7,
  numCols: 2,
  theme: 'maroon-pw',
  bgStyleMode: 's3-template1',
  logoStyleMode: 'pw-official-img',
  showLogo: true,
  tableData: [
    ['DAYS', ''],
    ['MONDAY', ''],
    ['TUESDAY', ''],
    ['WEDNESDAY', ''],
    ['THURSDAY', ''],
    ['FRIDAY', ''],
    ['SATURDAY', '']
  ]
};

export const INITIAL_ANNOUNCEMENT_POSTER: PosterConfig = {
  type: 'announcement',
  syllabusType: 'Short',
  batchName: '',
  title: '',
  startDate: '',
  endDate: '',
  numRows: 1,
  numCols: 1,
  theme: 'emerald-pw',
  bgStyleMode: 's3-template1',
  logoStyleMode: 'pw-official-img',
  showLogo: true,
  announcementBadge: 'Keep Learning !!',
  announcementText: 'DEAR ASPIRANTS, DAILY CLASS NOTES FOR LECTURE 44 AND THE COMPILATION NOTES OF MODERN HISTORY HAVE BEEN UPLOADED TO THE SUBJECT SECTION OF YOUR BATCH. KINDLY CHECK THEM. KEEP STUDYING !!',
  announcementFontSize: 22,
  announcementLineHeight: 1.36,
  announcementFontWeight: '500',
  titleFontWeight: '500',
  announcementTextAlign: 'left',
  announcementVerticalAlign: 'top',
  badgeLayoutMode: 'bottom-left',
  badgeX: 4.5,
  badgeY: 84,
  badgeBgColor: '#ffd200',
  badgeTextColor: '#000000',
  showMegaphone: true,
  tableData: [['']]
};

export const PRESET_SAMPLES: PresetSample[] = [
  {
    name: 'Blank Clean Poster (Empty Grid)',
    description: 'Start with a completely fresh, empty poster and table',
    config: DEFAULT_CLEAN_POSTER
  },
  {
    name: 'Blank Time Table (Days Only)',
    description: 'Days (Monday–Saturday) with clean, empty subject & time slots',
    config: INITIAL_TIMETABLE_POSTER
  },
  {
    name: 'Official PW Announcement Banner (1000×375)',
    description: 'Teal green theme with megaphone, logo & Keep Learning !! badge',
    config: INITIAL_ANNOUNCEMENT_POSTER
  },
  {
    name: 'UPSC Class Schedule Sample',
    description: 'Dark wine maroon theme for weekly class schedules',
    config: {
      ...INITIAL_TIMETABLE_POSTER,
      batchName: 'UPSC CLASS SCHEDULE',
      title: 'WEEKLY TIMETABLE',
      tableData: [
        ['DAYS', 'ETHICS, INTEGRITY AND APTITUDE'],
        ['MONDAY', '8:00 AM'],
        ['TUESDAY', '8:00 AM'],
        ['WEDNESDAY', '8:00 AM'],
        ['THURSDAY', '8:00 AM'],
        ['FRIDAY', '8:00 AM'],
        ['SATURDAY', '8:00 AM']
      ]
    }
  },
  {
    name: 'UPSC Weekly Test Syllabus Sample',
    description: 'Purple geometric theme with 2-column subject breakdown',
    config: INITIAL_SYLLABUS_POSTER
  },
  {
    name: 'Lakshya JEE 6-Day Multi-Slot Timetable',
    description: 'Full weekly lecture schedule with 4 time slots',
    config: {
      type: 'timetable',
      syllabusType: 'Short',
      batchName: 'PHYSICS WALLAH - LAKSHYA BATCH',
      title: 'WEEKLY CLASS TIME TABLE',
      startDate: '27/07/2026',
      endDate: '02/08/2026',
      numRows: 6,
      numCols: 4,
      theme: 'purple-pw',
      showLogo: true,
      tableData: [
        ['Days', '09:00 AM - 10:30 AM', '11:00 AM - 12:30 PM', '02:00 PM - 03:30 PM'],
        ['Monday', 'Physics - Ch 04', 'Chemistry - Organic', 'Maths - Calculus'],
        ['Tuesday', 'Physics - Ch 04', 'Chemistry - Organic', 'Botany - Cell Cycle'],
        ['Wednesday', 'Maths - Calculus', 'Zoology - Genetics', 'Physics - Problem Solving'],
        ['Thursday', 'Chemistry - Inorganic', 'Physics - Ch 05', 'Maths - Vectors'],
        ['Friday', 'Zoology - Human Health', 'Botany - Ecology', 'Doubt Session - Live']
      ]
    }
  },
  {
    name: 'Yakeen NEET Short Syllabus',
    description: 'Compact 2-row test topic summary',
    config: {
      type: 'syllabus',
      syllabusType: 'Short',
      batchName: 'YAKEEN NEET 2026',
      title: 'MINOR TEST 02 SYLLABUS',
      startDate: '02/08/2026',
      endDate: '',
      numRows: 4,
      numCols: 2,
      theme: 'navy-pw',
      showLogo: true,
      tableData: [
        ['Physics', 'Electrostatics & Current Electricity (Complete Ch 1 & 2)'],
        ['Chemistry', 'Chemical Bonding & Molecular Structure'],
        ['Botany', 'Plant Kingdom & Cell: The Unit of Life'],
        ['Zoology', 'Structural Organisation in Animals']
      ]
    }
  },
  {
    name: 'Vidyapeeth Classroom Schedule',
    description: 'Vidyapeeth dark slate theme for center updates',
    config: {
      type: 'timetable',
      syllabusType: 'Short',
      batchName: 'PW VIDYAPEETH KOTA',
      title: 'OFFLINE BATCH SCHEDULE',
      startDate: '01/08/2026',
      endDate: '07/08/2026',
      numRows: 5,
      numCols: 3,
      theme: 'dark-slate',
      showLogo: true,
      tableData: [
        ['Days', 'Morning Slot (8:00 AM)', 'Evening Slot (3:00 PM)'],
        ['Monday', 'Physics Major Test', 'Chemistry Practice'],
        ['Tuesday', 'Botany Lecture 12', 'Zoology Lecture 10'],
        ['Wednesday', 'Physics Problem Class', 'Maths Doubt Solving'],
        ['Thursday', 'Mock Test Series 03', 'Paper Discussion']
      ]
    }
  }
];
