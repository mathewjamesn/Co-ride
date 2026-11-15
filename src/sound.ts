import { NativeModules } from 'react-native';

/** Short alert sounds (plus a buzz). 'chat' = new message, 'accepted' = request / offer accepted. */
export function playTone(kind: 'chat' | 'accepted') {
  try {
    NativeModules.Notify?.play(kind);
  } catch {
    // no native module (e.g. tests): stay silent
  }
}
