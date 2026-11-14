import React, { createContext, useContext, useState } from 'react';

export type VehicleKind = 'car' | 'bike';
export type Vehicle = {
  id: string;
  kind: VehicleKind;
  make: string;
  model: string;
  reg: string;
  color: string;
  colorHex: string;
  /** Seats the driver can offer (not counting the driver). */
  seats: number;
  status: 'verified' | 'pending';
};

export const MAKES: Record<VehicleKind, string[]> = {
  car: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'Renault'],
  bike: ['Honda', 'TVS', 'Bajaj', 'Hero', 'Royal Enfield', 'Yamaha', 'Suzuki'],
};

export const COLORS: { name: string; hex: string }[] = [
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Silver', hex: '#B8BCC2' },
  { name: 'Black', hex: '#1B1B1B' },
  { name: 'Grey', hex: '#6B7075' },
  { name: 'Red', hex: '#C62828' },
  { name: 'Blue', hex: '#1F5FBF' },
  { name: 'Brown', hex: '#7B5A3B' },
  { name: 'Yellow', hex: '#F2C230' },
];

export const vehicleName = (v: Vehicle) => `${v.model} · ${v.reg}`;

const initial: Vehicle[] = [
  { id: 'v1', kind: 'car', make: 'Maruti Suzuki', model: 'Swift', reg: 'KL 07 AB 1234', color: 'White', colorHex: '#F5F5F5', seats: 3, status: 'verified' },
  { id: 'v2', kind: 'bike', make: 'Honda', model: 'Activa', reg: 'KL 07 CD 5678', color: 'Grey', colorHex: '#6B7075', seats: 1, status: 'verified' },
];

type Ctx = {
  vehicles: Vehicle[];
  active?: Vehicle;
  select: (id: string) => void;
  add: (v: Omit<Vehicle, 'id' | 'status'>, makeActive: boolean) => void;
  remove: (id: string) => void;
};

const GarageCtx = createContext<Ctx>({ vehicles: [], select: () => {}, add: () => {}, remove: () => {} });

export const GarageProvider = ({ children }: { children: React.ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initial);
  const [activeId, setActiveId] = useState<string | undefined>('v1');
  const active = vehicles.find(v => v.id === activeId) ?? vehicles[0];

  const add: Ctx['add'] = (v, makeActive) => {
    const id = `v${Date.now()}`;
    setVehicles(list => [...list, { ...v, id, status: 'pending' }]);
    if (makeActive || !active) setActiveId(id);
  };
  const remove = (id: string) => {
    const next = vehicles.filter(v => v.id !== id);
    setVehicles(next);
    if (id === active?.id) setActiveId(next[0]?.id);
  };
  return <GarageCtx.Provider value={{ vehicles, active, select: setActiveId, add, remove }}>{children}</GarageCtx.Provider>;
};

export const useGarage = () => useContext(GarageCtx);
