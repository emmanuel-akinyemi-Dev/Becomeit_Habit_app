export type HabitOccurrence = {
  id: string;
  habitId: string;
  scheduledAt: number;   // exact time user is notified
  windowStart: number;   // when completion is allowed
  windowEnd: number;     // when it expires
  completedAt?: number;
  notificationId?: string;
};