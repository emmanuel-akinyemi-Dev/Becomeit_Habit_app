/**
 * Time helpers used across the app.
 * No repeat units. No interval guessing.
 * All scheduling is explicit.
 */

/**
 * Returns the start of the day (00:00)
 */
export function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Returns the end of the day (23:59:59.999)
 */
export function endOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Adds N days to a timestamp
 */
export function addDays(timestamp: number, days: number): number {
  const d = new Date(timestamp);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/**
 * Adds N hours to a timestamp
 */
export function addHours(timestamp: number, hours: number): number {
  return timestamp + hours * 60 * 60 * 1000;
}

/**
 * Adds N minutes to a timestamp
 */
export function addMinutes(timestamp: number, minutes: number): number {
  return timestamp + minutes * 60 * 1000;
}