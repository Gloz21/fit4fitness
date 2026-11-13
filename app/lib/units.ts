import { userStore, useUserStore } from './userStore';

export type UnitSystem = 'imperial' | 'metric';
export type WeightUnit = 'lbs' | 'kg';

export const DEFAULT_UNITS: UnitSystem = 'imperial';

const LB_PER_KG = 2.20462;
const CM_PER_IN = 2.54;

export function weightUnitFor(system: UnitSystem): WeightUnit {
  return system === 'metric' ? 'kg' : 'lbs';
}

// ---- Body weight (stored in kg) ----

export function kgToDisplay(kg: number, system: UnitSystem): number {
  return system === 'metric' ? kg : kg * LB_PER_KG;
}

export function displayToKg(value: number, system: UnitSystem): number {
  return system === 'metric' ? value : value / LB_PER_KG;
}

export function formatBodyWeight(kg: number | undefined, system: UnitSystem): string {
  if (!kg) return '—';
  return `${kgToDisplay(kg, system).toFixed(1)} ${weightUnitFor(system)}`;
}

// ---- Height (stored in cm) ----

export function cmToFeetInches(cm: number): { ft: number; inch: number } {
  const totalIn = Math.round(cm / CM_PER_IN);
  return { ft: Math.floor(totalIn / 12), inch: totalIn % 12 };
}

export function feetInchesToCm(ft: number, inch: number): number {
  return (ft * 12 + inch) * CM_PER_IN;
}

export function formatHeight(cm: number | undefined, system: UnitSystem): string {
  if (!cm) return '—';
  if (system === 'metric') return `${Math.round(cm)} cm`;
  const { ft, inch } = cmToFeetInches(cm);
  return `${ft}' ${inch}"`;
}

// ---- Lifting loads (each set carries its own unit) ----

/** Convert a load between lbs and kg, rounded to a plate-friendly step. */
export function convertLoad(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to || !value) return value;
  if (to === 'kg') return Math.round((value / LB_PER_KG) * 2) / 2; // nearest 0.5 kg
  return Math.round(value * LB_PER_KG); // nearest 1 lb
}

/** Convert a load to the given system without rounding (for volume totals). */
export function loadIn(value: number, from: WeightUnit | undefined, system: UnitSystem): number {
  const src = from ?? 'lbs';
  const target = weightUnitFor(system);
  if (src === target) return value;
  return target === 'kg' ? value / LB_PER_KG : value * LB_PER_KG;
}

export function formatVolume(valueInSystem: number, system: UnitSystem): string {
  return `${Math.round(valueInSystem).toLocaleString()} ${weightUnitFor(system)}`;
}

// ---- Preference ----

export function getUnits(): UnitSystem {
  return userStore.getState().profile.units ?? DEFAULT_UNITS;
}

export function setUnits(system: UnitSystem) {
  userStore.setProfile({ units: system });
}

export function useUnits(): UnitSystem {
  const { profile } = useUserStore();
  return profile.units ?? DEFAULT_UNITS;
}
