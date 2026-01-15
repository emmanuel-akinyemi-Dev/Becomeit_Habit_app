export type RepeatUnit =
  | "minutes"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";
 
  
export interface HabitSchedule {
  unit: RepeatUnit;
  interval: number; // every X units
  startTime: string; // "HH:mm"
}

export interface Habit {
  id: string;
  title: string;
  schedule: HabitSchedule;
  createdAt: number;
  completedDates: string[];
  tone?: string; 
}
