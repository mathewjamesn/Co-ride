import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_FROM } from './data';

export type Search = {
  mode: 'find' | 'offer';
  from: string;
  to: string;
  when: string;
  seats: number;
  recurring: boolean;
  recents: string[];
  favs: string[];
  /** Ids of people I have sent a request / offer to (shown as Requested in the list). */
  requested: string[];
};

const defaults: Search = {
  mode: 'find',
  from: DEFAULT_FROM,
  to: '',
  when: 'Today, 5:35 PM',
  seats: 1,
  recurring: false,
  recents: [],
  favs: [],
  requested: [],
};

const Ctx = createContext<{ s: Search; set: (p: Partial<Search>) => void; toggleFav: (name: string) => void; addRecent: (name: string) => void }>({
  s: defaults,
  set: () => {},
  toggleFav: () => {},
  addRecent: () => {},
});

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [s, setS] = useState(defaults);
  const set = (p: Partial<Search>) => setS(prev => ({ ...prev, ...p }));
  const toggleFav = (name: string) =>
    setS(prev => ({ ...prev, favs: prev.favs.includes(name) ? prev.favs.filter(f => f !== name) : [...prev.favs, name] }));
  const addRecent = (name: string) =>
    setS(prev => ({ ...prev, recents: [name, ...prev.recents.filter(r => r !== name)].slice(0, 5) }));
  return <Ctx.Provider value={{ s, set, toggleFav, addRecent }}>{children}</Ctx.Provider>;
};

export const useSearch = () => useContext(Ctx);
