export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

export interface ScheduleResponse {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
}

export interface ExperienceResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;           // minutos
  difficulty: Difficulty;
  price: number;              // COP
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
  schedules: ScheduleResponse[];
  latitude: number;
  longitude: number;
}

export interface ExperienceRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;
  difficulty: Difficulty;
  price: number;
  images?: string[];
  latitude: number;
  longitude: number;
}

export interface ExperienceFilters {
  category?: string | null;
  location?: string | null;
  difficulty?: Difficulty | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  available?: boolean | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // página actual (0-indexed)
  size: number;
}
