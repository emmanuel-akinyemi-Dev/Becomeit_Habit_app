/**
 * A habit occurrence has a fixed completion window.
 * The window is deterministic and does NOT depend on repeat units.
 *
 * Example:
 * - Notification at 08:00
 * - Completion window: 08:00 → 23:59 same day
 */

export function getOccurrenceWindow(
  scheduledAt: number,
): { windowStart: number; windowEnd: number } {
  const windowStart = scheduledAt;

  const date = new Date(scheduledAt);

  // End of the same day (23:59:59.999)
  date.setHours(23, 59, 59, 999);

  const windowEnd = date.getTime();

  return { windowStart, windowEnd };
}