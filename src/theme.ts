import { StyleSheet } from 'react-native';

/**
 * Design tokens shared with the TOK Driver prototype (black + lime), with a light and a dark palette.
 *
 * `colors` is one mutable object: `applyTheme()` swaps its values, and `makeStyles()` rebuilds style sheets
 * when the mode changes. Screens re-render through the ThemeProvider in themeContext.tsx.
 *
 * Token roles:
 *  - text    : default text / icon colour on surfaces (black in light, near-white in dark)
 *  - ink     : strong surface (headers, primary buttons). Always dark.
 *  - onInk   : text on ink / red surfaces (always white)
 *  - accent  : lime used as text/icon on ink surfaces (always bright lime)
 *  - lime    : lime used as a *background* (bright in light, deep green in dark so dark-mode text stays readable)
 *  - white   : card / sheet surface (white in light, charcoal in dark)
 */
const light = {
  ink: '#000000',
  text: '#000000',
  onInk: '#FFFFFF',
  accent: '#C6F68D',
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
  mapBg: '#EAEDEA',
  mapWater: '#CFE3EE',
  mapPark: '#DCEFD0',
};

const dark: typeof light = {
  ink: '#000000',
  text: '#F2F2F2',
  onInk: '#FFFFFF',
  accent: '#C6F68D',
  ground: '#121212',
  card: '#1E1E1E',
  line: '#34343A',
  muted: '#A3A3A3',
  lime: '#2F4D17',
  green: '#5BD08F',
  greenTint: '#14301F',
  red: '#EF5350',
  redTint: '#3A1A18',
  warnText: '#F6B27A',
  warnTint: '#3A2614',
  warnLine: '#6B4524',
  blue: '#7FAEF5',
  darkCard: '#262626',
  darkLine: '#333333',
  darkMuted: '#B5B5B5',
  white: '#1E1E1E',
  mapBg: '#1B211E',
  mapWater: '#1C3240',
  mapPark: '#1F3320',
};

export type Mode = 'light' | 'dark';
export const colors: typeof light = { ...light };

let current: Mode = 'light';
export const getMode = () => current;
export function applyTheme(m: Mode) {
  if (m === current) return;
  current = m;
  Object.assign(colors, m === 'dark' ? dark : light);
}

/** Like StyleSheet.create, but re-evaluated whenever the theme mode changes. */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: () => T | StyleSheet.NamedStyles<T>): T {
  let cached: T | undefined;
  let cachedMode: Mode | undefined;
  return new Proxy({} as T, {
    get(_t, key) {
      if (!cached || cachedMode !== current) {
        cached = StyleSheet.create(factory()) as T;
        cachedMode = current;
      }
      return (cached as any)[key];
    },
  });
}

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
