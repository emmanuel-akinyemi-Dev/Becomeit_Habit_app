import { Habit, RepeatUnit } from "@/models/habit";

// ---------- Compute next occurrence based on schedule ----------
export function getNextOccurrence(habit: Habit): Date {
  const now = new Date();
  const [hour, minute] = habit.schedule.startTime.split(":").map(Number);

  let next = new Date();
  next.setHours(hour, minute, 0, 0);

  const { interval, unit } = habit.schedule;

  // If next is in the past, calculate the future occurrence
  while (next <= now) {
    switch (unit) {
      case "minutes":
        next.setMinutes(next.getMinutes() + interval);
        break;
      case "hourly":
        next.setHours(next.getHours() + interval);
        break;
      case "daily":
        next.setDate(next.getDate() + interval);
        break;
      case "weekly":
        next.setDate(next.getDate() + interval * 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + interval);
        break;
      case "yearly":
        next.setFullYear(next.getFullYear() + interval);
        break;
    }
  }

  return next;
}

// ---------- Compute next activation (after last completion) ----------
export function getNextActivation(habit: Habit, fromDate?: Date): Date {
  const last = fromDate ? new Date(fromDate) : 
               habit.completedDates.length
                 ? new Date(habit.completedDates[habit.completedDates.length - 1])
                 : new Date();

  const next = new Date(last);

  const { interval, unit } = habit.schedule;
  switch (unit) {
    case "minutes":
      next.setMinutes(next.getMinutes() + interval);
      break;
    case "hourly":
      next.setHours(next.getHours() + interval);
      break;
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + interval * 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next;
}



// ---------- Format countdown text ----------
export function formatCountdown(next: Date, now: Date = new Date()): string {
  const diffMs = next.getTime() - now.getTime();
  if (diffMs <= 0) return "Now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `Next: ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHrs > 0) return `Next: ${diffHrs}h ${diffMin % 60}m`;
  if (diffMin > 0) return `Next: ${diffMin}m`;
  return `Next: ${diffSec}s`;
}

// ---------- Calculate habit metrics ----------
export function calculateMetrics(habits: Habit[]) {
  let totalCompleted = 0;
  let totalExpected = 0;

  const now = new Date();

  habits.forEach((habit) => {
    const completed = habit.completedDates.length;
    totalCompleted += completed;

    // compute total expected clicks since creation
    const start = new Date(habit.createdAt);
    const { interval, unit } = habit.schedule;

    let expected = 0;
    let current = new Date(start);

    while (current <= now) {
      expected++;
      switch (unit) {
        case "minutes":
          current.setMinutes(current.getMinutes() + interval);
          break;
        case "hourly":
          current.setHours(current.getHours() + interval);
          break;
        case "daily":
          current.setDate(current.getDate() + interval);
          break;
        case "weekly":
          current.setDate(current.getDate() + interval * 7);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + interval);
          break;
        case "yearly":
          current.setFullYear(current.getFullYear() + interval);
          break;
      }
    }

    totalExpected += expected;
  });

  const successRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

  const streak =
    habits.length === 0
      ? 0
      : Math.max(...habits.map((h) => h.streak ?? 0));

  return {
    totalCompleted,
    streak,
    successRate,
  };
}


// ---------- Convert interval+unit to milliseconds ----------
export function intervalToMs(interval: number, unit: RepeatUnit) {
  switch (unit) {
    case "minutes":
      return interval * 60 * 1000;
    case "hourly":
      return interval * 3600 * 1000;
    case "daily":
      return interval * 24 * 3600 * 1000;
    case "weekly":
      return interval * 7 * 24 * 3600 * 1000;
    case "monthly":
      return interval * 30 * 24 * 3600 * 1000; // approximate
    case "yearly":
      return interval * 365 * 24 * 3600 * 1000; // approximate
  }
}




