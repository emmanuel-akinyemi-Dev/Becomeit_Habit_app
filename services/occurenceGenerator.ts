import { Habit, HabitOccurrence } from "@/types/habit";
import { endOfDay } from "@/helpers/time";
import { nanoid } from "nanoid/non-secure";

/**
 * Generates today's occurrence for a habit.
 * Safe to call on app launch, foreground, or background open.
 */
export function generateOccurrences(
  habit: Habit,
  today: Date = new Date(),
): HabitOccurrence {
  const scheduled = new Date(today);

  scheduled.setHours(
    habit.time.hour,
    habit.time.minute,
    0,
    0,
  );

  const scheduledAt = scheduled.getTime();

  return {
    id: nanoid(),
    habitId: habit.id,
    scheduledAt,
    windowStart: scheduledAt,
    windowEnd: endOfDay(scheduledAt),
  };
}