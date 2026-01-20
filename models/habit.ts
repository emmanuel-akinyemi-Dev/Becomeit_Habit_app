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
export type HabitType = "ONE_TIME" | "REPEATING" | "SCHEDULED";

export interface Habit {
  id: string;
  title: string;
  habitType?: HabitType;
  schedule: HabitSchedule;
  createdAt: number;
  completedDates: string[];
  streak?: number;
  lastStreakDate?: string;
  tone?: string;
  nextActivationAt?: string;
  lastNotifiedAt?: string;
  lastCompletedAt?: string;
  icon?: string;
  category?:
    | "Health"
    | "Productivity"
    | "Learning"
    | "Mindfulness"
    | "Social"
    | "Other";
}

 
