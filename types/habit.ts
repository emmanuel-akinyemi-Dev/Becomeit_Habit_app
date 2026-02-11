export type HabitId = string;
export type OccurrenceId = string;

export interface Habit {
  id: HabitId;
  title: string;
  icon?: string;
 
  time: {
    hour: number;
    minute: number;
  };

  createdAt: number;
  archived?: boolean;
}

export interface HabitOccurrence {
  id: OccurrenceId;
  habitId: HabitId;
 
  scheduledAt: number;
 
  windowStart: number;
  windowEnd: number;
 
  completedAt?: number;
}