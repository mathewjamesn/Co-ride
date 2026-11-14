import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Mode, applyTheme } from './theme';

export type Pref = 'system' | 'light' | 'dark';

type Ctx = {
  pref: Pref;
  mode: Mode;
  setPref: (p: Pref) => void;
  /** Keep the screen on during requests and rides. */
  keepAwake: boolean;
  setKeepAwake: (v: boolean) => void;
};

const ThemeCtx = createContext<Ctx>({ pref: 'system', mode: 'light', setPref: () => {}, keepAwake: true, setKeepAwake: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [pref, setPref] = useState<Pref>('system');
  const [keepAwake, setKeepAwake] = useState(true);
  const mode: Mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  // Swap the shared palette before any child renders with the new mode.
  applyTheme(mode);
  return <ThemeCtx.Provider value={{ pref, mode, setPref, keepAwake, setKeepAwake }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);

/** Re-renders a screen when the theme changes (screens build their styles from the shared palette). */
export function themed<P extends object>(Screen: React.ComponentType<P>): React.ComponentType<P> {
  const Wrapped = (props: P) => {
    useTheme();
    return <Screen {...props} />;
  };
  Wrapped.displayName = `themed(${Screen.displayName || Screen.name})`;
  return Wrapped;
}
