
import { Family, House } from './types';

export const FAMILIES: Family[] = [
  { id: 'matriarch', name: 'Astri', isMatriarch: true },
  { id: 'f1', name: 'Torrey' },
  { id: 'f2', name: 'John' },
  { id: 'f3', name: 'Åse' },
  { id: 'f4', name: 'Paul' },
  { id: 'f5', name: 'Liv' },
  { id: 'f6', name: 'Eva' },
  { id: 'f7', name: 'Ruth' }
];

export const HOUSES: House[] = [
  { 
    id: 'h1', 
    name: 'Top Cabin', 
    norwegianName: 'Topstua', 
    beds: 20, 
    description: 'Traditional red timber house standing tall with a view over the entire bay.',
    imageUrl: 'https://images.unsplash.com/photo-1549420042-8709339e9447?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'h2', 
    name: 'White House', 
    norwegianName: 'Hovedstua', 
    beds: 16, 
    description: 'Classic 19th-century white wooden house, the heart of the family estate.',
    imageUrl: 'https://images.unsplash.com/photo-1493906253751-2c21960249c1?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'h3', 
    name: 'Skipbua', 
    norwegianName: 'Skipbua', 
    beds: 10, 
    description: 'A cozy, red-painted dockside house where the waves lap against the floorboards.',
    imageUrl: 'https://images.unsplash.com/photo-1558236714-d118ef660e51?auto=format&fit=crop&q=80&w=800'
  }
];

export const WEEKS = Array.from({ length: 12 }, (_, i) => 24 + i);

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TASK_CATEGORIES = [
  "Boats & Outboards",
  "White House (Hovedstua)",
  "Top Cabin (Topstua)",
  "Skipbua",
  "Pier & Outdoors",
  "General Maintenance"
];

// Selectable planning seasons: 2026 through 2031 (2026 plus five years forward).
export const YEARS: number[] = Array.from({ length: 6 }, (_, i) => 2026 + i);

// The summer season runs weeks 24–35 (June–early September). Show the current
// year's season through the summer, then roll forward to next year once it's over,
// so the dates always point at the upcoming season without any manual updating.
export const getSeasonYear = (): number => {
  const now = new Date();
  return now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
};

const getWeekMondaySunday = (week: number, year: number) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  // ISO week 1 is the week with the first Thursday of the year.
  const dayOfWeek = firstDayOfYear.getDay(); // 0 (Sun) to 6 (Sat)
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const firstMonday = new Date(year, 0, 1 + (isoDay <= 4 ? 1 - isoDay : 8 - isoDay));
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + daysOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Full, readable range — e.g. "9–15 June 2026" or "29 June – 5 July 2026".
export const getWeekDateRange = (week: number, year: number = getSeasonYear()): string => {
  const { monday, sunday } = getWeekMondaySunday(week, year);
  const dM = monday.getDate();
  const dS = sunday.getDate();
  if (monday.getMonth() === sunday.getMonth()) {
    return `${dM}–${dS} ${MONTHS[monday.getMonth()]} ${year}`;
  }
  return `${dM} ${MONTHS[monday.getMonth()]} – ${dS} ${MONTHS[sunday.getMonth()]} ${year}`;
};

// Compact label for small buttons — e.g. "9 Jun".
export const getWeekShortLabel = (week: number, year: number = getSeasonYear()): string => {
  const { monday } = getWeekMondaySunday(week, year);
  return `${monday.getDate()} ${MONTHS_SHORT[monday.getMonth()]}`;
};

export const THEME = {
  primary: "bg-sky-900",
  secondary: "bg-teal-600",
  accent: "bg-amber-50",
  textPrimary: "text-sky-950",
  textSecondary: "text-teal-700",
  border: "border-sky-100",
  hover: "hover:bg-sky-50"
};
