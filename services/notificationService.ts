// services/notificationService.ts

import { Habit, HabitOccurrence } from "@/types/habit";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleOccurrenceNotification(
  habit: Habit,
  occurrence: HabitOccurrence,
): Promise<string> {
  const trigger = new Date(occurrence.scheduledFor);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: habit.title,
      body: "Tap to mark as completed",
      data: {
        habitId: habit.id,
        occurrenceId: occurrence.id,
      },
    },
    trigger,
  });

  return notificationId;
}
