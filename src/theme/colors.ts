export const colors = {
  background: '#FFF6E9', // warm sunny cream
  surface: '#FFFFFF',
  text: '#3B2A52', // deep psychedelic purple, readable on cream
  textMuted: '#8A78A8',
  border: '#FFE2B8',

  primary: '#FF5DA2', // hot pink - main actions
  secondary: '#7C4DFF', // groovy purple
  accent: '#FFC93C', // sunflower yellow

  camping: '#1FAF8E', // jungle turquoise
  stellplatz: '#FF7A3D', // sunset orange
  beach: '#1FB6D6', // ocean teal
  attraction: '#A560E8', // psychedelic violet

  success: '#1FAF8E',
  warning: '#FFC93C',
  danger: '#FF5470',
};

export const gradients = {
  sunset: ['#FF5DA2', '#FF7A3D', '#FFC93C'] as const,
  groovy: ['#7C4DFF', '#FF5DA2'] as const,
  ocean: ['#1FB6D6', '#7C4DFF'] as const,
  jungle: ['#1FAF8E', '#FFC93C'] as const,
  bgSunset: ['#FFD3EA', '#FFE2B8', '#FFF3B8'] as const,
  bgJungle: ['#C7F3E0', '#FFE9A0'] as const,
  bgOcean: ['#CDF1F8', '#E3D6FF'] as const,
};

export const categoryColors: Record<string, string> = {
  camping: colors.camping,
  stellplatz: colors.stellplatz,
  beach: colors.beach,
  attraction: colors.attraction,
};

export const categoryLabels: Record<string, string> = {
  camping: 'Camping',
  stellplatz: 'Ställplats',
  beach: 'Strand',
  attraction: 'Sevärdhet',
};

export const categoryIcons: Record<string, string> = {
  camping: '🏕️',
  stellplatz: '🚐',
  beach: '🏖️',
  attraction: '🏛️',
};
