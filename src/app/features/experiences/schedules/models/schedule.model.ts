export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

export interface ScheduleRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;   // HH:mm format
  endTime: string;     // HH:mm format
  availableSlots: number;
}

export interface ScheduleResponse {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;   // HH:mm format
  endTime: string;     // HH:mm format
  availableSlots: number;
}

/**
 * Sorts schedules by day-of-week index (MONDAY=0 through SUNDAY=6) ascending,
 * then by startTime string comparison ascending (works correctly for HH:mm 24-hour format).
 */
export function sortSchedules(schedules: ScheduleResponse[]): ScheduleResponse[] {
  return [...schedules].sort((a, b) => {
    const dayIndexA = DAYS_OF_WEEK.indexOf(a.dayOfWeek);
    const dayIndexB = DAYS_OF_WEEK.indexOf(b.dayOfWeek);

    if (dayIndexA !== dayIndexB) {
      return dayIndexA - dayIndexB;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}
