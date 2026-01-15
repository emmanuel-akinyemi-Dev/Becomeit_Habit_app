import * as Notifications from "expo-notifications";
import { Habit } from "../models/habit";
import { FixedNotificationTrigger } from "@/types/notification";

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleHabitNotification(habit: Habit) {
  const trigger = buildTrigger(habit);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "BecomeIt",
      body: habit.title,
      sound: true,
    },
    trigger: trigger as any,
  });
}

// ------------------------

function buildTrigger(habit: Habit): FixedNotificationTrigger {
  const { unit, interval, startTime } = habit.schedule;

  const [hour, minute] = startTime.split(":").map(Number);

  const now = new Date();
  const start = new Date();
  start.setHours(hour, minute, 0, 0);

  if (start < now) {
    start.setDate(start.getDate() + 1);
  }

  switch (unit) {
    case "minutes":
      return {
        type: "timeInterval",
        seconds: interval * 60,
        repeats: true,
      };

    case "hourly":
      return {
        type: "timeInterval",
        seconds: interval * 3600,
        repeats: true,
      };

    case "daily":
      return {
        type: "calendar",
        hour,
        minute,
        repeats: true,
      };

    case "weekly":
      return {
        type: "calendar",
        weekday: start.getDay() + 1,
        hour,
        minute,
        repeats: true,
      };

    case "monthly":
      return {
        type: "calendar",
        day: start.getDate(),
        hour,
        minute,
        repeats: true,
      };

    case "yearly":
      return {
        type: "calendar",
        month: start.getMonth() + 1,
        day: start.getDate(),
        hour,
        minute,
        repeats: true,
      };
  }
}
