export const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1F2933',
  textMuted: '#6B7280',
  border: '#E5E7EB',

  primary: '#2563EB', // blue - actions, beaches
  accent: '#F97316', // orange - stellplatz

  camping: '#16A34A', // green
  stellplatz: '#F97316', // orange
  beach: '#0EA5E9', // blue
  attraction: '#9333EA', // purple

  success: '#22C55E',
  warning: '#FACC15',
  danger: '#EF4444',
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
