export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Modern Sans' | 'Bold Display' | 'Condensed' | 'Serif';
  sampleText: string;
  defaultWeight?: string;
}

export const CANVA_FONTS: FontOption[] = [
  {
    id: 'montserrat',
    name: 'Montserrat (PW Official)',
    family: "'Montserrat', sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '800'
  },
  {
    id: 'poppins',
    name: 'Poppins (Geometric)',
    family: "'Poppins', sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'inter',
    name: 'Inter (Clean & Crisp)',
    family: "'Inter', sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '800'
  },
  {
    id: 'bebas-neue',
    name: 'Bebas Neue (Heavy Headline)',
    family: "'Bebas Neue', sans-serif",
    category: 'Bold Display',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '400'
  },
  {
    id: 'anton',
    name: 'Anton (Impact Poster)',
    family: "'Anton', sans-serif",
    category: 'Bold Display',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '400'
  },
  {
    id: 'oswald',
    name: 'Oswald (Condensed Bold)',
    family: "'Oswald', sans-serif",
    category: 'Condensed',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '600'
  },
  {
    id: 'roboto-condensed',
    name: 'Roboto Condensed (Schedules)',
    family: "'Roboto Condensed', sans-serif",
    category: 'Condensed',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'playfair',
    name: 'Playfair Display (Serif)',
    family: "'Playfair Display', serif",
    category: 'Serif',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'cinzel',
    name: 'Cinzel (Premium Royal)',
    family: "'Cinzel', serif",
    category: 'Serif',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'times-new-roman',
    name: 'Times New Roman',
    family: "'Times New Roman', Times, serif",
    category: 'Serif',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'arial',
    name: 'Arial',
    family: "Arial, Helvetica, sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'helvetica',
    name: 'Helvetica',
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    category: 'Modern Sans',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  },
  {
    id: 'courier-new',
    name: 'Courier New',
    family: "'Courier New', Courier, monospace",
    category: 'Serif',
    sampleText: 'PHYSICS WALLAH BATCH',
    defaultWeight: '700'
  }
];

export const BRAND_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'PW Gold', hex: '#fbbf24' },
  { name: 'Bright Yellow', hex: '#fcec24' },
  { name: 'Deep Crimson', hex: '#991b1b' },
  { name: 'PW Maroon', hex: '#581c1c' },
  { name: 'Dark Purple', hex: '#3b0764' },
  { name: 'Royal Navy', hex: '#1e1b4b' },
  { name: 'Emerald', hex: '#065f46' },
  { name: 'Slate 900', hex: '#0f172a' },
  { name: 'Slate 700', hex: '#334155' }
];
