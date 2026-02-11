/**
 * Returns an array of booleans representing
 * completed days from Monday → Sunday.
 *
 * Input:
 *  - completionDates: ISO date strings (e.g. "2026-02-05")
 *
 * Output:
 *  - [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 */
export function getWeeklyCompletion(
  completionDates: string[],
): boolean[] {
  if (!completionDates || completionDates.length === 0) {
    return Array(7).fill(false);
  }

  const today = new Date();

  // Start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const completedDays = new Set<number>();

  for (const dateStr of completionDates) {
    const d = new Date(dateStr);

    if (isNaN(d.getTime())) continue;

    if (d >= startOfWeek && d <= today) {
      // Convert JS Sunday=0 → Monday=0
      const weekdayIndex = (d.getDay() + 6) % 7;
      completedDays.add(weekdayIndex);
    }
  }

  return Array.from({ length: 7 }, (_, i) => completedDays.has(i));
}