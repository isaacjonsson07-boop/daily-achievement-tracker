export function startOfMonth(d = new Date()) { 
  return new Date(d.getFullYear(), d.getMonth(), 1); 
}

export function endOfMonth(d = new Date()) { 
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); 
}

export function fmtDateISO(d: Date) { 
  const dt = new Date(d); 
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`; 
}

export function uid() { 
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; 
}

export function round(n: number, dp = 2) { 
  const p = 10 ** dp; 
  return Math.round((n + Number.EPSILON) * p) / p; 
}

export function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}