import { Category, Converter } from './types';

export const STORAGE_KEY = "dj_pro_v3";

export const WHOP_PAID_URL = "https://whop.com/checkout/plan_2XmKrYfV9RrsB";
export const WHOP_TRIAL_URL = "https://whop.com/checkout/plan_Wwet4zcOCzriu";

export const openWhopPaid = () => {
  window.open(WHOP_PAID_URL, "_blank");
};

export const openWhopTrial = () => {
  window.open(WHOP_TRIAL_URL, "_blank");
};

export const DEFAULT_CONVERTERS: Converter[] = [
  { unit: "Hours", type: "Time", baseUnit: "Hours", factorToBase: 1 },
  { unit: "Minutes", type: "Time", baseUnit: "Hours", factorToBase: 0.017 },
  { unit: "Km", type: "Distance", baseUnit: "Km", factorToBase: 1 },
  { unit: "Meters", type: "Distance", baseUnit: "Km", factorToBase: 0.001 },
  { unit: "Miles", type: "Distance", baseUnit: "Km", factorToBase: 1.60934 },
  { unit: "Times", type: "Count", baseUnit: "Times", factorToBase: 1 },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Work", type: "Time", displayUnit: "Auto" },
  { name: "Running", type: "Distance", displayUnit: "Auto" },
  { name: "Reading", type: "Time", displayUnit: "Auto" },
  { name: "Study", type: "Time", displayUnit: "Auto" },
  { name: "Tasks", type: "Count", displayUnit: "Auto" },
  { name: "Exercise", type: "Count", displayUnit: "Auto" },
];

export const TYPE_BASE = {
  Time: "Hours",
  Distance: "Km",
  Count: "Times",
  Weight: "Kg"
};

export const TYPES = Object.keys(TYPE_BASE);

export const UNIT_SHORT = { 
  Hours: 'h', 
  Minutes: 'min', 
  Km: 'km', 
  Meters: 'm', 
  Miles: 'mi', 
  Times: '×'
};

export const UNIT_SYNONYMS = {
  Time: { 
    h: "Hours", hr: "Hours", hrs: "Hours", hour: "Hours", hours: "Hours", 
    m: "Minutes", min: "Minutes", mins: "Minutes", minute: "Minutes", minutes: "Minutes"
  },
  Distance: { 
    km: "Km", kilometer: "Km", kilometers: "Km", kilometre: "Km", kilometres: "Km", 
    m: "Meters", meter: "Meters", meters: "Meters", metre: "Meters", metres: "Meters", 
    mi: "Miles", mile: "Miles", miles: "Miles" 
  },
  Count: { 
    x: "Times", time: "Times", times: "Times" 
  },
};