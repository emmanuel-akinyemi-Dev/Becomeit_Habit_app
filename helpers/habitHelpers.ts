import { Habit, RepeatUnit } from "@/models/habit";

/* =========================================================
   NEXT OCCURRENCE (notification scheduling)
   ========================================================= */

export function getNextOccurrence(habit: Habit): Date {
  const now = new Date();
  const [hour, minute] = habit.schedule.startTime.split(":").map(Number);

  let next = new Date();
  next.setHours(hour, minute, 0, 0);

  const { interval, unit } = habit.schedule;

  // Always move forward
  while (next <= now) {
    advanceDate(next, interval, unit);
  }

  return next;
}

/* =========================================================
   NEXT ACTIVATION (after completion)
   Source of truth:
   - lastCompletedAt
   - nextActivationAt
   ========================================================= */

export function getNextActivation(
  habit: Habit,
  fromDate?: Date,
): Date {
  const base =
    fromDate ??
    (habit.lastCompletedAt
      ? new Date(habit.lastCompletedAt)
      : new Date());

  const next = new Date(base);
  advanceDate(next, habit.schedule.interval, habit.schedule.unit);

  return next;
}

/* =========================================================
   DATE ADVANCER (shared logic)
   ========================================================= */

function advanceDate(
  date: Date,
  interval: number,
  unit: RepeatUnit,
) {
  switch (unit) {
    case "minutes":
      date.setMinutes(date.getMinutes() + interval);
      break;
    case "hourly":
      date.setHours(date.getHours() + interval);
      break;
    case "daily":
      date.setDate(date.getDate() + interval);
      break;
    case "weekly":
      date.setDate(date.getDate() + interval * 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + interval);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + interval);
      break;
  }
}

/* =========================================================
   COUNTDOWN DISPLAY (UI ONLY)
   ========================================================= */

export function formatCountdown(
  next: Date,
  now: Date = new Date(),
): string {
  const diffMs = next.getTime() - now.getTime();
  if (diffMs <= 0) return "Now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0)
    return `Next: ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHrs > 0)
    return `Next: ${diffHrs}h ${diffMin % 60}m`;
  if (diffMin > 0)
    return `Next: ${diffMin}m`;

  return `Next: ${diffSec}s`;
}

/* =========================================================
   INTERVAL → MILLISECONDS
   (used for timers / background checks)
   ========================================================= */

export function intervalToMs(
  interval: number,
  unit: RepeatUnit,
): number {
  switch (unit) {
    case "minutes":
      return interval * 60 * 1000;
    case "hourly":
      return interval * 60 * 60 * 1000;
    case "daily":
      return interval * 24 * 60 * 60 * 1000;
    case "weekly":
      return interval * 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return interval * 30 * 24 * 60 * 60 * 1000; // approximation
    case "yearly":
      return interval * 365 * 24 * 60 * 60 * 1000; // approximation
  }
}
export function calculateAccuracy(
  totalCompletions: number,
  totalOpportunities: number,
): number {
  if (totalOpportunities <= 0) return 0;

  return Math.round(
    (totalCompletions / totalOpportunities) * 100,
  );
}

// ---------- Stats helpers (UI-safe, derived only) ----------

export function getTotalCompleted(stats: {
  totalCompletions: number;
}): number {
  return stats.totalCompletions ?? 0;
}

export function calculateAccuracyFromStats(stats: {
  totalCompletions: number;
  totalOpportunities: number;
}): number {
  if (!stats.totalOpportunities) return 0;

  return Math.round(
    (stats.totalCompletions / stats.totalOpportunities) * 100,
  );
}


// ---------- Completion guard ----------
export function canCompleteHabit(habit: {
  lastNotifiedAt?: number;
  lastCompletedAt?: number;
}): boolean {
  // Never notified → cannot complete
  if (!habit.lastNotifiedAt) return false;

  // Never completed → allowed
  if (!habit.lastCompletedAt) return true;

  // Allow only if completion is BEFORE last notification
  return habit.lastCompletedAt < habit.lastNotifiedAt;
}
