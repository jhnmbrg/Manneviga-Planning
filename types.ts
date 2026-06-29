export interface Family {
  id: string;
  name: string;
  isMatriarch?: boolean;
}

export interface FamilySelection {
  id: string; // Unique ID for this specific group/sub-family
  familyId: string;
  label?: string; // e.g., "Grandparents", "The Kids"
  adults: number;
  babies: number;
  guests?: string;
  days: number[]; // 0 for Monday, 6 for Sunday
}

export interface House {
  id: string;
  name: string;
  norwegianName: string;
  beds: number;
  description: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  houseId: string;
  week: number;
  familySelections: FamilySelection[];
}

export interface DailyEvent {
  id: string;
  week: number;
  dayIndex: number;
  text: string;
}

export interface TodoTask {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: number;
}

export interface Memory {
  id: string;
  week: number;
  familyId: string;
  authorName: string;
  text: string;
  imageUrl?: string;
  createdAt: number;
}