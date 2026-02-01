// scheduler.ts
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "@/models/habit";
import { buildTrigger } from "./triggerBuilder";

const KEY_PREFIX = "habit_notification_";

export async function cancelHabitNotification(habitId: string) {
  const id = await AsyncStorage.getItem(KEY_PREFIX + habitId);
  if (!id) return;

  await Notifications.cancelScheduledNotificationAsync(id);
  await AsyncStorage.removeItem(KEY_PREFIX + habitId);
}

export async function scheduleHabitNotification(habit: Habit) {
  await cancelHabitNotification(habit.id);

  if (habit.isMastered) return; // skip mastered habits

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: habit.title,
      sound: "default",
      data: { habitId: habit.id },
    },
    trigger: buildTrigger(habit) as any,
  });

  await AsyncStorage.setItem(KEY_PREFIX + habit.id, notificationId);
  return notificationId;
}
