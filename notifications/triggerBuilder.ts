// triggers.ts
import { Habit } from "@/models/habit";
import { Platform } from "react-native";
import { computeNextFireDate } from "./utils";

export function buildTrigger(habit: Habit) {
  const { interval, unit } = habit.schedule;

  let seconds = 0;
  switch (unit) {
    case "minutes":
      seconds = interval * 60;
      break;
    case "hourly":
      seconds = interval * 3600;
      break;
    case "daily":
      seconds = interval * 86400;
      break;
    case "weekly":
      seconds = interval * 604800;
      break;
    default:
      seconds = interval * 86400;
  }

  return {
    type: "timeInterval" as const,
    seconds,
    repeats: true,
  };
}

