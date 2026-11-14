import React, { createContext, useContext, useRef, useState } from 'react';

export type Msg = { id: string; from: 'me' | 'them'; text: string; at: string };

const REPLIES = ['Okay, noted.', 'Sure, see you there.', 'On my way!', 'Thanks for letting me know.', 'Got it. Please share your live location if you can.'];

const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

type Ctx = {
  threads: Record<string, Msg[]>;
  unread: Record<string, number>;
  send: (id: string, text: string) => void;
  /** Call with an id when a thread is on screen, and with null when it closes. */
  open: (id: string | null) => void;
};

const ChatCtx = createContext<Ctx>({ threads: {}, unread: {}, send: () => {}, open: () => {} });

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const opened = useRef<string | null>(null);
  const n = useRef(0);

  const push = (id: string, m: Omit<Msg, 'id' | 'at'>) =>
    setThreads(t => ({ ...t, [id]: [...(t[id] ?? []), { ...m, id: `m${++n.current}`, at: clock() }] }));

  const send = (id: string, text: string) => {
    push(id, { from: 'me', text });
    // Prototype: the other person answers after a moment.
    setTimeout(() => {
      push(id, { from: 'them', text: REPLIES[n.current % REPLIES.length] });
      if (opened.current !== id) setUnread(u => ({ ...u, [id]: (u[id] ?? 0) + 1 }));
    }, 1500);
  };
  const open = (id: string | null) => {
    opened.current = id;
    if (id) setUnread(u => ({ ...u, [id]: 0 }));
  };
  return <ChatCtx.Provider value={{ threads, unread, send, open }}>{children}</ChatCtx.Provider>;
};

export const useChat = () => useContext(ChatCtx);
