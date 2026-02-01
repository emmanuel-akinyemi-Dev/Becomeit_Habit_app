import { Habit } from "@/models/habit";

export function computeNextFireDate(habit: Habit) {
  const { interval, unit, startTime } = habit.schedule;
  const [hour, minute] = startTime.split(":").map(Number);

  let next = habit.lastNotifiedAt
    ? new Date(habit.lastNotifiedAt)
    : new Date();

  next.setHours(hour, minute, 0, 0);

  let ms = 0;
  switch (unit) {
    case "minutes":
      ms = interval * 60_000;
      break;
    case "hourly":
      ms = interval * 3_600_000;
      break;
    case "daily":
      ms = interval * 86_400_000;
      break;
    case "weekly":
      ms = interval * 604_800_000;
      break;
    case "monthly":
      ms = interval * 2_592_000_000;
      break;
    case "yearly":
      ms = interval * 31_536_000_000;
      break;
  }

  while (next <= new Date()) {
    next = new Date(next.getTime() + ms);
  }

  return next;
}
