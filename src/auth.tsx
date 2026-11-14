import React, { createContext, useContext, useState } from 'react';

/** How a person got verified. */
export type Method = 'org' | 'endorsed' | 'id';
export type Endorser = { name: string; phone: string; accepted: boolean };

export type AuthState = {
  /** Prototype switch: walk through as a brand-new user or as a returning verified user. */
  kind: 'new' | 'verified';
  email: string;
  /** True for a company / school / organisation domain (verified by emailing a code). */
  orgEmail: boolean;
  orgName: string;
  method: Method | null;
  status: 'none' | 'pending' | 'verified';
  endorsers: Endorser[];
  idType: string | null;
};

const blank: AuthState = { kind: 'new', email: '', orgEmail: false, orgName: '', method: null, status: 'none', endorsers: [], idType: null };
const demoVerified: AuthState = { kind: 'verified', email: 'mathew@ibsplc.com', orgEmail: true, orgName: 'IBS Software', method: 'org', status: 'verified', endorsers: [], idType: null };

export const ENDORSEMENTS_NEEDED = 2;

const COMMON = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'ymail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'rediffmail.com', 'aol.com', 'zoho.com', 'mail.com',
];

export type EmailKind = { valid: boolean; org: boolean; school: boolean; orgName: string };

/** Company / school domains get an email OTP; common mail providers need endorsement or ID. */
export function classifyEmail(raw: string): EmailKind {
  const email = raw.trim().toLowerCase();
  const m = /^[^\s@]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/.exec(email);
  if (!m) return { valid: false, org: false, school: false, orgName: '' };
  const domain = m[1];
  if (COMMON.includes(domain)) return { valid: true, org: false, school: false, orgName: '' };
  const school = /(^|\.)(edu|ac)(\.[a-z]{2})?$/.test(domain) || /\.edu\.[a-z]{2}$/.test(domain);
  const parts = domain.split('.');
  const label = parts.length > 2 && ['co', 'com', 'ac', 'edu', 'org', 'gov'].includes(parts[parts.length - 2]) ? parts[parts.length - 3] : parts[parts.length - 2];
  return { valid: true, org: true, school, orgName: label.charAt(0).toUpperCase() + label.slice(1) };
}

export const methodLabel = (m: Method | null) =>
  m === 'org' ? 'Organisation email' : m === 'endorsed' ? 'Endorsed by members' : m === 'id' ? 'Personal ID' : '';

type Api = {
  auth: AuthState;
  verified: boolean;
  /** Prototype: pick the journey. 'verified' = returning user who is already verified. */
  signInAs: (kind: AuthState['kind']) => void;
  setEmail: (email: string, k: EmailKind) => void;
  /** Email OTP accepted. */
  verifyOrg: () => void;
  sendEndorsements: (list: { name: string; phone: string }[]) => void;
  acceptEndorser: (i: number) => void;
  submitId: (type: string) => void;
  approveId: () => void;
  /** Where to send someone who still has to finish verification. */
  nextStep: () => string | null;
};

const Ctx = createContext<Api>(null as unknown as Api);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(blank);
  const patch = (p: Partial<AuthState>) => setAuth(a => ({ ...a, ...p }));

  const api: Api = {
    auth,
    verified: auth.status === 'verified',
    signInAs: kind => setAuth(kind === 'verified' ? demoVerified : blank),
    setEmail: (email, k) => patch({ email: email.trim().toLowerCase(), orgEmail: k.org, orgName: k.org ? (k.school ? `${k.orgName} (school)` : k.orgName) : '' }),
    verifyOrg: () => patch({ status: 'verified', method: 'org' }),
    sendEndorsements: list => patch({ method: 'endorsed', status: 'pending', endorsers: list.map(l => ({ ...l, accepted: false })) }),
    acceptEndorser: i =>
      setAuth(a => {
        const endorsers = a.endorsers.map((e, j) => (j === i ? { ...e, accepted: true } : e));
        const ok = endorsers.filter(e => e.accepted).length >= ENDORSEMENTS_NEEDED;
        return { ...a, endorsers, status: ok ? 'verified' : 'pending' };
      }),
    submitId: type => patch({ method: 'id', status: 'pending', idType: type }),
    approveId: () => patch({ status: 'verified' }),
    nextStep: () => {
      if (auth.status === 'verified') return null;
      if (auth.status === 'pending') return 'VerifyStatus';
      if (!auth.email) return 'Email';
      return auth.orgEmail ? 'EmailOtp' : 'VerifyChoice';
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
