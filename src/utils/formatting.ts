import { Converter } from '../types';
import { UNIT_SHORT } from '../constants';
import { getFactor } from './parsing';

export function humanizeTime(hours: number): string {
  if (hours == null || isNaN(hours)) return "";
  if (hours === 0) return "0 min";
  
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function humanizeDistance(km: number): string {
  if (km == null || isNaN(km)) return "";
  const totalM = Math.round(km * 1000);
  const k = Math.floor(totalM / 1000);
  const m = totalM % 1000;
  return k === 0 ? `${m} m` : `${k} km ${m} m`;
}

export function formatSingleUnit(type: string, valueInBase: number, unit: string, converters: Converter[]): string {
  if (type === 'Time') {
    // For time, always display in natural h/min format regardless of storage unit
    return humanizeTime(valueInBase);
  }

  const factor = getFactor(converters, type, unit) || 1;
  const amount = valueInBase / factor;
  const label = UNIT_SHORT[unit as keyof typeof UNIT_SHORT] || unit;

  if (type === 'Distance') return `${Math.round(amount * 100) / 100} ${label}`;
  if (type === 'Count') {
    const n = Math.round(amount);
    return `${n} ${n === 1 ? 'time' : 'times'}`;
  }
  return `${amount} ${label}`;
}

export function formatDistanceDisplay(value: string): string {
  if (!value) return value;

  const trimmed = value.trim();
  const numericValue = parseFloat(trimmed);

  if (isNaN(numericValue)) {
    return value;
  }

  if (trimmed === numericValue.toString()) {
    if (numericValue >= 1000) {
      return `${numericValue / 1000}km`;
    } else {
      return `${numericValue}m`;
    }
  }

  return value;
}

export function formatDurationDisplay(value: string): string {
  if (!value) return value;

  const trimmed = value.trim();
  const numericValue = parseFloat(trimmed);

  if (isNaN(numericValue)) {
    return value;
  }

  if (trimmed === numericValue.toString()) {
    const totalMinutes = numericValue;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  return value;
}