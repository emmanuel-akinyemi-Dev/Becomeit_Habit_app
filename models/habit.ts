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
  lastNotifiedAt?: any;
  lastCompletedAt?: any;
  lastNotificationId:string |undefined;
  icon?: string;
  notificationCount: number; // total opportunities
  completedCount: number; // successful clicks (can = completedDates.length)
  isMastered: boolean;
  category?:
    | "Health"
    | "Productivity"
    | "Learning"
    | "Mindfulness"
    | "Social"
    | "Other";

  /** runtime only: button enabled when true (notification fired) */
  due?: boolean;
  pendingCompletions:number
}

export interface HabitStats {
  totalCompletions: number;
  totalOpportunities: number;
  completionDates: string[]; // ISO dates
}
