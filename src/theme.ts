/** Design tokens shared with the TOK Driver prototype (black + lime). */
export const colors = {
  ink: '#000000',
  ground: '#F3F3F3',
  card: '#FFFFFF',
  line: '#E2E2E2',
  muted: '#5E5E5E',
  lime: '#C6F68D',
  green: '#0E7C4A',
  greenTint: '#E3F3EA',
  red: '#B3261E',
  redTint: '#FDECEA',
  warnText: '#8A3B00',
  warnTint: '#FFEDE0',
  warnLine: '#F6CBAA',
  blue: '#1F5FBF',
  darkCard: '#1F1F1F',
  darkLine: '#333333',
  darkMuted: '#B5B5B5',
  white: '#FFFFFF',
} as const;

export const radius = { sm: 8, md: 14, lg: 18, xl: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const type = {
  hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  display: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.4 },
  title: { fontSize: 22, fontWeight: '800' as const },
  heading: { fontSize: 18, fontWeight: '800' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  bodyStrong: { fontSize: 16, fontWeight: '700' as const },
  label: { fontSize: 14, fontWeight: '700' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
};

export const shadow = {
  shadowColor: '#1C2127',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
} as const;

/** Minimum touch target. */
export const TOUCH = 48;
