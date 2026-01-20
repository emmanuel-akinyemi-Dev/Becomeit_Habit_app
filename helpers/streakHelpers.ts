import { Habit } from "@/models/habit";

/**
 * Returns an array of booleans representing
 * completed days from Monday → Sunday
 */
export function getWeeklyCompletion(habits: Habit[]): boolean[] {
  if (!habits || habits.length === 0) {
    return Array(7).fill(false);
  }

  const today = new Date();

  // Monday as start of week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const completedDays = new Set<number>();

  habits.forEach((habit) => {
    if (!Array.isArray(habit.completedDates)) return;

    habit.completedDates.forEach((dateStr) => {
      const d = new Date(dateStr);
      if (d >= startOfWeek && d <= today) {
        const weekdayIndex = (d.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
        completedDays.add(weekdayIndex);
      }
    });
  });

  return Array.from({ length: 7 }, (_, i) => completedDays.has(i));
}
