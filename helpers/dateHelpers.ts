// src/helpers/dateHelpers.ts

import { Habit } from "@/types/habit";

/**
 * Compute how many times a habit should have fired since creation or a given timestamp.
 */
export function computeScheduledOccurrences(
  habit: Habit,
  since?: number,
): number {
  const startTime = since ?? habit.createdAt;
  const now = Date.now();
  const schedule = habit.schedule;

  let intervalMs = 0;
  switch (schedule.unit) {
    case "minutes":
      intervalMs = schedule.interval * 60_000;
      break;
    case "hourly":
      intervalMs = schedule.interval * 3_600_000;
      break;
    case "daily":
      intervalMs = schedule.interval * 86_400_000;
      break;
    case "weekly":
      intervalMs = schedule.interval * 604_800_000;
      break;
    case "monthly":
      intervalMs = schedule.interval * 2_592_000_000;
      break;
    case "yearly":
      intervalMs = schedule.interval * 31_536_000_000;
      break;
    default:
      intervalMs = schedule.interval * 86_400_000;
  }

  const occurrences = Math.floor((now - startTime) / intervalMs);
  return occurrences > 0 ? occurrences : 0;
}

/**
 * Compute the next fire date for a habit.
 */

export function computeNextFireDate(habit: Habit): Date {
  const now = new Date();
  const { interval, unit, startTime } = habit.schedule;

  let base = now;

  // If a startTime is defined (e.g. "09:00"), anchor to that time today
  if (startTime && (unit === "daily" || unit === "weekly")) {
    const [hours, minutes] = startTime.split(":").map(Number);
    base = new Date(now);
    base.setHours(hours, minutes, 0, 0);

    // If that time has already passed today, move to tomorrow
    if (base.getTime() <= now.getTime()) {
      if (unit === "daily") {
        base.setDate(base.getDate() + interval);
      } else if (unit === "weekly") {
        base.setDate(base.getDate() + interval * 7);
      }
    }
    return base;
  }

  // Fallback: interval from now
  let intervalMs = 0;
  switch (unit) {
    case "minutes":
      intervalMs = interval * 60_000;
      break;
    case "hourly":
      intervalMs = interval * 3_600_000;
      break;
    case "daily":
      intervalMs = interval * 86_400_000;
      break;
    case "weekly":
      intervalMs = interval * 604_800_000;
      break;
    case "monthly":
      intervalMs = interval * 2_592_000_000;
      break;
    case "yearly":
      intervalMs = interval * 31_536_000_000;
      break;
  }

  return new Date(now.getTime() + intervalMs);
}
