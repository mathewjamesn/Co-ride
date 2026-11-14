import React, { createContext, useContext, useState } from 'react';
import { Person } from './data';

/** Pickup spots handed out to riders in the prototype (Kochi). */
const SPOTS = ['Infopark Gate 2, Kakkanad', 'Kakkanad Junction', 'Palarivattom Bypass', 'Edappally Metro Station', 'Vyttila Hub'];
export const VEHICLE = 'Swift · KL 07 AB 1234';
export const PIN = '4821';

export type TripRider = {
  id: string;
  name: string;
  org: string;
  verified: boolean;
  rating: number;
  points: number;
  pickup: string;
  checkedIn: boolean;
  pickedUp: boolean;
};

/**
 * accepted → started (driver heading to riders[stop]) → atStop (driver reached the rider)
 * → started (next rider) … → toDrop (everyone on board) → ended
 */
export type Phase = 'accepted' | 'started' | 'atStop' | 'toDrop' | 'ended';

/** A finished or cancelled ride, shown under Carpools. */
export type RideLog = { id: string; role: 'rider' | 'driver'; from: string; to: string; when: string; pts: number; people: string; cancelled?: boolean };

type TripState = { role: 'rider' | 'driver'; driver: Person | null; riders: TripRider[]; stop: number; phase: Phase; capacity: number };

const empty: TripState = { role: 'rider', driver: null, riders: [], stop: 0, phase: 'accepted', capacity: 3 };

export const START_WALLET = 250;

const sampleHistory: RideLog[] = [
  { id: 'h2', role: 'driver', from: 'Edappally, Kochi', to: 'Infopark Campus, Kakkanad', when: 'Yesterday, 8:30 AM', pts: 112, people: 'Arathi, Ashma Byju' },
  { id: 'h1', role: 'rider', from: 'Infopark Campus, Kakkanad', to: 'Edappally, Kochi', when: '12 Nov, 5:45 PM', pts: 60, people: 'Ashok' },
];

const mkRider = (p: Person, pickup: string): TripRider => ({
  id: p.id, name: p.name, org: p.org, verified: p.verified, rating: p.rating, points: p.points, pickup, checkedIn: false, pickedUp: false,
});

type Api = {
  trip: TripState;
  /** Rider flow: a driver accepted my request. */
  beginAsRider: (driver: Person, myPickup: string) => void;
  /** Driver flow: a rider accepted my offer. */
  beginAsDriver: (rider: Person, capacity: number) => void;
  addRider: (p: Person) => void;
  startRide: () => void;
  arriveStop: () => void;
  checkIn: (id: string) => void;
  /** Current rider is on board: go to the next stop, or to the drop after the last one. */
  proceed: () => void;
  endRide: () => void;
  reset: () => void;
  history: RideLog[];
  /** Points wallet: starting balance + top-ups + earnings - fares. */
  wallet: number;
  logRide: (r: Omit<RideLog, 'id'>) => void;
  topUp: (pts: number) => void;
};

const Ctx = createContext<Api>(null as unknown as Api);

export const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const [trip, setTrip] = useState<TripState>(empty);
  const [history, setHistory] = useState<RideLog[]>(sampleHistory);
  const [bonus, setBonus] = useState(0);
  // Only rides taken in this session move the wallet; the sample history is already reflected in the starting balance.
  const wallet = START_WALLET + bonus + history.filter(h => !h.cancelled && h.id.startsWith('n')).reduce((a, h) => a + (h.role === 'driver' ? h.pts : -h.pts), 0);
  const patch = (fn: (t: TripState) => Partial<TripState>) => setTrip(t => ({ ...t, ...fn(t) }));

  const api: Api = {
    trip,
    beginAsRider: (driver, myPickup) =>
      setTrip({
        role: 'rider',
        driver,
        stop: 0,
        phase: 'accepted',
        capacity: 1,
        riders: [{ id: 'me', name: 'You', org: '', verified: true, rating: 5, points: driver.points, pickup: myPickup, checkedIn: false, pickedUp: false }],
      }),
    beginAsDriver: (rider, capacity) => setTrip({ role: 'driver', driver: null, stop: 0, phase: 'accepted', capacity, riders: [mkRider(rider, SPOTS[0])] }),
    addRider: p =>
      patch(t => {
        if (t.riders.some(r => r.id === p.id) || t.riders.length >= t.capacity) return {};
        const riders = [...t.riders, mkRider(p, SPOTS[t.riders.length % SPOTS.length])];
        // Everyone was already on board: head back out for the new rider.
        return t.phase === 'toDrop' ? { riders, phase: 'started', stop: riders.length - 1 } : { riders };
      }),
    startRide: () => patch(() => ({ phase: 'started', stop: 0 })),
    arriveStop: () => patch(() => ({ phase: 'atStop' })),
    checkIn: id => patch(t => ({ riders: t.riders.map(r => (r.id === id ? { ...r, checkedIn: true } : r)) })),
    proceed: () =>
      patch(t => {
        const riders = t.riders.map((r, i) => (i === t.stop ? { ...r, checkedIn: true, pickedUp: true } : r));
        return t.stop + 1 < riders.length ? { riders, stop: t.stop + 1, phase: 'started' } : { riders, phase: 'toDrop' };
      }),
    endRide: () => patch(() => ({ phase: 'ended' })),
    reset: () => setTrip(empty),
    history,
    wallet,
    logRide: r => setHistory(h => [{ ...r, id: `n${Date.now()}` }, ...h]),
    topUp: pts => setBonus(b => b + pts),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export const useTrip = () => useContext(Ctx);
