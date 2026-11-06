import React, { createContext, useContext, useState } from 'react';

export type Search = {
  mode: 'find' | 'offer';
  from: string;
  to: string;
  when: string;
  seats: number;
  recurring: boolean;
};

const defaults: Search = {
  mode: 'find',
  from: '2947+VR6, Infopark Campus, Kochi, Kakkanad',
  to: 'Fort Kochi, Kochi, Kerala, India',
  when: 'Today, 5:35 PM',
  seats: 1,
  recurring: false,
};

const Ctx = createContext<{ s: Search; set: (p: Partial<Search>) => void }>({ s: defaults, set: () => {} });

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [s, setS] = useState(defaults);
  return <Ctx.Provider value={{ s, set: p => setS(prev => ({ ...prev, ...p })) }}>{children}</Ctx.Provider>;
};

export const useSearch = () => useContext(Ctx);
