import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { useTheme } from './themeContext';

const native: { setEnabled?: (on: boolean) => void } | undefined = NativeModules.KeepAwake;

/**
 * Keeps the screen on while the calling screen is mounted (and the "Keep screen on" setting is enabled).
 * Uses a small native Android module; it is a no-op where the module is not available.
 */
export function useKeepAwake(active = true) {
  const { keepAwake } = useTheme();
  const on = active && keepAwake;
  useEffect(() => {
    if (!on) return;
    native?.setEnabled?.(true);
    return () => native?.setEnabled?.(false);
  }, [on]);
}
