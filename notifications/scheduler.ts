import { Habit } from "@/models/habit";
import { useSettingsStore } from "@/store/settingsStore";
import { useHabitStore } from "@/store/habitStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

const NOTIFICATION_KEY_PREFIX = "habit_notification_";

// ---------------- CANCEL ----------------
export async function cancelHabitNotification(habitId: string) {
  const storedId = await AsyncStorage.getItem(
    NOTIFICATION_KEY_PREFIX + habitId,
  );

  if (storedId) {
    await Notifications.cancelScheduledNotificationAsync(storedId);
    await AsyncStorage.removeItem(NOTIFICATION_KEY_PREFIX + habitId);
  }
}

// ---------------- PERMISSIONS ----------------
export function useNotificationPermissions() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: false },
        });
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    })();
  }, []);
}

// ---------------- TRIGGER BUILDER ----------------
function buildTrigger(habit: Habit) {
  const { unit, interval, startTime } = habit.schedule;
  const now = new Date();

  const [hour, minute] = startTime.split(":").map(Number);

  let next = new Date();
  next.setHours(hour, minute, now.getSeconds(), 0);

  if (habit.lastCompletedAt) {
    next = new Date(habit.lastCompletedAt);
  }

  const intervalMs = (() => {
    switch (unit) {
      case "minutes":
        return interval * 60 * 1000;
      case "hourly":
        return interval * 60 * 60 * 1000;
      case "daily":
        return interval * 24 * 60 * 60 * 1000;
      case "weekly":
        return interval * 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return interval * 30 * 24 * 60 * 60 * 1000;
      case "yearly":
        return interval * 365 * 24 * 60 * 60 * 1000;
    }
  })();

  while (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + intervalMs);
  }

  if (unit === "minutes" || unit === "hourly") {
    const seconds = Math.ceil((next.getTime() - now.getTime()) / 1000);
    return { type: "timeInterval", seconds, repeats: false };
  }

  return {
    type: "calendar",
    hour: next.getHours(),
    minute: next.getMinutes(),
    repeats: false,
  };
}

// ---------------- SCHEDULE ----------------
export async function scheduleHabitNotification(habit: Habit) {
  const { notificationsEnabled } = useSettingsStore.getState();
  if (!notificationsEnabled) return;

  await cancelHabitNotification(habit.id);

  const trigger = buildTrigger(habit);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "TuskIN",
      body: habit.title,
      data: {
        habitId: habit.id,
      },
      sound: "default",
    },
    trigger: trigger as any,
  });

  await AsyncStorage.setItem(
    NOTIFICATION_KEY_PREFIX + habit.id,
    notificationId,
  );

  console.log("[Scheduler] Scheduled:", habit.title);
}

// ---------------- LISTENER (🔥 THIS FIXES YOUR BUTTON) ----------------
export function useHabitNotificationListener() {
  useEffect(() => {
    // App in foreground
    const receivedSub =
      Notifications.addNotificationReceivedListener((notification) => {
        const habitId = notification.request.content.data?.habitId;
        if (!habitId) return;

        useHabitStore.getState().markHabitNotified(habitId as string);
      });

    // App background / killed → user taps notification
    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const habitId =
          response.notification.request.content.data?.habitId;
        if (!habitId) return;

        useHabitStore.getState().markHabitNotified(habitId as string);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
export function registerHabitNotificationListener() {
  Notifications.addNotificationReceivedListener((notification) => {
    const habitId = notification.request.content.data?.habitId;
    if (!habitId) return;

    console.log("[Notify Fired]", habitId);
    useHabitStore.getState().markHabitNotified(habitId as any);
  });
}