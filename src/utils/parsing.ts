import { Converter, ParsedAmount } from '../types';
import { UNIT_SYNONYMS } from '../constants';

export function toNumber(s: any): number {
  if (s == null) return NaN;
  const t = String(s).trim().replace(/,/g, '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : NaN;
}

function tokenizeAmount(str: string) {
  const tokens: Array<{ type: string; val: string }> = [];
  let cur = "";
  let mode: string | null = null;
  
  const push = (type: string | null, val: string) => {
    if (val !== "" && val != null) tokens.push({ type: type || '', val: String(val) });
  };
  
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const isDigit = (ch >= '0' && ch <= '9') || ch === '.' || ch === ',';
    const isLetter = /[a-zA-ZåäöÅÄÖ]/.test(ch);
    
    if (isDigit) {
      if (mode !== 'num') { push(mode, cur); cur = ""; mode = 'num'; }
      cur += ch;
    } else if (isLetter) {
      if (mode !== 'word') { push(mode, cur); cur = ""; mode = 'word'; }
      cur += ch;
    } else if (ch === ':') {
      push(mode, cur); cur = ":"; push('colon', cur); cur = ""; mode = null;
    } else {
      push(mode, cur); cur = ""; mode = null;
    }
  }
  push(mode, cur);
  return tokens.filter(t => t && t.val !== '');
}

export function getFactor(converters: Converter[], type: string, unit: string): number {
  const c = converters.find(c => c.type === type && c.unit === unit);
  return c ? c.factorToBase : 1;
}

function parseTimeAmount(str: string): ParsedAmount | null {
  if (str.includes(':')) {
    const parts = str.split(':').map(p => toNumber(p));
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      const h = parts[0] || 0, m = parts[1] || 0, s = (parts[2] || 0);
      return { value: h + m / 60 + s / 3600, unit: 'Hours' };
    }
  }
  
  const tokens = tokenizeAmount(str);
  let hours = 0, minutes = 0, seconds = 0;
  let matched = false;
  
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'num') {
      const num = toNumber(t.val);
      if (!Number.isFinite(num)) continue;
      const nxt = tokens[i + 1];
      if (nxt && nxt.type === 'word') {
        const canon = UNIT_SYNONYMS.Time[nxt.val as keyof typeof UNIT_SYNONYMS.Time] || null;
        if (canon === 'Hours') { hours += num; matched = true; i++; continue; }
        if (canon === 'Minutes') { minutes += num; matched = true; i++; continue; }
        if (canon === 'Seconds') { seconds += num; matched = true; i++; continue; }
      } else {
        minutes += num; matched = true;
      }
    }
  }
  if (!matched) return null;
  return { value: hours + minutes / 60 + seconds / 3600, unit: 'Hours' };
}

function parseDistanceAmount(str: string, converters: Converter[]): ParsedAmount | null {
  const tokens = tokenizeAmount(str);
  let km = 0;
  let matched = false;
  
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'num') continue;
    const num = toNumber(t.val);
    if (!Number.isFinite(num)) continue;
    const nxt = tokens[i + 1];
    if (nxt && nxt.type === 'word') {
      const canon = UNIT_SYNONYMS.Distance[nxt.val as keyof typeof UNIT_SYNONYMS.Distance] || null;
      if (canon) {
        km += num * getFactor(converters, 'Distance', canon);
        matched = true;
        i++;
        continue;
      }
    }
    km += num * getFactor(converters, 'Distance', 'Meters');
    matched = true;
  }
  if (!matched) return null;
  return { value: km, unit: 'Km' };
}

function parseCountAmount(str: string): ParsedAmount | null {
  const tokens = tokenizeAmount(str);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'num') {
      const n = parseInt(t.val.replace(',', '.'), 10);
      if (Number.isFinite(n)) return { value: n, unit: 'Times' };
    }
  }
  return null;
}

export function parseAmountByType(input: string, type: string, converters: Converter[]): ParsedAmount | null {
  if (!input || !String(input).trim()) return null;
  const str = String(input).trim().toLowerCase();
  
  if (type === 'Time') return parseTimeAmount(str);
  if (type === 'Distance') return parseDistanceAmount(str, converters);
  if (type === 'Count') return parseCountAmount(str);
  return null;
}

export function amountPlaceholderByType(type: string): string {
  if (type === 'Time') return "e.g., 1h 30m, 90min, 1:30";
  if (type === 'Distance') return "e.g., 5km, 3.2mi, 1500m";
  if (type === 'Count') return "e.g., 5, 12x, 3 times";
  return "e.g., 1h 30m";
}